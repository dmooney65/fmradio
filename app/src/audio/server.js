const os = require('os');
const http = require('http');
//const fs = require('fs');
//const path = require('path');

module.exports.Server = (port, writer) => {
    //this.port = port;
    //this.writer = writer;
    let server;
    //var ws = fs.createWriteStream(path.join(__dirname, './out.wav'));

    let createServer = () => {
        server = http.createServer(function (req, res) {
            res.writeHead(200, {
                'Content-Type': 'audio/x-flac,rate=48000;channels=2',
                'transferMode.dlna.org': 'Streaming',
                'Cache-Control': 'no-cache',
                'pragma': 'no-cache',
                //'X-User-Agent': 'redsonic',
                //'accept-ranges': 'bytes',
                'contentFeatures.dlna.org' : 'DLNA.ORG_PN=FLAC;DLNA.ORG_OP=01;DLNA.ORG_FLAGS=81500000000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01500000000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=015000 00000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=017000 00000000000000000000000000',
                //'contentFeatures.dlna.org': 'DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;DLNA.ORG_CI=0',
                //'contentfeatures.dlna.org': 'DLNA.ORG_PN=MP3;DLNA.ORG_OP=01;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                'Transfer-Encoding': 'chunked',
                //'MediaInfo.sec': 'SEC_Duration=0' 
                
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
            //writer.pipe(ws);
        });
    };

    //createServer();

    let start = () => {
        if (!server) {
            createServer();
        }
        server.timeout = 0;
        server.listen(port, os.hostname, 32);        
        //console.log('Server is ' + started);
    };

    let stop = () => {
        if (server) {
            server.close();
            //server = null;
        }
    };

    return {
        start: start,
        stop: stop
    };
};

//module.exports = Server;