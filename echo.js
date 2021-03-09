export default {echo}

function echo(r) {
    var body;
    if (typeof(r.requestBuffer) != "undefined") {
        body = r.requestBuffer;
    } else {
        var req = `<request client="${r.variables.remote_addr}" port="${r.variables.server_port}" host="${r.variables.host}" method="${r.variables.request_method}" uri="${r.uri}" httpVersion="${r.httpVersion}">
        <headers></headers>
        </request>`;
        var res = `<response status="${r.variables.return_code}" timestamp="${r.variables.time_iso8601}"></response>`;
        body = `${req}\n${res}\n`;
    }
    r.return(Number(r.variables.return_code), body);
}
