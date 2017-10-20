let settings = require('electron-settings');
const { app } = require('electron').remote;


module.exports = () => {
    //console.log(presets.length);*/
    let generateDefaultSettings = () => {
        settings.set('sampleRate', 1140000);
        settings.set('stereo', true);
        settings.set('lastTuned', true);
        settings.set('localPlayer', true);
        settings.set('serverPort', 1337);
        settings.set('lastFrequency', '93200000');
        settings.set('ppm',0);
        settings.set('recordingsPath', app.getPath('music'));
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