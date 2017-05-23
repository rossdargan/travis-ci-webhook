##Travis CI Webhook
This is a docker container that allows you to process webhook calls from travis.

instructions to follow, but the brief gist is run like this:

docker run -d \
  -p 7777:7777 \
  -v /$(PWD)/scripts:/usr/src/app/scripts \
  --name travis-ci-webhook \
rossdargan/travis-ci-webhook


In the scripts volume have a file like this:-

```
'use strict'

module.exports = {
  'rossdargan/hass-config': 'test.sh hass', // namespace/repo_name : script <args>
}
```

Note replace the `rossdargan/hass-config` bit with your travis username and branch - you can add multiple ones.
