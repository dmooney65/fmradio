const userSettings = require('./settings/settings.js')();
const $ = require('jquery');


module.exports = function () {
    

    /**
     * Converts a frequency to a human-readable format.
     * @param {number} frequency The frequency to convert.
     * @param {boolean} showUnits Whether to show the units (Hz, kHz, MHz, etc.)
     * @param {number=} opt_digits If specified, use a fixed number of digits.
     * @return {string} The converted frequency.
     */
    function humanReadable(frequency, showUnits, opt_digits) {
        var units;
        var suffix;
        if (frequency < 2e3) {
            units = 1;
            suffix = '';
        } else if (frequency < 2e6) {
            units = 1e3;
            suffix = 'k';
        } else if (frequency < 2e9) {
            units = 1e6;
            suffix = 'M';
        } else {
            units = 1e9;
            suffix = 'G';
        }
        if (opt_digits) {
            var number = (frequency / units).toFixed(opt_digits);
        } else {
            var number = String(frequency / units);
        }
        if (showUnits) {
            return number + ' ' + suffix + 'Hz';
        } else {
            return number;
        }
    }

    /**
     * Converts a frequency in a human-readable format to a number.
     * @param {string} frequency The frequency to convert.
     * @return {number} The converted frequency.
     */
    function parseReadableInput(frequency) {
        var mul = 1;
        frequency = frequency.toLowerCase().trim();
        if (frequency.substr(-2) == "hz") {
            frequency = frequency.substr(0, frequency.length - 2).trim();
        }
        var suffix = frequency.substr(-1);
        if (suffix == "k") {
            mul = 1e3;
        } else if (suffix == "m") {
            mul = 1e6;
        } else if (suffix == "g") {
            mul = 1e9;
        }
        if (mul != 1) {
            frequency = frequency.substr(0, frequency.length - 1).trim();
        }
        return Math.floor(mul * Number(frequency));
    }
    let setFrequency = (frequency) => {
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

/**
 * Default modes.
 */
var DefaultModes = {
    'AM': {
        modulation: 'AM',
        bandwidth: 10000
    },
    'LSB': {
        modulation: 'LSB',
        bandwidth: 2900
    },
    'USB': {
        modulation: 'USB',
        bandwidth: 2900
    },
    'NBFM': {
        modulation: 'NBFM',
        maxF: 10000
    },
    'WBFM': {
        modulation: 'WBFM'
    }
};

/**
 * Known frequency bands.
 */
var Bands = (function () {
    var WBFM = {
        modulation: 'WBFM'
    };

    function fmDisplay(freq, opt_full) {
        return Frequencies.humanReadable(freq, false, 2) + (opt_full ? ' FM' : '');
    }

    function fmInput(input) {
        return input * 1e6;
    }

    var WXFM = {
        modulation: 'NBFM',
        maxF: 10000
    };

    var WX_NAMES = [2, 4, 5, 3, 6, 7, 1];
    var WX_INDEX = [6, 0, 3, 1, 2, 4, 5];

    function wxDisplay(freq, opt_full) {
        return (opt_full ? 'WX ' : '') + WX_NAMES[Math.floor((freq - 162400000) / 25000)];
    }

    function wxInput(input) {
        return Math.floor(WX_INDEX[input - 1] * 25000) + 162400000;
    }

    var AM = {
        modulation: 'AM',
        bandwidth: 10000,
        upconvert: true
    };

    function amDisplay(freq, opt_full) {
        return Frequencies.humanReadable(freq, false, 0) + (opt_full ? ' AM' : '');
    }

    function amInput(input) {
        return input * 1e3;
    }

    return {
        'WW': {
            'FM': new Band('FM', 87500000, 108000000, 100000, WBFM, fmDisplay, fmInput),
            'AM': new Band('AM', 531000, 1611000, 9000, AM, amDisplay, amInput)
        },
        'NA': {
            'FM': new Band('FM', 87500000, 108000000, 100000, WBFM, fmDisplay, fmInput),
            'WX': new Band('WX', 162400000, 162550000, 25000, WXFM, wxDisplay, wxInput),
            'AM': new Band('AM', 540000, 1710000, 10000, AM, amDisplay, amInput)
        },
        'AM': {
            'FM': new Band('FM', 87500000, 108000000, 100000, WBFM, fmDisplay, fmInput),
            'AM': new Band('AM', 540000, 1710000, 10000, AM, amDisplay, amInput)
        },
        'JP': {
            'FM': new Band('FM', 76000000, 95000000, 100000, WBFM, fmDisplay, fmInput),
            'AM': new Band('AM', 531000, 1611000, 9000, AM, amDisplay, amInput)
        },
        'IT': {
            'FM': new Band('FM', 87500000, 108000000, 50000, WBFM, fmDisplay, fmInput),
            'AM': new Band('AM', 531000, 1611000, 9000, AM, amDisplay, amInput)
        }
    };
})();

/**
 * A particular frequency band.
 * @param {string} bandName The band's name
 * @param {number} minF The minimum frequency in the band.
 * @param {number} maxF The maximum frequency in the band.
 * @param {number} stepF The step between channels in the band.
 * @param {Object} mode The band's modulation parameters.
 * @param {(function(number, boolean=):string)=} opt_displayFn A function that
 *     takes a frequency and returns its presentation for display.
 * @param {(function(string):number)=} opt_inputFn A function that takes a
 *     display representation and returns the corresponding frequency.
 * @constructor
 */
function Band(bandName, minF, maxF, stepF, mode, opt_displayFn, opt_inputFn) {
    var name = bandName;
    var min = minF;
    var max = maxF;
    var step = stepF;
    var mode = mode;

    function freeDisplayFn(freq, opt_full) {
        return opt_full ? Frequencies.humanReadable(freq, true) : freq;
    }

    function freeInputFn(input) {
        return Frequencies.parseReadableInput(input);
    }

    return {
        getName: function () {
            return name;
        },
        getMin: function () {
            return min;
        },
        getMax: function () {
            return max;
        },
        getStep: function () {
            return step;
        },
        getMode: function () {
            return mode;
        },
        toDisplayName: opt_displayFn || freeDisplayFn,
        fromDisplayName: opt_inputFn || freeInputFn
    };
}