const net = require('net');

const SET_FREQUENCY = '0x01';
const SET_SAMPLERATE = '0x02';
const SET_GAINMODE = '0x03';
const SET_GAIN = '0x04';
const SET_PPM = '0x05';
const SET_IF_GAIN = '0x06';
const SET_TEST_MODE = '0x07'
const SET_AGC_MODE = '0x08';
const SET_DIRECT_SAMPLING = '0x09';
const SET_OFFET_TUNING = '0x0a';
const SET_RTL_XTAL = '0x0b';
const SET_TUNER_XTAL = '0x0c';
const SET_GAIN_BY_INDEX = '0x0d';
const SET_END = '0xff';


function TcpDevice(index) {

    this.client = new net.Socket();
    this.validGains = [0, 9, 14, 27, 37, 77, 87, 125, 144, 157, 166, 197, 207, 229, 254, 280, 297, 328, 338, 364, 372, 386, 402, 421, 434, 439, 445, 480, 496];

    tcpCommand = (command, value) => {
        var buffer = new Buffer.alloc(5)
        buffer.writeUInt8(command, 0, noAssert = false)
        buffer.writeUInt32BE(parseInt(value), 1, noAssert = false)
        var answer = this.client.write(buffer);
        console.log('answer ', answer);
    }

    get = () => {
        return this.client;
    }

    open = () => {
        this.client.connect(1234, 'localhost', function () {
            console.log('Connected');
            //client.write('Hello, server! Love, Client.');
        });
    }

    close = () => {
        this.client.destroy();
    }

    start = () => {
        //this.device.start();
    }

    stop = () => {
        //this.client.destroy();
    }

    setSampleRate = (sampleRate) => {
        this.sampleRate = sampleRate;
        tcpCommand(SET_SAMPLERATE, sampleRate);
    }

    getSampleRate = () => {
        return this.sampleRate;
    }

    setCenterFrequency = (centerFrequency) => {
        this.centerFrequency = centerFrequency;
        tcpCommand(SET_FREQUENCY, centerFrequency);
    }

    getCenterFrequency = () => {
        return this.centerFrequency;
    }

    enableAGC = () => {
        tcpCommand(SET_AGC_MODE, 1)
    }

    disableManualTunerGain = () => {
        tcpCommand(SET_GAINMODE, 0);
    }

    getValidGains = () => {
        return this.validGains;
    }

    setGainByIndex = (gain) => {
        tcpCommand(SET_GAIN_BY_INDEX, gain);
    }

    return {
        open: open,
        close: close,
        start: start,
        stop: stop,
        setSampleRate: setSampleRate,
        getSampleRate: getSampleRate,
        setCenterFrequency: setCenterFrequency,
        getCenterFrequency: getCenterFrequency,
        enableAGC: enableAGC,
        disableManualTunerGain: disableManualTunerGain,
        getValidGains: getValidGains,
        setGainByIndex: setGainByIndex,
        get: get
    }
}

module.exports = TcpDevice;