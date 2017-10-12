let settings = require('electron-settings');

module.exports = () => {
    //console.log(presets.length);*/
    let generateDefaultSettings = () => {
        settings.set('sampleRate', 2560000);
        settings.set('stereo', true);
        settings.set('lastTuned', true);
        settings.set('localPlayer', true);
        settings.set('serverPort', 1337);
        settings.set('lastFrequency', '91000000');
        //var R4.set('name','BBC R4').set('freq',91000000)
        //console.log(settings.get('presets').length);
        settings = settings.set('offsetTuning', true);
    };

    let get = (key) => {
        return settings.get(key);
    };

    let set = (key, value) => {
        return settings.set(key, value);
    };

    let file = () => {
        return settings.file();
    };

    return {
        generateDefault: generateDefaultSettings,
        get: get,
        set: set,
        file: file,
    };
};