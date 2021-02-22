nginx-xml-json
==============

Proof-of-concept solution for presenting XML services as a JSON API. This showcases:

1. Using Node.js (npm) modules to extend the NGINX JavaScript module
2. `js_header_filter` and `js_body_filter` directives (requires njs 0.5.2 or later)

**Build**

Clone this repo, then
```shell
$ docker build -t nginx:xmljs .
```

**Run**
```shell
$ docker run -d -p 8000:80 -v $PWD:/etc/nginx/conf.d nginx:xmljs
```

**Test**
```shell
$ curl localhost:8000/echo
$ curl localhost:8000/echo -d '{"foo":"bar"}'
$ curl localhost:8000/api/f1/circuits/silverstone
```
