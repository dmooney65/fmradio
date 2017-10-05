var electron = require('electron')

var fork = require('child_process').fork
var spawn = require('child_process').spawn


var decoder = fork('electron-script.js', {
    env: { 'DISPLAY': process.env.DISPLAY },
    stdio: ['ipc','pipe','pipe','pipe'] ,
    port: '1234',
    ipAddress: '192.168.1.98',
    localAddress: '127.0.0.1',
    localPort: '1234'
})
var pipe = decoder.stdio[3];

pipe.write(Buffer('hello'));

//decoder.on('message', function (m) {
//console.log(m)
//    console.log('Yes it works!')
//})

//decoder.send('message', function (m) {
//    console.log('send it')
//})


// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

const IN_RATE = 2400000
const OUT_RATE = 48000;


let device;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600 })

    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Open the DevTools.
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    if (null != device) {
        stopDevice()
    }
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})



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
    tcpCommand(SET_SAMPLERATE, 2400000)
    tcpCommand(SET_FREQUENCY, 93200000)
    //this.tcpCommand(SET_GAIN_BY_INDEX,5)
}

sendData = function (data, offset) {
    // not needed for rtl_tcp

    //var send = arraybuffer(data);
    //var buf = Buffer.from(data)

    decoder.send([0, data.buffer, true, offset], [data.buffer]);
}

listenTcp = () => {
    client.on('data', function (data) {
        console.log(data.length)
        if (data.length > 0) {
          //sendData(data, 0);
            decoder.send([0, data, true, 0], [data]);
        }
    })
    client.destroy()
}


exports.startDevice = (ipAddress, port) => {
    var handle = client.connect(port, ipAddress, function () {
        console.log('Connected');
        //client.write('Hello, server! Love, Client.');
    });
    setClientParams()
    decoder.send('socket', client)
    //decoder.send([1, "WBFM"])
    //listenTcp()
}
