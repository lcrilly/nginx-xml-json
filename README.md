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

Transforming XML responses (GET-only)
-------------------------------------
For XML services that offer a read-only (`GET`) interface, i.e. clients don't send request bodies, we can use `js_body_filter` to examine and modify the responses. The function is called for every buffer (part of the response) and so to perform full transformatin of the response we must wait until we receive the last byte, indicated with `flags.last`. At this point we can use `r.sendBuffer()` to send whatever we like to the client.

`js_body_filter` can be used inside a `proxy_pass` location and so requires minimal config changes.

As the size of the response is likely to change, and the response format is different it is also important to modify the response _headers_, not just the body. We can use the `js_headers_filter` directive to call a separate function for this. The `Content-Length` response header is removed so we rely on chunked encoding instead. The `Content-Type` response header is replaced with `application/json` to match the new body.

_[See the `/api/f1` configuration for an example](proxy.conf#L15)_


Transforming requests and responses
-----------------------------------
For URIs that may also receive a request body that requires transformation (as well as the response) we cannot rely on `js_body_filter` as that only handles responses. Bi-directional transformations can be achieved by splitting the `location` block into three parts:

1. A `location` that handles configuration for the client-to-nginx processing (all of the pre-content phases) and delegates content to `js_content` that executes;
2. JavaScript code that modifies the request and response. This code proxies to the backend by making a subrequest to;
3. `location` that handles configuration for the nginx-to-backend processing

_[See the `/echo` configuration for an example](proxy.conf#L24)_


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
$ curl localhost:8000/api/f1/circuits/silverstone
$ curl localhost:8000/echo
$ curl localhost:8000/echo -d '{"foo":"bar"}'
```
