const userSettings = require('./settings/settings.js')();
const $ = require('jquery');
const frequencies = require('./frequencies.js')();



module.exports = () => {

    let addPreset = (stationName, frequency) => {
        console.log('preset ' + stationName + ' freq ' + frequency);
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
            $('#presetModal').modal();
        });

        $('#addPreset').click(function () {
            addPreset($('#presetName').val(), frequencies.getFrequency());
        });
        li.appendChild(link);
        presetList.append(li);

        var presets;
        if (userSettings.get('presets')) {
            presets = userSettings.get('presets');
            presets.forEach(function (item, index) {
                console.log(item.freq, item.name, index);
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


    /*$('#presetModal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget) // Button that triggered the modal
        //var newPreset = button.data('whatever') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        //modal.find('.modal-title').text('New message to ' + recipient)
        //modal.find('.modal-body input').val(recipient)
        addPreset(modal.find('.modal-body input').val(), getFrequency());
    })*/

    return {
        rebuild: rebuild
    };

};