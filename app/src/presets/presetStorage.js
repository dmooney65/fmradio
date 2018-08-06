const Datastore = require('nedb');
const { app } = require('electron').remote;
let db = new Datastore({ filename: (app.getPath('userData')) + '/presets', autoload: true });

module.exports = () => {

    db.loadDatabase(function (err) {    // Callback is optional
        // Now commands will be executed
        if (err) {
            console.log('db error ', err);
        }
    });

    let addPreset = (name, freq) => {
        return new Promise(function (resolve) {
            db.insert({ name: name, freq: freq }, function (err, doc) {
                resolve(doc);
            });
        });
    };

    let deletePreset = (id) => {
        return new Promise(function (resolve) {
            db.remove({ _id: id }, {}, function (err, numRemoved) {
                resolve(numRemoved);
            });
        });
    };

    let findPreset = (id) => {
        return new Promise(function (resolve) {
            db.findOne({ _id: id }, function (err, doc) {
                resolve(doc);
            });
        });
    };

    let editPreset = (id, name, freq) => {
        return new Promise(function (resolve) {
            db.update({ _id: id }, { name: name, freq: freq }, {}, function (err, numReplaced) {
                resolve(numReplaced);
            });
        }).then(findPreset(id));
    };


    var getAll = () => {
        return new Promise(function (resolve) {
            db.find({}).sort({ name: 1 }).exec(function (err, docs) {
                resolve(docs);
            });
        });

    };


    return {
        addPreset: addPreset,
        deletePreset: deletePreset,
        editPreset: editPreset,
        getAll: getAll
    };
};