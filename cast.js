var upnp = require('node-upnp-utils');

// Set an event listener for 'added' event
upnp.on('added', (device) => {
  // This callback function will be called whenever an device is found.
  console.log(device['address']);
  console.log(device['description']['device']['friendlyName']);
  console.log(device['description']['device']['deviceType']);
  console.log(device['headers']['LOCATION']);
  console.log(device['headers']['USN']);
  console.log('------------------------------------');
});

// Start the discovery process
upnp.startDiscovery();

// Stop the discovery process in 15 seconds
setTimeout(() => {
  upnp.stopDiscovery(() => {
    console.log('Stopped the discovery process.');
    process.exit();
  });
}, 15000);


var devices =upnp.getActiveDeviceList();
console.log(devices);