var Client = require('node-ssdp').Client

client = new Client();

getRenderers = () => {
    let servers = [];

    findRenderers = () => {
        client.on('response', function (headers, statusCode, rinfo) {
            console.log('Got a response to an m-search.');
            var newDiv = document.createElement("div");
            var newContent = document.createTextNode(headers['LOCATION']);
            newDiv.appendChild(newContent); //add the text node to the newly created div. 

            // add the newly created element and its content into the DOM 
            var currentDiv = document.getElementById("div1");
            document.body.insertBefore(newDiv, currentDiv);
            servers.push(headers);
        });

        // search for a service type 
        client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
    }
    findRenderers();

    return servers;
}

getRenderers();
