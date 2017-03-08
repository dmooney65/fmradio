var events = require('events');
const fs = require('fs');
const path = require('path');
//const sox = require('sox-stream');
//const Speaker = require('speaker');
var Speaker = require('audio-speaker/stream');

var speaker = new Speaker({
    channels: 2,
    bitDepth: 16,
    sampleRate: 48000,
    //float: true,
    //signed: false
});


function write32bitSamples(leftSamples, rightSamples) {
    var out = new Float32Array(leftSamples.length * 2);
    for (var i = 0; i < leftSamples.length; ++i) {
        out[i * 2] = leftSamples[i];
        out[i * 2 + 1] = rightSamples[i];
    }
    return Buffer.from(out.buffer);
}

function writeSamples(leftSamples, rightSamples) {
    var out = new Int16Array(leftSamples.length * 2);
    for (var i = 0; i < leftSamples.length; ++i) {
      out[i * 2] =
        Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
      out[i * 2 + 1] =
        Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
    }
    return Buffer.from(out.buffer);
  }



var p = new require('stream').PassThrough()


//var outS = fs.createWriteStream(path.join(__dirname, '/out32.raw'))

p.pipe(speaker);

exports.play = (left, right) => {
    p.write(writeSamples(left, right));
}
