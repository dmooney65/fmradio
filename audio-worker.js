
//const audio = require('./demodulator/audio.js')
//const localPlayer = require('./localPlayer.js');
//const upnpPlayer = require('./upnpPlayer.js');
//let player = audio.Player();
importScripts('localPlayer.js');
//importScripts('audio.js');
//importScripts('upnpPlayer.js');


function AudioWorker() {
    let player = new Player();

    function process(left, right, level, squelch) {

        play(left, right);
        //upnpPlayer.play(left, right);
        //player.play(left, right, level, 0.05);
    }

    return {
        process: process,
        setMode: setMode
    };

}

var audioWorker = new AudioWorker();

onmessage = function (event) {
    audioWorker.process(event.data[0], event.data[1], event.data[2], event.data[3]);
};
