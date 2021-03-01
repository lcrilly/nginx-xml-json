nginx-xml-json
==============

Proof-of-concept solution for presenting XML services as a JSON API. This showcases:

1. Using Node.js (npm) modules to extend the NGINX JavaScript module (njs)
2. `js_header_filter` and `js_body_filter` directives (requires njs 0.5.2 or later)

Using npm
---------
This PoC uses the [`xml-js` Node.js module](https://www.npmjs.com/package/xml-js) as a library to perform transformation between XML and JSON formats. The NGINX JavaScript module can use npm modules, provided that njs supports the ECMAScript objects and primitives that were used.

In this case we can use `xml-js` as-is, and keep that code in a separate file for ease of maintenance. The [Dockerfile](Dockerfile#L3) includes the necessary steps to produce the module in a way that can be consumed from other njs functions. To do this manually, follow these steps:

0. Install [Node.js](https://nodejs.org/en/)
1. Obtain the `xml-js` module
```shell
   $ npm install xml-js
```
2. Create a single JavaScript file the module with one extra line of code that makes the module available in the `global` namespace. Instead of using `require('xml-js')` we can now use `global.xmljs`
```shell
   $ echo "global.xmljs = require('xml-js');" | npx browserify -d -o xml-js.js -
```
3. Export an empty function so that the global namespace from this file is available to all other njs files. The name of this function is not important.
```shell
$ cat << EOF >> xml-js.js
export default {xj}
function xj(){}
EOF
```
*Learn more about [using Node.js modules with njs](http://nginx.org/en/docs/njs/node_modules.html).*


Using this repo
---------------

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
