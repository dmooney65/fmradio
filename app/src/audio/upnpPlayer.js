//const events = require('events');
//const fs = require('fs');
//const MediaRendererClient = require('upnp-mediarenderer-client');
//const path = require('path');
//const bswap = require('bswap');
const os = require('os');
//const ssdpSearch = require('./ssdpSearch.js')
//const Speaker = require('speaker');
//const wav = require('wav');
const flac = require('node-flac');
const httpServer = require('./server.js');


/*var speaker = new Speaker({
  channels: 2,
  bitDepth: Speaker.SampleFormat16Bit,
  sampleRate: 48000,
  //float: true,
  //signed: false
});*/
module.exports.Player = () => {

    function writeSamples(leftSamples, rightSamples) {
        let out = new Int16Array(leftSamples.length * 2);
        for (var i = 0; i < leftSamples.length; ++i) {
            out[i * 2] =
                Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
            out[i * 2 + 1] =
                Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
        }
        //bswap(out)

        return Buffer.from(out.buffer);
    }

    //let writer = new wav.Writer({ sampleRate: 48000, float: false, bitDepth: 16, signed: true });
    let writer = new flac.FlacEncoder({ sampleRate: 48000, float: false, bitDepth: 16, signed: true });

    //var p = new require('stream').PassThrough()
    //var read = new require('stream').PassThrough()

    //var ws = fs.createWriteStream(path.join(__dirname, './out.flac'))

    let server = httpServer.Server(1337,writer);

    let started = false;

    let startServer = () => {
        server.start();
        started = true;
    };

    let stopServer = () => {
        server.stop();
    };

    let audioElement = null;
    let play = (left, right) => {
        if(!started){
            console.log('starting server');
            startServer();
        }
        if(audioElement == null){
            console.log('creating audio element');
            createAudioElement();
        }
        writer.write(writeSamples(left, right));
        //p.write(writeSamples(left, right));
        //read.read('http://127.0.0.1:1337/')
    };

    let pause = () => {
        console.log('stopping server');
        stopServer();
        started = false;
        //var el = document.getElementById('player');
        //el.parentNode.removeChild(el);
        //audioElement = null;
    };

    let createAudioElement = () => {
        const parentDiv = document.getElementById('div1');
        audioElement = document.createElement('audio');
        audioElement.setAttribute('id', 'player');
        audioElement.setAttribute('autoplay', 'false');
        audioElement.setAttribute('type', 'audio/x-flac');
        audioElement.setAttribute('controls', false);
        audioElement.setAttribute('src', 'http://' + os.hostname() + ':1337/');
        parentDiv.appendChild(audioElement);
    };


    //var renderer = ssdr.getRenderers(); 

    /*let client = new MediaRendererClient('http://libreelec:1110/');
    //var client = new MediaRendererClient('http://192.168.1.73:34732/dev/caf57d19-7042-76f8-ffff-ffffc893b8c3/desc.xml');
    //var client = new MediaRendererClient('http://192.168.1.64:1448/');
    //var client = new MediaRendererClient('http://192.168.1.64:2007/');
    //var client = new MediaRendererClient('http://192.168.1.64:1448/');
    //let client = new MediaRendererClient('http://192.168.1.69:7676/smp_15_');
    //let client = new MediaRendererClient('http://192.168.1.71:1400/xml/device_description.xml');
    
    
    // Load a stream with subtitles and play it immediately 
    let options = {
      autoplay: true,
      contentType: 'audio/x-flac;rate=48000;channels=2',
      metadata: {
        artist: 'BBC',
        date: '2017',
        genre: 'Talk',
        title: 'FM Tuner',
        album: 'R4 album',
        track: '1',
        //encoder         : 'Lavf57.63.100',
    
        type: 'audio', // can be 'video', 'audio' or 'image' 
        //protocolInfo : 'http-get:*:audio/WAV:DLNA.ORG_PN=LPCM'
        //subtitlesUrl: 'http://url.to.some/subtitles.srt'
      }
    };
    
    client.load('http://'+os.hostname()+':1337/', options, function (err, result) {
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
    
    //client.play();*/

    return {
        play: play,
        pause: pause//,
        //setVolume: setVolume,
        //startWriting: startWriting,
        //stopWriting: stopWriting,
        //isWriting: isWriting
    };
};
