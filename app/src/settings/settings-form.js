const $ = require('jquery');
const userSettings = require('./settings.js')();
const sampleRate = $('#sampleRate');
const offsetTuning = $('#offsetTuning');
const lastTuned = $('#lastTuned');
const stereo = $('#stereo');
const localPlayer = $('#localPlayer');
const serverPort = $('#serverPort');
const ppmError = $('#ppmError');
const recordingsPath = $('#recordingsPath');
const {app} = require('electron').remote;
const {dialog} = require('electron').remote;

document.addEventListener('DOMContentLoaded', function () {

    initListeners(); // add listers

});

let initListeners = () => {
    sampleRate.val(userSettings.get('sampleRate'));
    offsetTuning.prop('checked', userSettings.get('offsetTuning'));
    lastTuned.prop('checked', userSettings.get('lastTuned'));
    stereo.prop('checked', userSettings.get('stereo'));
    localPlayer.prop('checked', userSettings.get('localPlayer'));
    serverPort.val(userSettings.get('serverPort'));
    ppmError.val(userSettings.get('ppm'));
    recordingsPath.val(userSettings.get('recordingsPath'));

    $(':reset').click(function () {
        window.close();        
    });
    $('#cpu').click(function(){
        sampleRate.val(240000);
        offsetTuning.prop('checked',false);
        stereo.prop('checked',false);
    });
    $('#audio').click(function(){
        if(sampleRate.val() < 2560000){
            sampleRate.val(2560000);
        }
        offsetTuning.prop('checked',true);
        stereo.prop('checked',true);
    });
    recordingsPath.click(function(event){
        event.preventDefault();
        var dirVal = dialog.showOpenDialog({options :{defaultPath: $(this).val()}, properties: ['openDirectory']});
        console.log(dirVal[0]);
        if(dirVal){
            $(this).val(dirVal[0]);
        }
        console.log(dialog);        
    });
    $('form').submit(function(event){
        event.preventDefault();
        userSettings.set('sampleRate', sampleRate.val());
        userSettings.set('offsetTuning', offsetTuning.prop('checked'));
        userSettings.set('lastTuned', lastTuned.prop('checked'));
        userSettings.set('stereo', stereo.prop('checked'));
        userSettings.set('localPlayer', localPlayer.prop('checked'));
        userSettings.set('serverPort', serverPort.val());
        userSettings.set('recordingsPath', recordingsPath.val());        
        userSettings.set('ppm', ppmError.val());
        app.relaunch();
        app.quit();
        console.log('form submitted');
        window.close();
    });
    //<p>Sample rates over 2560000 may cause lost samples</p>

};