const $ = require('jquery');
const userSettings = require('./settings.js')();
const sampleRate = $('#sampleRate');
const offsetTuning = $('#offsetTuning');
const lastTuned = $('#lastTuned');
const stereo = $('#stereo');
const localPlayer = $('#localPlayer');
const serverPort = $('#serverPort');
const remote = require('electron').remote;

//const recordingsPath = $('#recordingsPath');

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

    $(':reset').click(function () {
        sampleRate.val(userSettings.get('sampleRate'));
        offsetTuning.prop('checked', userSettings.get('offsetTuning'));
        lastTuned.prop('checked', userSettings.get('lastTuned'));
        stereo.prop('checked', userSettings.get('stereo'));
        localPlayer.prop('checked', userSettings.get('localPlayer'));
        serverPort.val(userSettings.get('serverPort'));
        console.log('reset clicked');
    });
    $('#cpu').click(function(){
        sampleRate.val(1024000);
        offsetTuning.prop('checked',false);
        stereo.prop('checked',false);
        console.log('low cpu clicked');
    });
    $('#audio').click(function(){
        if(sampleRate.val() < 2560000){
            sampleRate.val(2560000);
        }
        offsetTuning.prop('checked',true);
        stereo.prop('checked',true);
        console.log('audio clicked');
    });
    $('form').submit(function(event){
        event.preventDefault();
        userSettings.set('sampleRate', sampleRate.val());
        userSettings.set('offsetTuning', offsetTuning.prop('checked'));
        userSettings.set('lastTuned', lastTuned.prop('checked'));
        userSettings.set('stereo', stereo.prop('checked'));
        userSettings.set('localPlayer', localPlayer.prop('checked'));
        userSettings.set('serverPort', serverPort.val());
        remote.app.relaunch();
        remote.app.quit();
        console.log('form submitted');
        window.close();
    });
    //<p>Sample rates over 2560000 may cause lost samples</p>

};