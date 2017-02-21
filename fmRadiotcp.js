
const remote = require('electron').remote;
const main = remote.require('./main.js');
const sdrjs = require('sdrjs');
//const audio = require('./demodulator/audio.js');
const arraybuffer = require('to-arraybuffer');
const decoder = new Worker('demodulator/decode-worker.js');
//const localPlayer = require('./localPlayer.js');
const upnpPlayer = require('./upnpPlayer.js');
const net = require('net');


//let player = audio.Player();
let device;
let frequencyOffset = 0;
let isStereo = false;

const onBtn = document.getElementById('radio-on')
const offBtn = document.getElementById('radio-off')
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

SET_FREQUENCY = '0x01';
SET_SAMPLERATE = '0x02';
SET_GAINMODE = '0x03';
SET_GAIN = '0x04';
SET_PPM = '0x05';
SET_IF_GAIN = '0x06';
SET_TEST_MODE = '0x07'
SET_AGC_MODE = '0x08';
SET_DIRECT_SAMPLING = '0x09';
SET_OFFET_TUNING = '0x0a';
SET_RTL_XTAL = '0x0b';
SET_TUNER_XTAL = '0x0c';
SET_GAIN_BY_INDEX = '0x0d';
SET_END = '0xff';

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
    device.sampleRate = 2302000 //captureRate
    device.rtlOcillatorFrequency = 28800000
    //device.centerFrequency = frequency;
    //frequencyOffset = captureFreq - frequency;
    device.bufferNumber = 5;
    device.bufferLength = Math.floor(sampleRate / device.bufferNumber);
}

var client = new net.Socket();

tcpCommand = (command, value) => {
    var buffer = new Buffer.alloc(5)
    buffer.writeUInt8(command, 0, noAssert = false)
    buffer.writeUInt32BE(parseInt(value), 1, noAssert = false)
    client.write(buffer)
}

setClientParams = () => {
    tcpCommand(SET_GAINMODE, 0)
    tcpCommand(SET_AGC_MODE, 1)
    //tcpCommand(SET_GAIN, 84)
    tcpCommand(SET_DIRECT_SAMPLING, 0)
    tcpCommand(SET_OFFET_TUNING, 0)
    tcpCommand(SET_SAMPLERATE, 2400000)
    //tcpCommand(SET_FREQUENCY, 91000000)
    //this.tcpCommand(SET_GAIN_BY_INDEX,5)
}


getDevices = () => {
    return sdrjs.getDevices()
}


startDevice = () => {
    //setFrequency(93200000)
    //listentcp()
    //if (null != device) {
    //    setFrequency(parseInt(freqText.value));
    //    device.start();
    //}
}

stopDevice = () => {
    client.destroy();
    //if (null != device) {
    //    device.stop();
    //}
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

listentcp = () => {
    client.on('data', function (data) {
        //console.log(data.length)
        if (data.length > 12) {
            sendData(data, 0);
        }
    })
}

decoder.addEventListener('message', function (msg) {
    var level = msg.data[2]['signalLevel'];
    var left = new Float32Array(msg.data[0]);
    var right = new Float32Array(msg.data[1]);
    stereoText.innerText = msg.data[2]['stereo'];
    levelText.innerText = level.toFixed(2);
    var event = new Event('change');
    levelText.dispatchEvent(event);
    //player.setVolume(0.9)
    //player.play(left, right, level, 0.1)
    //localPlayer.play(left, right);
    upnpPlayer.play(left, right);

})

called = 0
var buffer1;
var buffer2;
var buffer3;
var buffer4;
doSend = (data) => {
    //console.log(called)
    /*if (called == 0) {
        buffer1 = data
        called++
    }
    else if (called == 1) {
        buffer2 = data
        called++
    } else if (called == 2) {
        buffer3 = data
        called++
    } else if (called == 3) {
        buffer4 = data
        called++
    } else {
        called = 0;
        var buf = Buffer.concat([buffer1, buffer2, buffer3, buffer4])*/
    //var send = arraybuffer(data);
    var buf = Buffer.from(data)
    decoder.postMessage([0, buf.buffer, isStereo, 0], [buf.buffer]);
    //}
    //

    //called ++
}

sendData = function (data, offset) {
    // not needed for rtl_tcp

    //var send = arraybuffer(data);
    //var buf = Buffer.from(data)

    decoder.postMessage([0, data.buffer, isStereo, offset], [data.buffer]);
}

onBtn.addEventListener('click', function (event) {
    client.connect(1234, 'localhost', function () {
        console.log('Connected');
        //client.write('Hello, server! Love, Client.');
    });
    setClientParams()
    setFrequency(91000000)
    listentcp()
    decoder.postMessage([1, "WBFM"])
    //device.start()

    /*if (null == device) {
        devices = getDevices()
        device = devices[0]
        device.open()
        freqText.value = 93200000
        setDeviceParams(93200000)
        listen()
    } else {
        device.open()
    }*/
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
    if (getLevel() < 0.7) {
        if (count < 24) {
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
    if (getLevel() < 0.7) {
        if (count < 24) {
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
    //client.write('Hello, server! Love, Client.');
    tcpCommand(SET_FREQUENCY, frequency)
    freqText.value = frequency
    //device.centerFrequency = freqText.value = frequency
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