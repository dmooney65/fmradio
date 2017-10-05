var events = require('events');
const fs = require('fs');
const path = require('path');
//const sox = require('sox-stream');
//const Speaker = require('speaker');
//var Speaker = require('audio-speaker');
let flac = require('node-flac');
var wav = require('wav');

/*var speaker = new Speaker({
    channels: 2,
    bitDepth: 32,
    sampleRate: 48000,
    float: true,
    //signed: false
    interleaved: true
});*/


write32bitSamples = (leftSamples, rightSamples) => {
    var out = new Float32Array(leftSamples.length * 2);
    for (var i = 0; i < leftSamples.length; ++i) {
        out[i * 2] = leftSamples[i];
        out[i * 2 + 1] = rightSamples[i];
    }
    return Buffer.from(out.buffer);
}

function concatSamples(left, right)
{
    var leftLength = left.length,
        result = new Float32Array(leftLength + right.length);

    result.set(left);
    result.set(right, leftLength);

    return Buffer.from(result.buffer);
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

var outFlac = fs.createWriteStream(path.join(__dirname, '/out32.flac'))
//var outWav = fs.createWriteStream(path.join(__dirname, '/out32.wav'))
var p = new require('stream').PassThrough()
flacEncoder = new flac.FlacEncoder({numChannels: 2, depth: 16, streaming: true, float: false , signed: true });
var writer = new wav.FileWriter(path.join(__dirname, '/out32.wav'), { sampleRate: 48000, float: false, bitDepth: 16, signed: true });

p.pipe(flacEncoder).pipe(outFlac);
//writer.pipe(outWav);
//p.pipe(speaker);

encodeWav = (data) => {
    //p.write(wav.encode( [leftSamples, rightSamples], { sampleRate: 48000, float: true, bitDepth: 32 }));
    writer.write(data);
}

encodeFlac = (data) => {
    p.write(data);
}

exports.play = (left, right) => {
    var out = writeSamples(left, right);
    //p.write(out);
    encodeFlac(out);
    encodeWav(out)
}
