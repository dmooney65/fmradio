//const events = require('events');
//const fs = require('fs');
const path = require('path');
const bswap = require('bswap');
var ip = require('ip');
//const ssdpSearch = require('./ssdpSearch.js')
const Speaker = require('speaker');


var speaker = new Speaker({
  channels: 2,
  bitDepth: Speaker.SampleFormat16Bit,
  sampleRate: 48000,
  //float: true,
  //signed: false
});

function writeSamples(leftSamples, rightSamples) {
  var out = new Int16Array(leftSamples.length * 2);
  for (var i = 0; i < leftSamples.length; ++i) {
    out[i * 2] =
      Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
    out[i * 2 + 1] =
      Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
  }
  bswap(out)

  return out;
}


var p = new require('stream').PassThrough()
var read = new require('stream').PassThrough()

//var rs = fs.createReadStream(path.join(__dirname, './out.raw'))


var server = require('http')
  .createServer(function (req, res) {
    res.writeHead(200, {
      'Content-Type': 'audio/l16;rate=48000;channels=2'
      //'Content-Type': 'audio/x-wav'
    });
    if (req.method === 'HEAD') {
      return res.end();
    }
    p.pipe(res);
  })


server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(1337,'0.0.0.0',128);


//read.pipe(speaker)

//read.read('http://127.0.0.1:1337/')




exports.play = (left, right) => {

  p.write(Buffer.from(writeSamples(left, right).buffer))
  //read.read('http://127.0.0.1:1337/')
}

//var renderer = ssdr.getRenderers(); 


var MediaRendererClient = require('upnp-mediarenderer-client');

var client = new MediaRendererClient('http://192.168.1.76:1110/');
//var client = new MediaRendererClient('http://192.168.1.64:1448/');
//var client = new MediaRendererClient('http://192.168.1.89:7676/smp_15_');
//var client = new MediaRendererClient('http://192.168.1.100:1400/xml/device_description.xml');


// Load a stream with subtitles and play it immediately 
var options = {
  autoplay: true,
  contentType: 'audio/l16;codec=1',
  metadata: {
    artist: 'BBC',
    date: '2017',
    genre: 'Talk',
    title: 'Fm Tuner',
    album: 'R4 album',
    track: '1',
    //encoder         : 'Lavf57.63.100',

    type: 'audio' // can be 'video', 'audio' or 'image' 
    //subtitlesUrl: 'http://url.to.some/subtitles.srt'
  }
};

client.load('http://'+ip.address()+':1337/', options, function (err, result) {
  if (err) throw err;
  console.log('playing ...');
});

client.on('status', function (status) {
  // Reports the full state of the AVTransport service the first time it fires, 
  // then reports diffs. Can be used to maintain a reliable copy of the 
  // service internal state. 
  console.log(status);
});

client.on('loading', function () {
  console.log('loading');
});

client.on('playing', function () {
  console.log('playing');
});

client.on('paused', function () {
  console.log('paused');
});

client.on('stopped', function () {
  console.log('stopped');
});

client.on('speedChanged', function (speed) {
  // Fired when the user rewinds of fast-forwards the media from the remote 
  console.log('speedChanged', speed);
});

//client.play();
