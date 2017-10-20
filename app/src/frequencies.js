const userSettings = require('./settings/settings.js')();
const $ = require('jquery');


module.exports = function () {


    function humanReadable(frequency, showUnits, opt_digits) {
        var units = 1e6;

        var number = (frequency / units).toFixed(opt_digits);
        if (showUnits) {
            return number + ' ' + 'MHz';
        } else {
            return number;
        }
    }

    function parseReadableInput(frequency) {
        frequency = frequency.split(' ')[0];
        
        return Math.floor(1e6 * Number(frequency));
    }

    let setFrequency = (frequency) => {
        if (frequency < 87500000) {
            frequency = 108000000;
        }
        if (frequency > 108000000) {
            frequency = 87000000;
        }
        let device = require('./fmRadio.js').getDevice();
        let offset = require('./fmRadio.js').getOffset();

        if (device) {
            device.setCenterFrequency(frequency + offset);
        }
        if (userSettings.get('lastTuned')) {
            userSettings.set('lastFrequency', frequency);
        }
        $('#freq').val(humanReadable(frequency, true, 2));
    };

    let getFrequency = () => {
        var freq = parseInt(parseReadableInput($('#freq').val()));
        return freq;
    };
    return {
        humanReadable: humanReadable,
        parseReadableInput: parseReadableInput,
        setFrequency: setFrequency,
        getFrequency: getFrequency
    };

};
