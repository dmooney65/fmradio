//const fs = require('fs');
//const remote = require('electron').remote;
const RtlDevice = require('./device/rtldevice.js');
//const TcpDevice = require('./device/tcpdevice.js');
//const main = remote.require('../app/main.js');
const arraybuffer = require('to-arraybuffer');
const decoder = new Worker('demodulator/decode-worker.js');
const sampleRates = [288000, 960000, 1200000, 1440000, 2048000, 2400000, 2560000, 2700000, 2880000];
let sampleRate = localStorage.sampleRate ? localStorage.sampleRate : sampleRates[6];

const upnp = require('./audio/upnpPlayer.js');
let player = new upnp.Player();

let device;
let offset = localStorage.frequencyOffset ? localStorage.frequencyOffset : 250000;
let stereo = localStorage.stereo ? localStorage.stereo : 'false';
let gains = [];


const onBtn = document.getElementById('radio-on');
const offBtn = document.getElementById('radio-off');
const settingsBtn = document.getElementById('settings');
//const csdrBtn = document.getElementById('open-csdr');
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

let setDeviceParams = () => {
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
    gains = device.getValidGains();
    //console.log(gains);
    device.disableManualTunerGain();
    device.enableAGC();
    //device.setIFGain(10);
    device.setSampleRate(sampleRate);//captureRate
    //device.setOcillatorFrequency(28800000);
    //device.centerFrequency = frequency;
    //frequencyOffset = captureFreq - frequency;
    //device.bufferNumber = 5;
    //device.bufferLength = Math.floor(sampleRate / device.bufferNumber);
};

let setGain = (gain) => {
    if (gain == 99) {
        device.setGainByIndex(0);
        device.enableAGC();
    } else {
        device.setGainByIndex(gains[gain]);
    }
    console.log(device.getGain());
};

//let getDevices = () => {
//    return sdrjs.getDevices();
//};


let startDevice = () => {
    if (null != device) {
        setFrequency(parseInt(freqText.value));
        console.log(device.getGain());
        console.log(device.getSampleRate());
        device.start();
    }
};

let stopDevice = () => {
    if (null != device) {
        device.stop();
    }
};

let closeDevice = () => {
    if (null != device) {
        device.stop();
        device.close();
        device = null;
    }
};

let listen = () => {
    device.get().on('data', function (data) {
        //console.log(data.length);
        if (data.length > 12) {
            sendData(data);
        }
    });
};

//var outS = fs.createWriteStream('out.raw');

var event = new Event('change');

decoder.addEventListener('message', function (msg) {
    processMessage(msg);
});

let processMessage = (msg) => {
    var level = msg.data[2]['signalLevel'];
    var left = new Float32Array(msg.data[0]);
    var right = new Float32Array(msg.data[1]);
    stereoText.innerText = msg.data[2]['stereo'];
    levelText.innerText = level.toFixed(2);
    levelText.dispatchEvent(event);
    //play(left, right, level, 0.05);
    player.play(left, right);
};

let sendData = (data) => {
    var send = arraybuffer(data.buffer);
    decoder.postMessage([0, send, stereo, offset, sampleRate], [send]);
    //decoder.postMessage([0, data.buffer, stereo, offset, sampleRate], [data.buffer]);
};

onBtn.addEventListener('click', function (event) {
    decoder.postMessage([1, 'WBFM', sampleRate]);
    //device.start()

    if (null == device) {
        //device = new TcpDevice(0);
        device = new RtlDevice(0);
        //devices = getDevices();
        //device = devices[0];
        device.openDevice();
        //freqText.value = 91000000;
        setDeviceParams();
        listen();
    } else {
        device.openDevice();
    }
    //listen()
});

offBtn.addEventListener('click', function (event) {
    levelText.removeEventListener('change', scanDownEvent, true);
    levelText.removeEventListener('change', scanUpEvent, true);
    closeDevice();
});

freqText.addEventListener('change', function (event) {
    levelText.removeEventListener('change', scanDownEvent, true);
    levelText.removeEventListener('change', scanUpEvent, true);
    localStorage.lastFequency = freqText.value;
    setFrequency(parseInt(freqText.value));
});

gainText.addEventListener('change', function (event) {
    setGain(parseInt(gainText.value));
});

startBtn.addEventListener('click', function () {
    levelText.removeEventListener('change', scanDownEvent, true);
    levelText.removeEventListener('change', scanUpEvent, true);
    startDevice();
    startBtn.disabled = true;
});

stopBtn.addEventListener('click', function () {
    levelText.removeEventListener('change', scanDownEvent, true);
    levelText.removeEventListener('change', scanUpEvent, true);
    stopDevice();
    startBtn.disabled = false;
});

let openSettingsWindow = () => {
    window.open(__dirname + '/settings/settings.html', '', 'width=390, height=582, top=15, left=15, , toolbar=0, menubar=0, scrollbars=1, resizable=1, copyhistory=0, location=0, directories=0, status=1, titlebar=1, personalbar=0');
};

settingsBtn.addEventListener('click', function () {
    openSettingsWindow();
});

freqDownBtn.addEventListener('click', function () {
    levelText.removeEventListener('change', scanDownEvent, true);
    levelText.removeEventListener('change', scanUpEvent, true);
    freqDown();
});

freqUpBtn.addEventListener('click', function () {
    levelText.removeEventListener('change', scanDownEvent, true);
    levelText.removeEventListener('change', scanUpEvent, true);
    freqUp();
});

stereoBtn.addEventListener('click', function () {
    stereo = true;
});

monoBtn.addEventListener('click', function () {
    stereo = false;
});

scanDown.addEventListener('click', function () {
    levelText.removeEventListener('change', scanUpEvent, true);
    freqDown();
    levelText.addEventListener('change', scanDownEvent, true);
});

scanUp.addEventListener('click', function () {
    levelText.removeEventListener('change', scanDownEvent, true);
    freqUp();
    levelText.addEventListener('change', scanUpEvent, true);
});

let found;
var count = 0;
let scanDownEvent = (event) => {
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
};

let scanUpEvent = (event) => {
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
};

let getFrequency = () => {
    return parseInt(freqText.value);
};

let setFrequency = (frequency) => {
    if (device) {
        device.setCenterFrequency(frequency + offset);
    }
    freqText.value = frequency;
};

let freqDown = () => {
    setFrequency(getFrequency() - 100000);
};

let freqUp = () => {
    setFrequency(getFrequency() + 100000);
};

let getLevel = () => {
    return parseFloat(levelText.innerText);
};

let openCastWindow = () => {
    window.open(__dirname + '/cast.html');
};

castBtn.addEventListener('click', () => {
    openCastWindow();
});


