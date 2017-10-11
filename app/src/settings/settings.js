let settings = require('electron-settings');

module.exports = () => {
    let generateDefaultSettings = () => {
        settings.set('sampleRate', 2560000);
        settings.set('stereo', true);
        settings.set('lastTuned', true);
        settings.set('localPlayer', true);
        settings.set('serverPort', 1337);
        settings.set('lastFrequency', '91000000');
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
        file: file
    };
};