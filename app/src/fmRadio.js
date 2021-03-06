const { dialog } = require('electron').remote;
const RtlDevice = require('./device/rtldevice.js');
let frequencies = require('./frequencies.js')();

let device;
let offset;
const arraybuffer = require('to-arraybuffer');
const $ = require('jquery');
const userSettings = require('./settings/settings.js')();
let decoder;

const audio = require('./audio/player.js');
let player = audio.Player();

let stereo;


const powerBtn = $('#power');
const settingsBtn = $('#settings');
const playPauseBtn = $('#play-pause');
const freqDownBtn = $('#freqDown');
const freqUpBtn = $('#freqUp');
const scanDown = $('#scanDown');
const scanUp = $('#scanUp');
const freqText = $('#freq');
const levelText = $('#level');
const meter = $('meter');
const stereoText = $('#isStereo');
const stereoBtn = $('#stereo');
const muteBtn = $('#mute');
const recordBtn = $('#record');

window.eval = global.eval = function () {
    throw new Error('Sorry, this app does not support window.eval().');
};

let setDeviceParams = () => {
    device.enableAGC();
    device.disableManualTunerGain();
    device.setGain(0);
    device.setSampleRate(sampleRate);
    device.setFrequencyCorrection(userSettings.get('ppm'));
};

let setGain = (gain) => {
    if (gain == 'auto') {
        device.disableManualTunerGain();
        device.enableAGC();
        device.setGain(0);
    } else {
        device.enableManualTunerGain();
        device.disableAGC();
        device.setGain(parseInt(gain));
    }
};




