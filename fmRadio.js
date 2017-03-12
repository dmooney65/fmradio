const fs = require('fs');
const remote = require('electron').remote;
const main = remote.require('./main.js');
const sdrjs = require('sdrjs');
const arraybuffer = require('to-arraybuffer');
//const wCrew = require('./workcrew.js')
//const decoder = new Worker('demodulator/decode-worker.js');
WorkCrew = function (filename, count) {
  this.filename = filename;
  this.count = count || 4;
  this.queue = [];
  this.results = [];
  this.pool = [];
  this.working = {};
  this.uuid = 0;
  this.fillPool();
};

WorkCrew.prototype.onfinish = function () { };

WorkCrew.prototype.oncomplete = function (res) {
  return [res.id, res.result];
};

WorkCrew.prototype.addWork = function (work) {
  var id = this.uuid++;
  this.queue.push({ id: id, work: work });
  this.processQueue();
  return id;
};

WorkCrew.prototype.processQueue = function () {
  if (this.queue.length == 0 && this.pool.length == this.count) {
    if (this.onfinish)
      this.onfinish();
  } else {
    while (this.queue.length > 0 && this.pool.length > 0) {
      var unit = this.queue.shift();
      var worker = this.pool.shift();
      worker.id = unit.id;
      this.working[worker.id] = worker;
      worker.postMessage(unit.work);
    }
  }
};

WorkCrew.prototype.addWorker = function () {
  var w = new Worker(this.filename);
  var self = this;
  w.onmessage = function (res) {
    var id = this.id;
    delete self.working[this.id];
    this.id = null;
    self.pool.push(this);
    try {
      self.oncomplete({ id: id, result: res });
    } catch (e) {
      console.log(e);
    }
    self.processQueue();
  };
  this.pool.push(w);
};

WorkCrew.prototype.fillPool = function () {
  for (var i = 0; i < this.count; i++) {
    this.addWorker();
  }
};

var crew = new WorkCrew('demodulator/decode-worker.js', 3);
//const audio = require('./demodulator/audio.js')
//const localPlayer = require('./localPlayer.js');
const upnp = require('./upnpPlayer.js');
let player = upnp.Player();

let device;
let offset = localStorage.frequencyOffset ? localStorage.frequencyOffset : 0;//250000;
let stereo = localStorage.stereo ? localStorage.stereo : 'false';
let gains = [];
const sampleRates = [288000, 960000, 1200000, 1440000, 2048000, 2400000, 2560000, 2700000, 2880000];
let sampleRate = localStorage.sampleRate ? localStorage.sampleRate : sampleRates[6];

const onBtn = document.getElementById('radio-on');
const offBtn = document.getElementById('radio-off');
const settingsBtn = document.getElementById('settings');
const csdrBtn = document.getElementById('open-csdr');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const freqDownBtn = document.getElementById('freqDown');
const freqUpBtn = document.getElementById('freqUp');
const scanDown = document.getElementById('scanDown');
const scanUp = document.getElementById('scanUp');
const freqText = document.getElementById('freq');
freqText.defaultValue = localStorage.lastFequency ? localStorage.lastFequency : '91000000';
const gainText = document.getElementById('gain');
gainText.defaultValue = '0';
const levelText = document.getElementById('level');
const stereoText = document.getElementById('isStereo');
const stereoBtn = document.getElementById('stereo');
const monoBtn = document.getElementById('mono');
const castBtn = document.getElementById('cast');

//var renderers = ssdpSearch.getRenderers();

setDeviceParams = () => {
  //var captureRate = 1024000
  //var outputSampleRate = 48000;
  //var edge = 0;
  //var postDownSample = 1;
  //var sampleRate = 24000
  //var sampleRate = sampleRate * postDownSample;
  //var downSample = (1000000 / sampleRate) + 1;
  //var captureRate = downSample * sampleRate;
  //var captureFreq = frequency + captureRate / 4;
  //captureFreq += edge * sampleRate / 2;
  //device.enableManualTunerGain();
  gains = device.validGains;
  //console.log(gains);
  device.enableAGC();
  device.disableManualTunerGain();
  device.sampleRate = sampleRate;//captureRate
  device.rtlOcillatorFrequency = 28800000;
  //device.centerFrequency = frequency;
  //frequencyOffset = captureFreq - frequency;
  //device.bufferNumber = 5;
  //device.bufferLength = Math.floor(sampleRate / device.bufferNumber);
}

setGain = (gain) => {
  device.tunerGain = gains[gain];
  console.log(device.tunerGain);
  console.log(device.sampleRate);
}

getDevices = () => {
  return sdrjs.getDevices();
}


