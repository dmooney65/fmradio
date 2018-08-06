const presetStorage = require('./presetStorage.js')();
const $ = require('jquery');
const frequencies = require('../frequencies.js')();



module.exports = () => {

    $('#save').click(function () {
        var name = $('#presetName').val();

        if ($('#presetName').attr('data-id') != 'null') {
            //console.log('update called');
            var id = $('#presetName').attr('data-id');
            var freq = $('#presetName').attr('data-freq');
            if (name != '') {
                editPreset(id, name, freq);
                $('#presetModal').modal('hide');
            }
        } else if (name != '') {
            //console.log('add called');
            addPreset(name, frequencies.getFrequency());
            $('#presetModal').modal('hide');
        }
    });

    $('#presetModal').on('shown.bs.modal', function () {
        $('#presetName').focus();
    });

    let addPreset = (stationName, frequency) => {
        presetStorage.addPreset(stationName, frequency).then(function () {
            rebuild();
        });
    };

    let deletePreset = (id) => {
        presetStorage.deletePreset(id).then(function () {
            rebuild();
        });
    };

    let editPreset = (id, name, freq) => {
        presetStorage.editPreset(id, name, freq).then(function () {
            rebuild();
        });
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
            $('#presetName').val('');
            $('#presetModal').modal('show');
        });


        li.appendChild(link);
        presetList.append(li);

        presetStorage.getAll().then(function (presets) {
            presets.forEach(function (item) {
                var li = document.createElement('li');
                var link = document.createElement('a');
                link.setAttribute('data-freq', item.freq);
                link.appendChild(document.createTextNode(item.name));
                link.href = '#';
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    frequencies.setFrequency(parseInt(this.getAttribute('data-freq')));
                });
                var deleteLink = document.createElement('a');
                var editLink = document.createElement('a');

                var deleteSpan = document.createElement('span');
                var div = document.createElement('div');
                div.setAttribute('class', 'pull-right');
                editLink.setAttribute('class', 'glyphicon glyphicon-edit');
                editLink.appendChild(deleteSpan);
                editLink.addEventListener('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $('#presetName').attr('data-id', item._id);
                    $('#presetName').attr('data-freq', item.freq);
                    $('#presetName').val(item.name);
                    $('#presetModal').modal('show');
                });
                div.appendChild(editLink);


                deleteLink.setAttribute('data-id', item._id);
                deleteSpan.setAttribute('class', 'glyphicon glyphicon-trash');
                deleteLink.appendChild(deleteSpan);
                deleteLink.addEventListener('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    deletePreset(this.getAttribute('data-id'));
                });
                div.appendChild(deleteLink);
                link.appendChild(div);
                li.appendChild(link);
                presetList.append(li);
            });
        });
    };

    return {
        rebuild: rebuild
    };

};