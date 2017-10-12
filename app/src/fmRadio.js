//const fs = require('fs');
//const remote = require('electron').remote;
const RtlDevice = require('./device/rtldevice.js');
//const TcpDevice = require('./device/tcpdevice.js').TcpDevice;
//const main = remote.require('../app/main.js');
const freqDisplay = require('./frequencies.js').Frequencies();
const arraybuffer = require('to-arraybuffer');
const $ = require('jquery');
const userSettings = require('./settings/settings.js')();
let decoder;// = new Worker('demodulator/decode-worker.js');

const upnp = require('./audio/upnpPlayer.js');
let player = upnp.Player();

let device;
let offset;
let stereo;
let gains = [];


//const onBtn = document.getElementById('radio-on');
//const offBtn = document.getElementById('radio-off');
const settingsBtn = $('#settings');
//const csdrBtn = document.getElementById('open-csdr');
const startBtn = $('#start');
const stopBtn = $('#stop');
const freqDownBtn = $('#freqDown');
const freqUpBtn = $('#freqUp');
const scanDown = $('#scanDown');
const scanUp = $('#scanUp');
const freqText = $('#freq');
const gainText = $('#gain');
gainText.val('0');
const levelText = $('#level');
const stereoText = $('#isStereo');
const stereoBtn = $('#stereo');
const monoBtn = $('#mono');
const castBtn = $('#cast');

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
        device.disableManualTunerGain();
        //device.setGainByIndex(0);
        device.enableAGC();
    } else {
        device.setGainByIndex(gains[gain]);
    }
    console.log(device.getGain());
};

let setFrequency = (frequency) => {
    if (device) {
        device.setCenterFrequency(frequency + offset);
    }
    if (userSettings.get('lastTuned')) {
        userSettings.set('lastFrequency', frequency);
    }
    freqText.val(freqDisplay.humanReadable(frequency, true, 2));
};


let startDevice = () => {
    if (null != device) {
        setFrequency(getFrequency());
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
    decoder.terminate();
};

let listen = () => {
    device.get().on('data', function (data) {
        //console.log(data.length);
        if (data.length > 12) {
            sendData(data);
        }
    });
};

let processMessage = (msg) => {
    var level = msg.data[2]['signalLevel'];
    var left = new Float32Array(msg.data[0]);
    var right = new Float32Array(msg.data[1]);
    stereoText.text(msg.data[2]['stereo']);
    levelText.text(level.toFixed(2));
    levelText.change();
    player.play(left, right);
};

let sendData = (data) => {
    //First for TcpDevice
    //decoder.postMessage([0, data.buffer, stereo, offset, sampleRate], [data.buffer]);
    decoder.postMessage([0, arraybuffer(data.buffer), stereo, offset, sampleRate], [arraybuffer(data.buffer)]);
};

let sampleRate;

document.addEventListener('DOMContentLoaded', function () {

    initListeners(); // add listers

});

let initListeners = () => {

    if (!userSettings.get('sampleRate')) {
        userSettings.generateDefault();
    }
    if (userSettings.get('offsetTuning')) {
        offset = 250000;
    } else {
        offset = 0;
    }
    stereo = userSettings.get('stereo');
    sampleRate = parseInt(userSettings.get('sampleRate'));
    decoder = new Worker('demodulator/decode-worker.js');
    decoder.addEventListener('message', function (msg) {
        processMessage(msg);
    });
    decoder.postMessage([1, 'WBFM', sampleRate]);

    setFrequency(userSettings.get('lastFrequency'));        
    

    $('#radio-on').click(function () {

        if (null == device) {
            //device = TcpDevice();
            device = RtlDevice(0);
            //devices = getDevices();
            //device = devices[0];
            device.openDevice();
            device.setCenterFrequency(getFrequency());
            setDeviceParams();
            listen();
        } else {
            device.openDevice();
        }
    });

    $('#radio-off').click(function () {
        closeDevice();
    });

    startBtn.click(function () {
        player.start();
        startDevice();
    });

    stopBtn.click(function () {
        player.pause();
        stopDevice();
    });

    freqText.change(function () {
        setFrequency(freqDisplay.parseReadableInput(freqText.val()));
    });

    gainText.change(function () {
        setGain(parseInt(gainText.val()));
    });

    freqDownBtn.click(function () {
        freqDown();
    });
    freqUpBtn.click(function () {
        freqUp();
    });


    scanDown.click(function () {
        var weak = 0;
        var strong = 0;
        freqDown();
        levelText.on('change', function (event) {
            if (getLevel() < 0.45) {
                weak++;
                if (weak >= 10) {
                    freqDown();
                    weak = 0;
                    strong = 0;
                }
            } else {
                strong++;
                if (strong >= 4) {
                    $(this).off(event);
                }
            }
        });
    });

    scanUp.click(function () {
        var weak = 0;
        var strong = 0;
        freqUp();
        levelText.on('change', function (event) {
            if (getLevel() < 0.45) {
                weak++;
                if (weak >= 10) {
                    freqUp();
                    weak = 0;
                    strong = 0;
                }
            } else {
                strong++;
                if (strong >= 4) {
                    $(this).off(event);
                }
            }
        });
    });
    settingsBtn.click(function () {
        window.open(__dirname + '/settings/settings.html', '', 'width=450, height=640, top=15, left=15, , toolbar=0, menubar=0, scrollbars=1, resizable=1, copyhistory=0, location=0, directories=0, status=1, titlebar=1, personalbar=0');
    });

    stereoBtn.click(function () {
        stereo = true;
    });

    monoBtn.click(function () {
        stereo = false;
    });

    castBtn.click(function () {
        window.open(__dirname + '/cast.html');
    });
};



let getFrequency = () => {
    var freq = parseInt(freqDisplay.parseReadableInput(freqText.val()));
    return freq;
};

let freqDown = () => {
    setFrequency(getFrequency() - 100000);
};

let freqUp = () => {
    setFrequency(getFrequency() + 100000);
};

let getLevel = () => {
    return parseFloat(levelText.text());
};