startDevice = () => {
  if (null != device) {
    setFrequency(parseInt(freqText.value));
    setGain(parseInt(gainText.value));
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
    sendData(data);
  })
}

//var outS = fs.createWriteStream('out.raw');

var event = new Event('change');

crew.oncomplete = function (result) {
  //console.log(result.id);//, result.result);
  processMessage(result.result);
};
// Add some work to the queue.
// The work unit is postMessaged to one of
// the workers.
//var workId = crew.addWork(myWorkUnit);
// Add an onfinish event handler.
// Fired when the queue is empty and all workers
// are free.
crew.onfinish = function () {
  console.log('All work in queue finished!');
};

//decoder.addEventListener('message', function (msg) {
//  processMessage(msg);
//})

processMessage = (msg) => {
  var level = msg.data[2]['signalLevel'];
  var left = new Float32Array(msg.data[0]);
  var right = new Float32Array(msg.data[1]);
  stereoText.innerText = msg.data[2]['stereo'];
  levelText.innerText = level.toFixed(2);
  levelText.dispatchEvent(event);
  //play(left, right, level, 0.05);
  player.play(left, right);
}

play = (left, right, level, squelch) => {
  //player.play(left, right, level, squelch);
  //localPlayer.play(left, right);
  player.play(left, right);
}

sendData = (data) => {
  var send = arraybuffer(data.buffer);
  //decoder.postMessage([0, send, stereo, offset, sampleRate], [send]);
  var workId = crew.addWork([0, send, stereo, offset, sampleRate], [send]);
}

onBtn.addEventListener('click', function (event) {
  //decoder.postMessage([1, "WBFM", sampleRate]);
  //var workId = crew.addWork([1, "WBFM", sampleRate]);
  //device.start()

  if (null == device) {
    devices = getDevices();
    device = devices[0];
    device.open();
    //freqText.value = 91000000;
    setDeviceParams();
    listen();
  } else {
    device.open();
  }
  //listen()
})

offBtn.addEventListener('click', function (event) {
  levelText.removeEventListener('change', scanDownEvent, true);
  levelText.removeEventListener('change', scanUpEvent, true);
  closeDevice();
})

freqText.addEventListener('change', function (event) {
  levelText.removeEventListener('change', scanDownEvent, true);
  levelText.removeEventListener('change', scanUpEvent, true);
  localStorage.lastFequency = freqText.value;
  setFrequency(parseInt(freqText.value));
})

gainText.addEventListener('change', function (event) {
  setGain(parseInt(gainText.value));
})

startBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true);
  levelText.removeEventListener('change', scanUpEvent, true);
  startDevice();
  startBtn.disabled = true;
})

stopBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true);
  levelText.removeEventListener('change', scanUpEvent, true);
  stopDevice();
  startBtn.disabled = false;
})

openSettingsWindow = () => {
  window.open(__dirname + '/settings.html');
}

settingsBtn.addEventListener('click', function () {
  openSettingsWindow();
})

freqDownBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true);
  levelText.removeEventListener('change', scanUpEvent, true);
  freqDown();
})

freqUpBtn.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true);
  levelText.removeEventListener('change', scanUpEvent, true);
  freqUp();
})

stereoBtn.addEventListener('click', function () {
  stereo = true;
})

monoBtn.addEventListener('click', function () {
  stereo = false;
})

scanDown.addEventListener('click', function () {
  levelText.removeEventListener('change', scanUpEvent, true);
  freqDown();
  levelText.addEventListener('change', scanDownEvent, true);
})

scanUp.addEventListener('click', function () {
  levelText.removeEventListener('change', scanDownEvent, true);
  freqUp();
  levelText.addEventListener('change', scanUpEvent, true);
})

var found = false;
var count = 0;
scanDownEvent = (event) => {
  if (getLevel() < 0.45) {
    if (count < 6) {
      count++;
      //console.log(count)
    } else {
      freqDown();
      count = 0;
    }
  }
  found = true;
}

scanUpEvent = (event) => {
  if (getLevel() < 0.45) {
    if (count < 6) {
      count++;
      //console.log(count)
    } else {
      freqUp();
      count = 0;
    }
  }
  found = true;
}

getFrequency = () => {
  return parseInt(freqText.value);
}

setFrequency = (frequency) => {
  device.centerFrequency = frequency + offset;
  freqText.value = frequency;
}

freqDown = () => {
  setFrequency(getFrequency() - 100000);
}

freqUp = () => {
  setFrequency(getFrequency() + 100000);
}

getLevel = () => {
  return parseFloat(levelText.innerText);
}

openCastWindow = () => {
  window.open(__dirname + '/cast.html');
}

castBtn.addEventListener('click', () => {
  openCastWindow();
})


