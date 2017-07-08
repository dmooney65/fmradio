const sdrjs = require('sdrjs');


function RtlDevice(index) {

    this.device = sdrjs.getDevices()[index];

    get = () => {
        return this.device;
    }

    openDevice = () => {
        this.device.open();
    }

    close = () => {
        this.device.close();
    }

    start = () => {
        this.device.start();
    }

    stop = () => {
        this.device.stop();
    }

    setSampleRate = (sampleRate) => {
        this.device.sampleRate = sampleRate;
    }

    getSampleRate = () => {
        return this.device.sampleRate;
    }

    setCenterFrequency = (centerFrequency) => {
        this.device.centerFrequency = centerFrequency;
    }

    getCenterFrequency = () => {
        return this.device.centerFrequency;
    }

    enableAGC = () => {
        this.device.tunerGain = 0;
        this.device.enableAGC();
    }

    disableManualTunerGain = () => {
        this.device.disableManualTunerGain();
    }

    getValidGains = () => {
        return this.device.validGains;
    }

    setGainByIndex = (gain) => {
        this.gainIndex = gain;
        this.device.tunerGain = gain;
    }

    getGainByIndex = () => {
        return this.gainIndex;
    }

    getGain = () => {
        return this.device.tunerGain;
    }

    setIFGain = (gain) => {
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