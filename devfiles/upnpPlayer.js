const fs = require('fs');
//const MediaRendererClient = require('upnp-mediarenderer-client');
const path = require('path');

const os = require('os');
const $ = require('jquery');
//const ssdpSearch = require('./ssdpSearch.js')
//const Speaker = require('speaker');
const flac = require('node-flac');
const httpServer = require('./server.js');
const userSettings = require('../settings/settings.js')();
const flac1 = require('flac-bindings');


/*var speaker = new Speaker({
    channels: 2,
    bitDepth: Speaker.SampleFormat16Bit,
    sampleRate: 48000,
    float: true,
    //signed: false
});*/
module.exports.Player = function () {

    function writeSamples(leftSamples, rightSamples) {
        let out = new Int16Array(leftSamples.length * 2);
        for (var i = 0; i < leftSamples.length; ++i) {
            out[i * 2] =
                Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
            out[i * 2 + 1] =
                Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
        }

        return Buffer.from(out.buffer);
    }

    /*function write32bitSamples(leftSamples, rightSamples) {
        let out = new Int32Array(leftSamples.length * 2);
        for (var i = 0; i < leftSamples.length; ++i) {
            out[i * 2] = Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 2147483648);
            out[i * 2 + 1] = Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 2147483648);
        }

        return Buffer.from(out.buffer);
    }

    function write24bitSamples(leftSamples, rightSamples) {
        let out = new Int32Array(leftSamples.length * 2);
        for (var i = 0; i < leftSamples.length; ++i) {
            out[i * 2] = Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 128);
            out[i * 2 + 1] = Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 128);
        }

        return Buffer.from(out.buffer);
    }*/

    //let writer = new wav.Writer({ sampleRate: 48000, bitDepth: 32});
    let writer = new flac1.StreamEncoder({samplerate: 48000, bitsPerSample: 16});
    //let writer = new flac.FlacEncoder({ sampleRate: 48000, bitDepth: 16, float: false, signed: true });
    let fileWriter;// = new flac.FlacEncoder({ sampleRate: 48000, bitDepth: 16, float: false, signed: true });

    //var p = new require('stream').PassThrough()
    //var read = new require('stream').PassThrough()
    let audioElement;
    let recording = false;
    let server = httpServer.Server(1337, writer);
    const pause = () => {
        server.stop();
        if (userSettings.get('localPlayer') && audioElement) {
            audioElement.pause();
        }
        //audioElement.removeAttribute('src');        
        //started = false;
        //var el = document.getElementById('player');
        //el.parentNode.removeChild(el);
        //audioElement = null;
        //removeAudioElement();
    };

    const start = () => {
        server.start();
        if (userSettings.get('localPlayer')) {
            if (!audioElement) {
                createAudioElement();
                $('#audioParent').append(audioElement);
                audioElement.setAttribute('src', 'http://' + os.hostname() + ':1337/');
            } else {
                audioElement.play();
            }
        } else {
            //removeAudioElement();
        }
        //audioElement.setAttribute('src', 'http://' + os.hostname() + ':1337/');        
        //audioElement.play();
    };

    const formatField = (val) => {
        return (0 + val.toString()).slice(-2);
    };

    const getDateStr = () => {
        var date = new Date();
        var y = date.getFullYear().toString();
        var m = formatField(date.getMonth() + 1);
        var d = formatField(date.getDate());
        var hh = formatField(date.getHours());
        var mm = formatField(date.getMinutes());
        var ss = formatField(date.getSeconds());
        return y + m + d + hh + mm + ss;
    };

    const record = () => {
        let recordingsPath = userSettings.get('recordingsPath');
        if (!recording) {
            let freqText = require('../fmRadio.js').getFreqText();
            //processor = new meta.Processor({ parseMetaDataBlocks: true });
            fileWriter = new flac1.FileEncoder({ samplerate: 48000, bitsPerSample: 16, file: path.join(recordingsPath, freqText.replace(' ', '') + '_' + getDateStr() + '_recording.flac')});
            //fileWriter = new flac.FlacEncoder({ sampleRate: 48000, bitDepth: 16, float: false, signed: true });
            recording = true;
            //fileWriter.pipe(fs.createWriteStream(
            //    path.join(recordingsPath, freqText.replace(' ', '') + '_' + getDateStr() + '_recording.flac'))
            //);
            
            /*processor.on('preprocess', function(mdb) {
                console.log('preprocess called');
                console.log(mdb.toString());
            });*/
        } else {
            stopRecording();
        }
    };

    const stopRecording = () => {
        recording = false;
        fileWriter.end();
    };

    const isRecording = () => {
        return recording;
    };

    const play = (left, right) => {
        var data = writeSamples(left, right);
        writer.write(data);
        if (recording) {
            fileWriter.write(data);
        }
        //speaker.write(writeSamples(left,right));
    };


    let createAudioElement = () => {
        //const parentDiv = document.getElementById('div1');
        audioElement = document.createElement('audio');
        audioElement.setAttribute('id', 'player');
        audioElement.autoplay = true;
        //audioElement.controls = true;
        //audioElement.controlsList = ('nodownload');
        //audioElement.setAttribute('autoplay', 'true');
        //audioElement.setAttribute('controlsList','nodownload');
        audioElement.setAttribute('type', 'audio/flac');
        //audioElement.setAttribute('controls',true);
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
            protocolInfo : 'http-get:*:audio/flac:DLNA.ORG_PN=FLAC;DLNA.ORG_OP=01;DLNA.ORG_FLAGS=81500000000000000000000000000000'
            //subtitlesUrl: 'http://url.to.some/subtitles.srt'
        }
    };

    client.load('http://' + os.hostname() + ':1337/', options, function (err, result) {
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
        pause: pause,
        start: start,
        record: record,
        stopRecording: stopRecording,
        isRecording: isRecording
        //setVolume: setVolume,
        //startWriting: startWriting,
        //stopWriting: stopWriting,
        //isWriting: isWriting
    };
};