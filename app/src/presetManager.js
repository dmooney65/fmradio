const userSettings = require('./settings/settings.js')();
const $ = require('jquery');
const frequencies = require('./frequencies.js')();



module.exports = () => {

    $('#addPreset').click(function () {
        var name = $('#presetName').val();
        if (name != '') {
            addPreset(name , frequencies.getFrequency());
            $('#presetModal').modal('hide');
        }
    });

    $('#presetModal').on('shown.bs.modal', function () {
        $('#presetName').focus();
    });

    let addPreset = (stationName, frequency) => {
        let presets;
        if (!userSettings.get('presets')) {
            presets = [{
                name: stationName,
                freq: frequency
            }];
        } else {
            presets = userSettings.get('presets');
            presets.push({
                name: stationName,
                freq: frequency
            });
        }
        userSettings.set('presets', presets);
        rebuild();

    };


    let rebuild = () => {
        var presetList = $('#presetList');
        presetList.empty();

        var li = document.createElement('li');
        var link = document.createElement('a');
        link.setAttribute('id', 'preset-add');
        link.appendChild(document.createTextNode('Add'));
        link.href = '#';
        link.addEventListener('click', function (e) {
            e.preventDefault();
            $('#presetModal').modal('show');
        });


        li.appendChild(link);
        presetList.append(li);

        var presets;
        if (userSettings.get('presets')) {
            presets = userSettings.get('presets');
            presets.forEach(function (item) {
                var li = document.createElement('li');
                var link = document.createElement('a');
                link.setAttribute('id', 'preset-' + item.freq);
                link.appendChild(document.createTextNode(item.name));
                link.href = '#';
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    frequencies.setFrequency(parseInt(this.getAttribute('id').split('-')[1]));
                    //$('#presetModal').modal();
                    //addPreset();
                });
                li.appendChild(link);
                presetList.append(li);
            });
        }
    };

    return {
        rebuild: rebuild
    };

};