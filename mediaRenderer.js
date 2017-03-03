var MediaRendererClient = require('upnp-mediarenderer-client');
var fs = require('fs');
var path = require('path');

var rs = fs.createReadStream(path.join(__dirname, './small.mp4'))
//rs.pipe(server);

var server = require('http')
  .createServer(function (req, res) {
    res.writeHead(200, {
      'Content-Type': 'video/mp4'
      //'Content-Type': 'audio/x-wav'
    });
    if (req.method === 'HEAD') {
      return res.end();
    }
    rs.pipe(res);
  })


server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(1337,'0.0.0.0',128);



// Instanciate a client with a device description URL (discovered by SSDP)
var client = new MediaRendererClient('http://192.168.1.89:7676/smp_15_');
//var client = new MediaRendererClient('http://192.168.1.76:1110/');
//var client = new MediaRendererClient('http://192.168.1.100:1400/xml/device_description.xml');


// Load a stream with subtitles and play it immediately
var options = { 
  autoplay: true,
  contentType: 'video/mp4',
  metadata: {
    title: 'Some Movie Title',
    creator: 'John Doe',
    type: 'video', // can be 'video', 'audio' or 'image'
    //subtitlesUrl: 'http://url.to.some/subtitles.srt'
  }
};

client.load('http://192.168.1.107:1337/small.mp4', options, function(err, result) {
  if(err) throw err;
  console.log('playing ...');
});

// Pause the current playing stream
//client.pause();

// Unpause
//client.play();

// Stop
//client.stop();

// Seek to 10 minutes
client.seek(10 * 60);

client.on('status', function(status) {
  // Reports the full state of the AVTransport service the first time it fires,
  // then reports diffs. Can be used to maintain a reliable copy of the
  // service internal state.
  console.log(status);
});

client.on('loading', function() {
  console.log('loading');
});

client.on('playing', function() {
  console.log('playing');

  client.getPosition(function(err, position) {
    console.log(position); // Current position in seconds
  });

  client.getDuration(function(err, duration) {
    console.log(duration); // Media duration in seconds
  });
});

client.on('paused', function() {
  console.log('paused');
});

client.on('stopped', function() {
  console.log('stopped');
});

client.on('speedChanged', function(speed) {
  // Fired when the user rewinds of fast-forwards the media from the remote
  console.log('speedChanged', speed);
});