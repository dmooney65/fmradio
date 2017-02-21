const localPlayer = require('./localPlayer.js');
//const upnpPlayer = require('./upnpPlayer.js');
const arraybuffer = require('to-arraybuffer');
var IN_RATE = 1024000;
var OUT_RATE = 48000

//var demod_wbfm = require('./demodulator-ipc/demodulator-wbfm.js');
//var demodulator = demod_wbfm.Demodulator_WBFM(1024000, 48000);



var isStereo = false;
var offser = 0;

const net = require('net');

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

var client = new net.Socket();

exports.getClient = () => {
    return client;
}

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
    tcpCommand(SET_SAMPLERATE, IN_RATE)
    tcpCommand(SET_FREQUENCY, 93200000)
    //this.tcpCommand(SET_GAIN_BY_INDEX,5)
}


/*decoder.addEventListener('message', function (msg) {
    var level = msg.data[2]['signalLevel'];
    var left = new Float32Array(msg.data[0]);
    var right = new Float32Array(msg.data[1]);
    //stereoText.innerText = msg.data[2]['stereo'];
    //levelText.innerText = level.toFixed(2);
    //var event = new Event('change');
    //levelText.dispatchEvent(event);
    localPlayer.play(left, right);
    //upnpPlayer.play(left, right)
})*/

startDevice = (ipAddress, port) => {
    var handle = client.connect(port, ipAddress, function () {
        console.log('Connected');
        //client.write('Hello, server! Love, Client.');
    });
    setClientParams()
    //decoder.send('socket', client)
    //decoder.send([1, "WBFM"])
    //listenTcp()
}

const cp = require('child_process');

var options = { stdio: [0, 1, 2, 'pipe', 'pipe'] };

const decoder = cp.spawn('node', [`${__dirname}/demodulator-ipc/decode-ipc.js`, IN_RATE, OUT_RATE], options);

var values = require('object.values');
values.shim();


decoder.stdio[3].on('data', function (msg) {
    //console.log(msg)
    //console.log(msg[2]['signalLevel'])
    var level = msg[2]['signalLevel'];
    var left = new Float32Array(Object.values(msg[0]));
    var right = new Float32Array(Object.values(msg[1]));
    //console.log(left)
    //stereoText.innerText = msg.data[2]['stereo'];
    //levelText.innerText = level.toFixed(2);
    //var event = new Event('change');
    //levelText.dispatchEvent(event);
    localPlayer.play(left, right);
    //upnpPlayer.play(left, right)
})


//decoder.send('hello');

//decoder.send('hello');

var pipe = decoder.stdio[4];
var inPipe = decoder.stdio[3]
//pipe.write('hello');

/*pipe.on('data', 
    function (data) {
        //console.log('tail output: ');
    }
);*/

listenTcp = () => {
    client.on('data', function (data) {
        //console.log(data)
        if (data.length > 12) {
            //var send = arraybuffer(data)
            //sendData(data, 0);
            //decoder.postMessage([0, data, false, 0], [data]);
            //decoder.postMessage(data);
            //decoder.send(data)
            pipe.write(data)
        }
    })
    //client.destroy()
}

startDevice('localhost', '1234');

listenTcp()
