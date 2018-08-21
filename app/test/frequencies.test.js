const freq = require('../src/frequencies')();
//var func = freq();

describe('humanReadable', function () {
    it('Should return correct text for showUnits true,', function () {
        expect(freq.humanReadable(91000000, true, 2)).toEqual('91.00 MHz');
    });

    it('Should return correct text for showUnits false ', function () {
        expect(freq.humanReadable(93200000, false, 2)).toEqual('93.20');
    });

    it('Should return correct text for showUnits false, opt_digits 3 ', function () {
        expect(freq.humanReadable(93200000, false, 3)).toEqual('93.200');
    });

    it('Should return correct text for showUnits false, opt_digits 0 ', function () {
        expect(freq.humanReadable(93200000, true, 3)).toEqual('93.200 MHz');
    });
});

describe('parseReadableInput', function () {
    it('Should return correct number for 2 digits', function () {
        expect(freq.parseReadableInput('91')).toEqual(91000000);
    });

    it('Should return correct number for 3 decimal points and units', function () {
        expect(freq.parseReadableInput('93.200 MHz')).toEqual(93200000);
    });

    it('Should return correct number for 4 digits and text', function () {
        expect(freq.parseReadableInput('94.90 MHz')).toEqual(94900000);
    });

    it('Should return correct number for 5 digits and text', function () {
        expect(freq.parseReadableInput('100.60 MHz')).toEqual(100600000);
    });
});

