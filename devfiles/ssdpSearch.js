var Client = require('node-ssdp').Client;

let client = new Client();

let getRenderers = () => {
    let servers = [];

    let findRenderers = () => {
        var parent = document.getElementById('divMain');
        client.on('response', function (headers, statusCode, rinfo) {
            console.log('Got a response to an m-search.');
            var newDiv = document.createElement('div');
            var newContent = document.createTextNode(headers['LOCATION']);
            newDiv.appendChild(newContent); //add the text node to the newly created div. 

            // add the newly created element and its content into the DOM 
            //var currentDiv = document.getElementById('divMain');
            parent.appendChild(newDiv);
            servers.push(headers);
        });

        // search for a service type 
        //client.search('urn:schemas-upnp-org:device:MediaRenderer:1');
        client.search('ssdp:all');
    };//
    findRenderers();

    return servers;
};

getRenderers();
