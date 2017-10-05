const fs = require('fs');
const remote = require('electron').remote;
const main = remote.require('./main.js');
const sdrjs = require('sdrjs');
const arraybuffer = require('to-arraybuffer');
const decoder = new Worker('demodulator/decode-worker.js');
//const localPlayer = require('./localPlayer.js');
const upnpPlayer = require('./upnpPlayer.js');

let device;
let frequencyOffset = 0;
let isStereo = true;

const onBtn = document.getElementById('radio-on')
const offBtn = document.getElementById('radio-off')
const csdrBtn = document.getElementById('open-csdr')
const startBtn = document.getElementById('start')
const stopBtn = document.getElementById('stop')
const freqDownBtn = document.getElementById('freqDown')
const freqUpBtn = document.getElementById('freqUp')
const scanDown = document.getElementById('scanDown')
const scanUp = document.getElementById('scanUp')
const freqText = document.getElementById('freq')
const levelText = document.getElementById('level')
const stereoText = document.getElementById('isStereo')
const stereoBtn = document.getElementById('stereo')
const monoBtn = document.getElementById('mono')


//var renderers = ssdpSearch.getRenderers();

setDeviceParams = (frequency) => {
  //var captureRate = 1024000
  var outputSampleRate = 48000;
  var edge = 0;
  var postDownSample = 1;
  var sampleRate = 24000
  var sampleRate = sampleRate * postDownSample;
  var downSample = (1000000 / sampleRate) + 1;
  var captureRate = downSample * sampleRate;
  var captureFreq = frequency + captureRate / 4;
  captureFreq += edge * sampleRate / 2;
  device.sampleRate = 2304000//captureRate
  device.rtlOcillatorFrequency = 28800000
  //device.centerFrequency = frequency;
  //frequencyOffset = captureFreq - frequency;
  device.bufferNumber = 5;
  device.bufferLength = Math.floor(sampleRate / device.bufferNumber);
}


getDevices = () => {
  return sdrjs.getDevices()
}


startDevice = () => {
  if (null != device) {
    setFrequency(parseInt(freqText.value));
    device.start();
  }
}

stopDevice = () => {
  if (null != device) {
    device.stop();
  }
}

closeDevice = () => {
  if (null != device) {
    device.stop();
    device.close();
    device = null;
  }
}

listen = () => {
  device.on('data', function (data) {
    sendData(data, 0);
  })
}

var outS = fs.createWriteStream('out.raw')


decoder.addEventListener('message', function (msg) {
  var level = msg.data[2]['signalLevel'];
  var left = new Float32Array(msg.data[0]);
  var right = new Float32Array(msg.data[1]);
  stereoText.innerText = msg.data[2]['stereo'];
  levelText.innerText = level.toFixed(2);
  var event = new Event('change');
  levelText.dispatchEvent(event);
  //localPlayer.play(left, right);
  upnpPlayer.play(left, right)
})

sendData = function (data, offset) {
  var scanData = {
    'scanning': true,
    'frequency': getFrequency()
  };
  var send = arraybuffer(data.buffer);
  decoder.postMessage([0, send, isStereo, offset], [send]);
}

onBtn.addEventListener('click', function (event) {
  decoder.postMessage([1, "WBFM"])
  //device.start()

  if (null == device) {
    devices = getDevices()
    device = devices[0]
    device.open()
    freqText.value = 93200000
    setDeviceParams(93200000)
    listen()
  } else {
    device.open()
  }
  //listen()
})

offBtn.addEventListener('click', function (event) {
  levelText.removeEventListener('change', scanDownEvent, true)
  levelText.removeEventListener('change', scanUpEvent, true)
  closeDevice()
})

freqText.addEventListener('change', function (event) {
  levelText.removeEventListener('change', scanDownEvent, true)
  levelText.removeEventListener('change', scanUpEvent, true)
  setFrequency(parseInt(freqText.value));
})

startBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true)
  levelText.removeEventListener('change', scanUpEvent, true)
  startDevice()
  startBtn.disabled = true;
})

stopBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true)
  levelText.removeEventListener('change', scanUpEvent, true)
  stopDevice()
  startBtn.disabled = false;
})

freqDownBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true)
  levelText.removeEventListener('change', scanUpEvent, true)
  freqDown()
})

freqUpBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true)
  levelText.removeEventListener('change', scanUpEvent, true)
  freqUp()
})

stereoBtn.addEventListener('click', function () {
  isStereo = true;
})

monoBtn.addEventListener('click', function () {
  isStereo = false;
})

scanDown.addEventListener('click', function () {
  levelText.removeEventListener('change', scanUpEvent, true)
  freqDown()
  levelText.addEventListener('change', scanDownEvent, true)
})

scanUp.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true)
  freqUp()
  levelText.addEventListener('change', scanUpEvent, true)
})

var found = false;
var count = 0
function scanDownEvent(event) {
  if (getLevel() < 0.45) {
    if (count < 6) {
      count++
      //console.log(count)
    } else {
      freqDown()
      count = 0
    }
  }
  found = true
}
function scanUpEvent(event) {
  if (getLevel() < 0.45) {
    if (count < 6) {
      count++
      //console.log(count)
    } else {
      freqUp()
      count = 0
    }
  }
  found = true
}

getFrequency = () => {
  return parseInt(freqText.value);
}

setFrequency = (frequency) => {
  device.centerFrequency = freqText.value = frequency
}

freqDown = () => {
  setFrequency(getFrequency() - 100000)
}

freqUp = () => {
  setFrequency(getFrequency() + 100000)
}

getLevel = () => {
  return parseFloat(levelText.innerText)
}