const player = require('./localPlayer.js')
//const net = require('net');
var values = require('object.values');
values.shim();

console.log(process.argv[0])

//process.send('from player')

process.on('message', function (msg) {
    var level = msg[2]['signalLevel'];
    var left = new Float32Array(Object.values(msg[0]));
    var right = new Float32Array(Object.values(msg[1]));
    //console.log(msg[0])
    //stereoText.innerText = msg.data[2]['stereo'];
    //levelText.innerText = level.toFixed(2);
    //var event = new Event('change');
    //levelText.dispatchEvent(event);
    player.play(left, right);

});

//process.stdin.resume();
// Listen for incoming data:
//process.stdin.on('data', function (data) {
//    console.log('Received data: ', data.length);
//});

//var pipe = new net.Socket({ fd: 0 });
//pipe.on('data', function (buf) {
//  process.send('got it pipePlayer')
  //processData(buf, false, 0, {});

  //console.log(buf)
//});
