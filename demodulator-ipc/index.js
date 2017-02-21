var events = require('events');
var fs = require('fs');
var path = require('path');


var exports = module.exports = {}

var decoder = new Worker('demodulator/decode-worker.js')
var audio = require('./audio.js');
var arraybuffer = require('to-arraybuffer')

var IN_RATE = 1024000
var OUT_RATE = 48000;

/*var speaker = new Speaker({
    channels: 2,
    bitDepth: Speaker.SampleFormat32Bit,
    sampleRate: 48000,
    float: true
    //signed: true
});*/
var player = audio.Player()
//var wavSaver = wav.WavSaver()

//var stream = fs.createWriteStream(path.join(__dirname, 'sample.wav'));
//var instream = fs.createReadStream(path.join(__dirname, '../../sdrout.wav'));

//wavSaver.WavSaver(path.join(__dirname, 'sample.wav'));
//player.startWriting()

decoder.addEventListener('message', function (msg) {
    var sum = 0;
    //for( var i = 0; i < elmt.length; i++ ){
    //    sum += parseInt( msg.data[2[i], 10 ); //don't forget to add the base
    //}
    var level = msg.data[2]['signalLevel'];
    var left = new Float32Array(msg.data[0]);
    var right = new Float32Array(msg.data[1]);

    //console.log('message received', level)
    //stream.write(new Buffer(createHeader(44)));
    //stream.write(Buffer.from(left),Buffer.from(right))
    //stream.write(new Buffer(write32bitSamples(left,right)))
    //speaker.write(Buffer.from(left))
    //player.playFile(instream, 9600)
    //player.playMono(write16bitSamples(left,right),level,0,96000)
    //var lr = writeLeftRight(left,right)
    player.setVolume(0.5)
    player.play(left, right, level, 0)
    //player.startWriting(left,right)

})


exports.sendData = function (data, offset) {
    var send = arraybuffer(data.buffer);
    decoder.postMessage([0, send, true, offset], [send]);
}

exports.setMode = function () {
    decoder.postMessage([1, 'FM']);
}


function Data() {
    events.EventEmitter.call(this);
}

// inherit events.EventEmitter
Data.super_ = events.EventEmitter;
Data.prototype.message = function (message) {
    //var self = this;
    //self.msg = msg;
    //this.emit("data", msg);
    console.log('onmessage fired')
}

function createHeader(size) {
    return new Int32Array([
        0x46464952,   // "RIFF"
        size - 8,     // chunk size
        0x45564157,   // "WAVE"
        0x20746d66,   // "fmt "
        0x10,         // chunk size
        0x00020001,   // PCM, 2 channels
        48000,        // sample rate
        192000,       // data rate
        0x00100004,   // 4 bytes/block, 16 bits/sample
        0x61746164,   // "data"
        size - 44     // chunk size (0 for now)
    ]);
}

function write16bitSamples(leftSamples, rightSamples) {
    var out = new Int16Array(leftSamples.length * 2);
    for (var i = 0; i < leftSamples.length; ++i) {

        var l = Math.max(-1, Math.min(1, leftSamples[i]));
        out[i * 2] = l < 0 ? l * 0x8000 : l * 0x7FFF;
        //Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
        var r = Math.max(-1, Math.min(1, rightSamples[i]));
        out[i * 2 + 1] = r < 0 ? r * 0x8000 : r * 0x7FFF;
        //Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
    }
    return out;
}

//hort outBuffer[256]
//int* inBuffer = ((int*)bufferRawData);
//for (int i = 0 ; i < 256 ; ++i)
//{
//    outBuffer[i] = (short)(inBuffer[i] >> 16);
//}

function write32bitSamples(leftSamples, rightSamples) {
    var out = new Float32Array(leftSamples.length * 2);
    for (var i = 0; i < leftSamples.length; ++i) {
        out[i * 2] = leftSamples[i];
        out[i * 2 + 1] = rightSamples[i];
    }
    return out;
}

function writeLeftRight(leftSamples, rightSamples) {
    var left = new Int16Array(leftSamples.length);
    var right = new Int16Array(rightSamples.length);
    for (var i = 0; i < leftSamples.length; ++i) {
        left[i] =
            Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
        right[i] =
            Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
    }
    return [left, right];
}
