require('http')
    .createServer(function (req, res) {
        res.writeHead(200, {
            'Content-Type': process.argv[2]
        });
        if (req.method === 'HEAD') {
            return res.end();
        }
        process.stdin.pipe(res);
    })
    .listen(1337);