FROM node:alpine AS npm
WORKDIR /tmp
RUN npm install xml-js && \
    echo "export default {xj}\nfunction xj(){}" > nginxify.js && \
    echo "global.xmljs = require('xml-js');" | npx browserify -d -o browserify.js - && \
    cat nginxify.js browserify.js > xml-js.js

FROM nginx
COPY --from=npm /tmp/xml-js.js /etc/nginx
RUN sed -i "s/events/load_module modules\/ngx_http_js_module.so;\nevents/" /etc/nginx/nginx.conf
RUN nginx -v > /dev/stderr && njs -v > /dev/stderr
