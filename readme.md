## Travis CI Webhook
This is a docker container that will validate webhook calls from Travis, and call a script if the build succeeded.

# Instructions
To run the container execute the following:
```
docker run -d \
  -p 7777:7777 \
  -v /$(PWD)/scripts:/usr/src/app/scripts \
  -e WEBHOOK_PATH=/travis \
  --name travis-ci-webhook \
rossdargan/travis-ci-webhook
```

Alternatively you can use docker compose as follows:
```
 travis:
  image: "rossdargan/travis-ci-webhook"
  container_name: travis
  restart: always
  volumes:
   - "/travis/scripts:/usr/src/app/scripts"
  environment:
    - WEBHOOK_PATH=/travis
  ports:
   - "7777:7777"
```

The Environment path indicates where node will expect the webhook to call (http://localhost:7777/travis for example). This is useful if you are placing this behind a reverse proxy as you can specify what path to listen on.

Here is my nginx config:

```
  location /travis {
    proxy_pass http://192.168.1.53:7777;
    proxy_set_header Host            $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto https;
  }
```

I **strongly** recommend running behind a proxy with ssl configured on it.

# Scripts

The container will execute a file called index.js in the scripts folder. This is used to map between the builds you have in travis and the local script you would like to execute. You will need to add this file your self into the scripts volume speified when you run the container:

```
'use strict'

module.exports = {
  'rossdargan/hass-config/master/push': 'test.sh hass', // namespace/repo_name : script <args>
}
```

Note replace the `rossdargan/hass-config/master/push` bit with your travis username, project, branch and the type that triggered the build - you can add multiple scripts.

Note the type can be:
- push
- pull_request
- cron
- api


Finally add a test.sh batch file - here is the one I use

```
#!/bin/bash
echo Writing Update for $1

touch /usr/src/app/scripts/update-$1.txt
```

# With Thanks
Thanks to [vangie](https://github.com/vangie/travis-ci-webhook) - his docker container inspired this one, I just never could quite gets his working... still not sure why. This one is lighter weight as it doesn't hook into docker like his does - his might be a better option if you want to restart docker :)
