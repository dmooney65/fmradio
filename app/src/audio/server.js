const os = require('os');
const http = require('http');

module.exports.Server = (port, writer) => {
    
    let server;
    
    let createServer = () => {
        server = http.createServer(function (req, res) {
            res.writeHead(200, {
                'Content-Type': 'audio/flac,rate=48000;channels=2',
                'transferMode.dlna.org': 'Streaming',
                'Cache-Control': 'no-cache',
                'pragma': 'no-cache',
                'contentFeatures.dlna.org' : 'DLNA.ORG_PN=FLAC;DLNA.ORG_OP=01;DLNA.ORG_FLAGS=81500000000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01500000000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=015000 00000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;DLNA.ORG_CI=0',
                //'contentfeatures.dlna.org': 'DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                'Access-Control-Allow-Origin': '*',
                //proxy_add_header 'Access-Control-Allow-Origin' 'http://example.com';
                //proxy_add_header 'Access-Control-Allow-Methods' 'OPTIONS, HEAD, GET, POST, PUT, DELETE';
                //proxy_add_header 'Access-Control-Allow-Headers' 'X-Requested-With, Content-Type, Content-Length';
                
                'Transfer-Encoding': 'chunked',
                
            });
            if (req.method === 'HEAD') {
                return res.end();
            }

        });


        server.on('clientError', (err, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        server.on('request', (req, res) => {
            writer.pipe(res);
        });
    };

    let start = () => {
        if (!server) {
            createServer();
        }
        server.timeout = 0;
        server.listen(port, os.hostname, 32);        
    };

    let stop = () => {
        if (server) {
            server.close();
        }
    };

    return {
        start: start,
        stop: stop
    };
};