let startDevice = () => {
    if (null != device) {
        frequencies.setFrequency(frequencies.getFrequency());
        //console.log(device.getGain());
        //console.log(device.getSampleRate());
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
    if (decoder) {
        decoder.terminate();
        decoder = null;
    }
};

let listen = () => {
    device.get().on('data', function (data) {
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
    meter.val(level);
    player.play(left, right);
};

let sendData = (data) => {
    //First for TcpDevice
    //decoder.postMessage([0, data.buffer, stereo, offset, sampleRate], [data.buffer]);
    decoder.postMessage([0, arraybuffer(data.buffer), stereo, offset, sampleRate], [arraybuffer(data.buffer)]);
};

let setupDevice = () => {
    if (null == device) {
        //device = TcpDevice();
        device = RtlDevice.Device(0);
        device.openDevice();
        setDeviceParams();
        listen();
    } else {
        device.openDevice();
    }
    device.setCenterFrequency(frequencies.getFrequency());
    var gains = device.getValidGains();
    var list = document.getElementById('gainsList');
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.setAttribute('id', 'gain-auto');
    link.appendChild(document.createTextNode('Auto'));
    link.href = '#';
    li.appendChild(link);
    list.appendChild(li);
    $('#gain-auto').click(function (e) {
        e.preventDefault();
        setGain('auto');
        //$('#gainText').text('Auto');        
    });
    for (var i = 0; i < gains.length; i++) {
        li = document.createElement('li');
        link = document.createElement('a');
        link.setAttribute('id', 'gain-' + gains[i]);
        link.appendChild(document.createTextNode(gains[i]));

        link.href = '#';
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var value = this.getAttribute('id').split('-')[1];
            setGain(value);
            //$('#gainText').text(value);
        });

        li.appendChild(link);
        list.appendChild(li);
    }
};

let isPlaying = false;
let setPlaying = (playing) => {
    if (!playing) {
        $('#play-pause').find('span').removeClass('glyphicon-pause').addClass('glyphicon-play');
        meter.val('');
    } else {
        $('#play-pause').find('span').removeClass('glyphicon-play').addClass('glyphicon-pause');
    }
    isPlaying = playing;
};

let sampleRate;

document.addEventListener('DOMContentLoaded', function () {

    initListeners(); // add listers

});

let initListeners = () => {

    if (!userSettings.get('sampleRate')) {
        userSettings.generateDefault();
    }
    sampleRate = parseInt(userSettings.get('sampleRate'));
    if (userSettings.get('offsetTuning')) {
        if (sampleRate < 900000) {
            offset = 25000;
        } else {
            offset = 250000;
        }
    } else {
        offset = 0;
    }

    frequencies.setFrequency(userSettings.get('lastFrequency'));

    const presetManager = require('./presets/presetManager.js')(device, offset);
    presetManager.rebuild();
    let poweredOn = false;
    
    powerBtn.click(function () {
        levelText.off();
        if (!poweredOn) {
            if (RtlDevice().getDevices().length > 0) {
                setupDevice();
                playPauseBtn.removeClass('disabled');
                recordBtn.removeClass('disabled');
                $(this).removeClass('text-danger').addClass('text-success');
                poweredOn = true;
            } else {
                dialog.showErrorBox('Cound not find compatible RTL2832U device.', 'Please make sure your device is attached to a USB port and correctly configured');
                $(this).addClass('text-danger');
            }
        } else {
            player.pause();
            if (player.isRecording()) {
                player.stopRecording();
            }
            closeDevice();
            playPauseBtn.addClass('disabled');
            recordBtn.addClass('disabled').removeClass('text-success');
            $(this).removeClass('text-success');
            poweredOn = false;
        }
        setPlaying(false);
    });

    playPauseBtn.click(function () {
        levelText.off();
        if (!isPlaying) {
            if (!decoder) {
                decoder = new Worker('../demodulator/decode-worker.js');
                decoder.addEventListener('message', function (msg) {
                    processMessage(msg);
                });
                decoder.postMessage([1, 'WBFM', sampleRate]);
            }
            startDevice();
            player.start();
            setPlaying(true);

        } else {
            player.pause();
            stopDevice();
            setPlaying(false);
        }
    });


    freqText.change(function () {
        levelText.off();
        frequencies.setFrequency(frequencies.parseReadableInput(freqText.val()));
    });

    freqDownBtn.click(function () {
        levelText.off();
        freqDown();
    });
    freqUpBtn.click(function () {
        levelText.off();
        freqUp();
    });
    
    let scan = (freqFn) => {
        levelText.off();
        var weak = 0;
        var strong = 0;
        freqFn();
        levelText.on('change', function (event) {
            if (Number(levelText.text()) < 0.65) {
                weak++;
                if (weak >= 10) {
                    freqFn();
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
    };

    scanDown.click(function () {
        scan(freqDown);
    });

    
    scanUp.click(function () {
        scan(freqUp);
    });
    settingsBtn.click(function () {
        window.open(__dirname +
            '/settings/settings.html', '', 'width=460, height=665, top=15, left=15, toolbar=0, menubar=0, scrollbars=1, resizable=1, copyhistory=0, location=0, directories=0, status=1, titlebar=1, personalbar=0');
    });

    stereo = userSettings.get('stereo');
    if (stereo) {
        stereoBtn.addClass('text-success');
    }

    stereoBtn.click(function () {
        if (!stereoBtn.hasClass('text-success')) {
            stereoBtn.addClass('text-success');
            stereo = true;
        } else {
            stereoBtn.removeClass('text-success');
            stereo = false;
        }
    });

    muteBtn.click(function () {
        if (!muteBtn.hasClass('text-success')) {
            muteBtn.addClass('text-success');
            player.mute();
        } else {
            muteBtn.removeClass('text-success');
            player.unMute();
        }
    });

    recordBtn.click(function () {
        var btn = $(this);
        if (!btn.hasClass('text-success')) {
            btn.addClass('text-success');
        } else {
            btn.removeClass('text-success');
        }
        player.record();
    });

    $('.dropdown').on('click', '.dropdown-menu li a', function () {
        //Adds active class to selected item
        $(this).parents('.dropdown-menu').find('li').removeClass('active');
        $(this).parent('li').addClass('active');

        //Displays selected text on dropdown-toggle button
        $(this).parents('.dropdown').find('.dropdown-toggle span.text-muted').text($(this).text());
    });
};


let freqDown = () => {
    frequencies.setFrequency(frequencies.getFrequency() - 100000);
};

let freqUp = () => {
    frequencies.setFrequency(frequencies.getFrequency() + 100000);
};

module.exports.getDevice = () => {
    return device;
};

module.exports.getOffset = () => {
    return offset;
};

module.exports.getFreqText = () => {
    return freqText.val();
};

