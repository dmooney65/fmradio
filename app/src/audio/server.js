const os = require('os');
const http = require('http');

module.exports.Server = (port, writer) => {
    //this.port = port;
    //this.writer = writer;
    let server;

    let createServer = () => {
        server = http.createServer(function (req, res) {
            res.writeHead(200, {
                'Content-Type': 'audio/x-flac,rate=48000;channels=2',
                //'Content-Type': 'audio/l16'
                'Transfer-Encoding': 'chunked'
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
        createServer();
        server.listen(port, os.hostname, 32);
        //console.log('Server is ' + started);
    };

    let stop = () => {
        //this.server.end();
        server.close();
        server = null;
    };

    return {
        start: start,
        stop: stop
    };
};

//module.exports = Server;