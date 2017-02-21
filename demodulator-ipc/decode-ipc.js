const net = require('net');
var dsp = require('./dsp.js');
//importScripts(`${__dirname}/../../../demodulator/demodulator-am.js`);
//importScripts(`${__dirname}/../../../demodulator/demodulator-ssb.js`);
//importScripts(`${__dirname}/../../../demodulator/demodulator-nbfm.js`);
var demod_wbfm = require('./demodulator-wbfm.js');
//const localPlayer = require('../localPlayer.js');
//const upnpPlayer = require('../upnpPlayer.js');

const cp = require('child_process');

var options = { stdio: [0, 1, 2, 'ipc'] };

const player = cp.spawn('node', ['./localPlayer-ipc.js'], options);

//player.on('message', function(msg){
//  console.log('from player: ',m)
//})

player.send('hello')

//var playerPipe = decoder.stdio[0];

//playerPipe[0].on('data', 
//    function (data) {
//        console.log('tail output: ');
//    }
//);

var IN_RATE = process.argv[2];
var OUT_RATE = process.argv[3];


//process.stdin.resume();
// Listen for incoming data:
//process.stdin.on('data', function (data) {
//    console.log('Received data: ', data.length);
//});

console.log(IN_RATE)
console.log(OUT_RATE)
//process.exit(0);

process.stdin.on('data', function (buf) {
  console.log('stdin msg')
})

process.stdout.on('data', function (buf) {
  console.log('stdout msg')
})

process.on("message", function (msg, socket) {
  socket.resume();
  socket.on("data", function (data) {
    processData(data, false, 0, {});
  });
});

//processData(0, new Uint8Array(), false, 0);
var pipe = new net.Socket({ fd: 4 });
pipe.on('data', function (buf) {
  //console.log('got it pipe')
  processData(buf, false, 0, {});

  //console.log(buf)
});
var outPipe = new net.Socket({ fd: 3 });
outPipe.on('data', function (buf) {
  //console.log('got it pipe')
  //processData(buf, false, 0, {});

  //console.log(buf)
});

/**
 * A class to implement a worker that demodulates an FM broadcast station.
 * @constructor
 */
//function Decoder() {
var demodulator = demod_wbfm.Demodulator_WBFM(IN_RATE, OUT_RATE);
var cosine = 1;
var sine = 0;

/**
 * Demodulates the tuner's output, producing mono or stereo sound, and
 * sends the demodulated audio back to the caller.
 * @param {ArrayBuffer} buffer A buffer containing the tuner's output.
 * @param {boolean} inStereo Whether to try decoding the stereo signal.
 * @param {number} freqOffset The frequency to shift the samples by.
 * @param {Object=} opt_data Additional data to echo back to the caller.
 */
function processData(buf, inStereo, freqOffset) {
  var data = {};
  var IQ = dsp.iqSamplesFromUint8(buf, IN_RATE);
  //console.log(IQ)
  IQ = dsp.shiftFrequency(IQ, freqOffset, IN_RATE, cosine, sine);
  cosine = IQ[2];
  sine = IQ[3];

  var out = demodulator.demodulate(IQ[0], IQ[1], inStereo);
  //console.log('out.left', out.left)
  data['stereo'] = out['stereo'];
  data['signalLevel'] = out['signalLevel'];
  //console.log(out.left)
  //process.stdout.write(JSON.stringify(out));
  player.send([out.left, out.right, data])
  //outPipe.write(JSON.stringify(out))
  //localPlayer.play(out.left, out.right);
  //upnpPlayer.play(left, right)
  //pipe.write(buf)
}

    /**
     * Changes the modulation scheme.
     * @param {Object} mode The new mode.
     */
    /*function setMode(mode) {
      switch (mode.modulation) {
        case 'AM':
          demodulator = new Demodulator_AM(IN_RATE, OUT_RATE, mode.bandwidth);
          break;
        case 'USB':
          demodulator = new Demodulator_SSB(IN_RATE, OUT_RATE, mode.bandwidth, true);
          break;
        case 'LSB':
          demodulator = new Demodulator_SSB(IN_RATE, OUT_RATE, mode.bandwidth, false);
          break;
        case 'NBFM':
          demodulator = new Demodulator_NBFM(IN_RATE, OUT_RATE, mode.maxF);
          break;
        default:
          demodulator = new Demodulator_WBFM(IN_RATE, OUT_RATE);
          break;
      }
    }*/

    //return {
    //  process: process,
    //  setMode: setMode
    //};
    //}

    //var decoder = new Decoder();

    //self.onmessage = function(event) {
    //console.log('received')
    //postMessage('child received');
    //switch (event.data[0]) {
    //case 1:
    //setMode(event.data[1]);
    //break;
    //default:
    //processData(event.data[1], event.data[2], event.data[3], event.data[4]);
    //console.log(event.data[1])
    //break;
    //}
//};