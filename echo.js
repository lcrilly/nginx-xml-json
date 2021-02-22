export default {echo}

function echo(r) {
    var body;
    if (typeof(r.requestBuffer) != "undefined") {
        body = r.requestBuffer;
    } else {
        var req = "<request";
        req += " client=\"" + r.variables.remote_addr + "\"";
        req += " port=\"" + r.variables.server_port + "\"";
        req += " host=\"" + r.variables.host + "\"";
        req += " method=\"" + r.variables.request_method + "\"";
        req += " uri=\"" + r.uri + "\"";
        req += " httpVersion=\"" + r.httpVersion + "\"";
        req += ">\n";
        req += "  <headers>\n"
        for (var h in r.headersIn) {
            req += "    <" + h + ">" + r.headersIn[h] + "</" + h + ">\n";
        }
        req += "  </headers>\n"
        req += "</request>"

        var res = "<response ";
        res += " status=\"" + r.variables.return_code + "\"";
        res += " timestamp=\"" + r.variables.time_iso8601 + "\"";
        res += "></response>";

        body = req + "\n" + res + "\n";
    }
    r.return(Number(r.variables.return_code), body);
}
