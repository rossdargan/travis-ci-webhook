var http = require('http')
var createHandler = require('travisci-webhook-handler')
var handler = createHandler({ path: process.env.WEBHOOK_PATH, public_key: '-----BEGIN PUBLIC KEY----- MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvtjdLkS+FP+0fPC09j25 y/PiuYDDivIT86COVedvlElk99BBYTrqNaJybxjXbIZ1Q6xFNhOY+iTcBr4E1zJu tizF3Xi0V9tOuP/M8Wn4Y/1lCWbQKlWrNQuqNBmhovF4K3mDCYswVbpgTmp+JQYu Bm9QMdieZMNry5s6aiMA9aSjDlNyedvSENYo18F+NYg1J0C0JiPYTxheCb4optr1 5xNzFKhAkuGs4XTOA5C7Q06GCKtDNf44s/CVE30KODUxBi0MCKaxiXw/yy55zxX2 /YdGphIyQiA5iO1986ZmZCLLW8udz9uhW5jUr3Jlp9LbmphAC61bVSf4ou2YsJaN 0QIDAQAB -----END PUBLIC KEY-----'})
const hooks = require('./scripts')
const pathJoin = require('path').join
const spawnSync = require('child_process').spawnSync
const fileExists = require('file-exists').sync
 
http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 200
    res.end('hello world!')
  })
}).listen(7777)
 
handler.on('error', function (err) {
  console.error('Error:', err.message)
})
 
handler.on('success', function (event) {
  const payload = event.payload;
  console.log('Build %s success for %s branch %s. This is of type %s',
    event.payload.number,
    event.payload.repository.name,
    event.payload.branch,
    event.payload.type)
  const script = hooks[`${payload.repository.owner_name}/${payload.repository.name}/${payload.branch}/${payload.type}`]
  if(script){
    const scriptsPath = pathJoin(__dirname, './scripts/')
    let cmd, args;
    [cmd, ...args] = script.split(' ')

    const filePath = scriptsPath + cmd

    if (!fileExists(filePath)) {
      console.error(`File: ${filePath} does not exist`)
    } else {
      spawnSync(filePath, args, {stdio: 'inherit'})
    }
  }
})
 
handler.on('failure', function (event) {
    console.log('Build failed!')
})
 
handler.on('start', function (event) {
    console.log('Build started!')
})
