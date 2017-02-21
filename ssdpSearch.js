var Client = require('node-ssdp').Client


exports.getRenderers = () => {
    client = new Client();
    let servers = [];

    findRenderers = () => {
        client.on('response', function (headers, statusCode, rinfo) {
            console.log('Got a response to an m-search.');
            servers.push(headers);
        });

        // search for a service type 
        client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
    }
    findRenderers()
    return servers;
}
