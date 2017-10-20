const fs = require('fs');
const path = require('path');

const os = require('os');
const $ = require('jquery');
const flac = require('node-flac');
const httpServer = require('./server.js');
const userSettings = require('../settings/settings.js')();


module.exports.Player = function () {

    function writeSamples(leftSamples, rightSamples) {
        let out = new Int16Array(leftSamples.length * 2);
        for (var i = 0; i < leftSamples.length; ++i) {
            out[i * 2] =
                Math.floor(Math.max(-1, Math.min(1, leftSamples[i])) * 32767);
            out[i * 2 + 1] =
                Math.floor(Math.max(-1, Math.min(1, rightSamples[i])) * 32767);
        }

        return Buffer.from(out.buffer);
    }

    let writer = new flac.FlacEncoder({ sampleRate: 48000, bitDepth: 16, float: false, signed: true });
    let fileWriter;

    let audioElement;
    let recording = false;
    let muted = false;
    let server = httpServer.Server(1337, writer);

    const pause = () => {
        server.stop();
        if (userSettings.get('localPlayer') && audioElement) {
            audioElement.pause();
        }
    };

    const start = () => {
        server.start();
        if (userSettings.get('localPlayer')) {
            if (!audioElement) {
                createAudioElement();
                $('#audioParent').append(audioElement);
                audioElement.setAttribute('src', 'http://' + os.hostname() + ':1337/');
            } else {
                audioElement.play();
            }
        }
    };

    const formatField = (val) => {
        return (0 + val.toString()).slice(-2);
    };

    const getDateStr = () => {
        var date = new Date();
        var y = date.getFullYear().toString();
        var m = formatField(date.getMonth() + 1);
        var d = formatField(date.getDate());
        var hh = formatField(date.getHours());
        var mm = formatField(date.getMinutes());
        var ss = formatField(date.getSeconds());
        return y + m + d + hh + mm + ss;
    };

    const record = () => {
        let recordingsPath = userSettings.get('recordingsPath');
        if (!recording) {
            let freqText = require('../fmRadio.js').getFreqText();
            fileWriter = new flac.FlacEncoder({ sampleRate: 48000, bitDepth: 16, float: false, signed: true });
            recording = true;
            fileWriter.pipe(fs.createWriteStream(
                path.join(recordingsPath, freqText.replace(' ', '') + '_' + getDateStr() + '_recording.flac'))
            );

        } else {
            stopRecording();
        }
    };

    const stopRecording = () => {
        recording = false;
        fileWriter.end();
    };

    const isRecording = () => {
        return recording;
    };

    const play = (left, right) => {
        var data = writeSamples(left, right);
        writer.write(data);
        if (recording) {
            fileWriter.write(data);
        }
    };

    const mute = () => {
        muted = true;
        if (audioElement) {
            audioElement.muted = true;
        }
    };

    const unMute = () => {
        muted = false;
        if (audioElement) {
            audioElement.muted = false;
        }
    };

    let createAudioElement = () => {
        audioElement = document.createElement('audio');
        audioElement.setAttribute('id', 'player');
        audioElement.autoplay = true;
        //audioElement.controls = true;
        audioElement.setAttribute('type', 'audio/flac');
        audioElement.muted = muted;
    };

    return {
        play: play,
        pause: pause,
        start: start,
        record: record,
        stopRecording: stopRecording,
        isRecording: isRecording,
        mute: mute,
        unMute: unMute
    };
};
