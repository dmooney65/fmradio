// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var fs = require('fs');
var path = require('path')
var rtlsdr = require('sdrjs');
//var speaker = require('speaker');
//var pcm = require('pcm-stream');
var decoder = require('./demodulator/index.js')
//const FmDecoder = require('./fmDecoder.js');
//var audio = require('./demodulator/audio.js')

var freq = 94900000 //+ 272000
var captureRate = 1024000
var outputSampleRate = 48000;


//var pw = new speaker({
//  channels: 1,
//  bitDepth: speaker.SampleFormat16Bit,
//  sampleRate: outputSampleRate,
//  });


var devices = rtlsdr.getDevices()
var device = devices[0]

//var stream = pcm();

//fs.createWriteStream(path[, options])
//stream.on('data', function(data) {
//  console.log('data is', stream)
//});

//decoder.addEventListener('message', function(msg){
//  stream.write(msg);
//pw.write(msg);
//})
//var player = audio.Player()

//var decoder = new FmDecoder(freq);

var edge = 0;
var postDownSample = 1;
var sampleRate = 24000
var sampleRate = sampleRate * postDownSample;

var downSample = (1000000 / sampleRate) + 1;
var captureRate = downSample * sampleRate;
var captureFreq = freq + captureRate / 4;
captureFreq += edge * sampleRate / 2;

device.open()
//device.centerFrequency = freq
device.sampleRate = captureRate
device.centerFrequency = captureFreq
device.sampleRate = captureRate
device.rtlOcillatorFrequency = 28800000
device.bufferNumber = 5
device.bufferLength = Math.floor(device.sampleRate / device.bufferNumber);
//device.offsetTuning = true
//console.log('offset = ',device.offsetTuning)
device.enableAGC()
device.setIntermediateFrequencyGain(20)
console.log(device.sampleRate)
console.log(device.centerFrequency)
console.log(device.bufferNumber)
console.log(device.bufferLength)

//decoder.on('data', function (data) {
//  player.playMono(data, 0.5, 0)
//})

device.on("data", function (data) {
  decoder.sendData(data, captureFreq - freq);
  //decoder.write(data.buffer)
  //stream.write(data)
});


const onBtn = document.getElementById('radio-on')
const offBtn = document.getElementById('radio-off')

onBtn.addEventListener('click', function (event) {
  decoder.setMode()
  device.start()
})

offBtn.addEventListener('click', function (event) {
  device.stop()
})
