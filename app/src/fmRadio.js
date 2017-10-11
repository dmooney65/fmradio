//const fs = require('fs');
//const remote = require('electron').remote;
const RtlDevice = require('./device/rtldevice.js');
//const TcpDevice = require('./device/tcpdevice.js').TcpDevice;
//const main = remote.require('../app/main.js');
const freqDisplay = require('./frequencies.js')();
const arraybuffer = require('to-arraybuffer');
const $ = require('jquery');
let decoder;// = new Worker('demodulator/decode-worker.js');
const sampleRates = [288000, 960000, 1200000, 1440000, 2048000, 2400000, 2560000, 2700000, 2880000];
let sampleRate = localStorage.sampleRate ? localStorage.sampleRate : sampleRates[6];

const upnp = require('./audio/upnpPlayer.js');
let player = upnp.Player();

let device;
let offset = localStorage.frequencyOffset ? localStorage.frequencyOffset : 250000;
let stereo = localStorage.stereo ? localStorage.stereo : 'false';
let gains = [];


//const onBtn = document.getElementById('radio-on');
//const offBtn = document.getElementById('radio-off');
const settingsBtn = document.getElementById('settings');
//const csdrBtn = document.getElementById('open-csdr');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const freqDownBtn = $('#freqDown');
const freqUpBtn = $('#freqUp');
const scanDown = $('#scanDown');
const scanUp = $('#scanUp');
const freqText = $('#freq');
const gainText = $('#gain');
gainText.val('0');
const levelText = $('#level');
const stereoText = $('#isStereo');
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
    if (gain == 0) {
        device.setGainByIndex(0);
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
    freqText.val(freqDisplay.humanReadable(frequency, true, 2));
    localStorage.lastFequency = frequency;
};

if (localStorage.lastFrequency) {
    console.log('localStorahe has ' + localStorage.lastFrequency);
    setFrequency(localStorage.lastFrequency);
} else {
    console.log('no localStorage value');
    setFrequency(parseInt('91000000'));
}

let startDevice = () => {
    if (null != device) {
        //listen();
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

document.addEventListener('DOMContentLoaded', function () {

    initListeners(); // add listers

});

let initListeners = () => {
    $('#radio-on').click(function () {
        decoder = new Worker('demodulator/decode-worker.js');
        decoder.addEventListener('message', function (msg) {
            processMessage(msg);
        });
        decoder.postMessage([1, 'WBFM', sampleRate]);

        if (null == device) {
            //device = TcpDevice();
            device = RtlDevice(0);
            //devices = getDevices();
            //device = devices[0];
            device.openDevice();
            //freqText.value = 91000000;
            setDeviceParams();
            listen();
        } else {
            device.openDevice();
        }
    });

    $('#radio-off').click(function () {
        closeDevice();
    });

    freqText.change(function () {
        localStorage.lastFequency = freqText.val();
        setFrequency(freqDisplay.parseReadableInput(freqText.val()));
    });

    gainText.change(function () {
        setGain(parseInt(gainText.val()));
    });

    freqDownBtn.click(function () {
        freqDown();
    })
    freqUpBtn.click(function () {
        freqUp();
    })


    scanDown.click(function () {
        var found = false;
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
                    found = true;
                    $(this).off(event);
                }
            }
        });
    });

    scanUp.click(function () {
        var found = false;
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
                    found = true;
                    $(this).off(event);
                }
            }
        });
    });
};


startBtn.addEventListener('click', function () {
    //levelText.removeEventListener('change', scanDownEvent, true);
    //levelText.removeEventListener('change', scanUpEvent, true);
    startDevice();
    startBtn.disabled = true;
});

stopBtn.addEventListener('click', function () {
    //levelText.removeEventListener('change', scanDownEvent, true);
    //levelText.removeEventListener('change', scanUpEvent, true);
    player.pause();
    stopDevice();
    startBtn.disabled = false;
});

let openSettingsWindow = () => {
    window.open(__dirname + '/settings/settings.html', '', 'width=390, height=582, top=15, left=15, , toolbar=0, menubar=0, scrollbars=1, resizable=1, copyhistory=0, location=0, directories=0, status=1, titlebar=1, personalbar=0');
};

settingsBtn.addEventListener('click', function () {
    openSettingsWindow();
});



stereoBtn.addEventListener('click', function () {
    stereo = true;
});

monoBtn.addEventListener('click', function () {
    stereo = false;
});

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

let openCastWindow = () => {
    window.open(__dirname + '/cast.html');
};

castBtn.addEventListener('click', () => {
    openCastWindow();
});


