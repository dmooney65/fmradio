const presets = require('../src/presets/presetStorage')();

describe('presetStorage', () => {

    beforeEach(function () {
        //Math.random().toString(36).substr(2, 5)
    });

    it('should store preset', (done) => {
        presets.addPreset('new', 93200000)
            .then((result) => {
                expect(result.name).toEqual('new');
                expect(result.freq).toEqual(93200000);
                done();
            });
    });

    it('should delete preset', (done) => {
        presets.addPreset('deleteme', 94900000)
            .then((result) => {
                expect(result.name).toEqual('deleteme');
                expect(result.freq).toEqual(94900000);
                presets.deletePreset(result._id)
                    .then((result) => {
                        expect(result).toEqual(1);
                        done();
                    });
            });

    });

    it('should edit preset', (done) => {
        var freq;
        var id;
        presets.addPreset('editme', 100600000)
            .then((result) => {
                expect(result.name).toEqual('editme');
                expect(result.freq).toEqual(100600000);
                id = result._id;
                freq = result.freq;
                presets.editPreset(id, 'editedme', freq)
                    .then((edited) => {
                        expect(edited).toEqual(1);
                        presets.findPreset(id)
                            .then((found) => {
                                expect(found._id).toEqual(id);
                                expect(found.freq).toEqual(freq);
                                expect(found.name).toEqual('editedme');
                                done();
                            });
                    });
            });

    });

});