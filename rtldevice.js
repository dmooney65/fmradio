const sdrjs = require('sdrjs');


function RtlDevice(index) {

    this.device = sdrjs.getDevices()[index];

    let get = () => {
        return this.device;
    }

    let openDevice = () => {
        this.device.open();
    }

    let close = () => {
        this.device.close();
    }

    let start = () => {
        this.device.start();
    }

    let stop = () => {
        this.device.stop();
    }

    let setSampleRate = (sampleRate) => {
        this.device.sampleRate = sampleRate;
    }

    let getSampleRate = () => {
        return this.device.sampleRate;
    }

    let setCenterFrequency = (centerFrequency) => {
        this.device.centerFrequency = centerFrequency;
    }

    let getCenterFrequency = () => {
        return this.device.centerFrequency;
    }

    let enableAGC = () => {
        this.device.tunerGain = 0;
        this.device.enableAGC();
    }

    let disableManualTunerGain = () => {
        this.device.disableManualTunerGain();
    }

    let getValidGains = () => {
        return this.device.validGains;
    }

    let setGainByIndex = (gain) => {
        this.gainIndex = gain;
        this.device.tunerGain = gain;
    }

    let getGainByIndex = () => {
        return this.gainIndex;
    }

    let getGain = () => {
        return this.device.tunerGain;
    }

    let setIFGain = (gain) => {
        this.device.setIntermediateFrequencyGain(gain);
    }

    return {
        openDevice: openDevice,
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
        getGainByIndex: getGainByIndex,
        getGain: getGain,
        setIFGain: setIFGain,
        get: get
    }
}

module.exports = RtlDevice;