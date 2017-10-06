const sdrjs = require('sdrjs');


module.exports.RtlDevice = (index) => {

    let device = sdrjs.getDevices()[index];

    let get = () => {
        return device;
    };

    let openDevice = () => {
        device.open();
    };

    let close = () => {
        device.close();
    };

    let start = () => {
        device.start();
    };

    let stop = () => {
        device.stop();
    };

    let setSampleRate = (sampleRate) => {
        device.sampleRate = sampleRate;
    };

    let getSampleRate = () => {
        return device.sampleRate;
    };

    let setCenterFrequency = (centerFrequency) => {
        device.centerFrequency = centerFrequency;
    };

    let getCenterFrequency = () => {
        return device.centerFrequency;
    };

    let enableAGC = () => {
        device.tunerGain = 0;
        device.enableAGC();
    };

    let disableManualTunerGain = () => {
        device.disableManualTunerGain();
    };

    let getValidGains = () => {
        return device.validGains;
    };

    let setGainByIndex = (gain) => {
        //let gainIndex = gain;
        device.tunerGain = gain;
    };

    let getGainByIndex = () => {
        return device.getGainByIndex;
    };

    let getGain = () => {
        return device.tunerGain;
    };

    let setIFGain = (gain) => {
        device.setIntermediateFrequencyGain(gain);
    };

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
    };
};

//module.exports = RtlDevice;