'use strict';

//
// UPnP SSDP Internet Gateway Device Discovery Example
//

var dgram         = require('dgram')
  , ssdpAddress   = '239.255.255.250'
  , ssdpPort      = 1900
  , sourceIface   = '0.0.0.0'         // or ip (i.e. '192.168.1.101', '10.0.1.2')
  , sourcePort    = 65001             // 0 for random
//  , searchTarget  = 'urn:schemas-upnp-org:device:InternetGatewayDevice:1'
  , searchTarget  = 'urn:schemas-upnp-org:device:MediaRenderer:1'
  , socket
  ;

function broadcastSsdp() {
  var query
    ;

  // described at bit.ly/1zjVJVW
  query = new Buffer(
    'M-SEARCH * HTTP/1.1\r\n'
  + 'HOST: ' + ssdpAddress + ':' + ssdpPort + '\r\n'
  + 'MAN: "ssdp:discover"\r\n'
  + 'MX: 1\r\n'
  + 'ST: ' + searchTarget + '\r\n'
  + '\r\n'
  );

  // Send query on each socket
  socket.send(query, 0, query.length, ssdpPort, ssdpAddress);
}

function createSocket() {
  socket = dgram.createSocket('udp4');

  socket.on('listening', function () {
    console.log('socket ready...');

    broadcastSsdp();
  });

  socket.on('message', function (chunk, info) {
    var message = chunk.toString('utf8');

    console.log('[MESSAGE RECEIVED]');
    console.log(info);
    console.log(message);
  });

  console.log('Will bind to', (sourceIface + ':' + sourcePort));
  socket.bind(sourcePort, sourceIface);
}

createSocket();
