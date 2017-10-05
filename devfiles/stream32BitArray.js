'use strict';
var Readable = require('stream').Writable;
var inherits = require('util').inherits;

function Stream32BitArray(array, options) {
	if (!(this instanceof Stream32BitArray)) {
		return new Stream32BitArray(array, options);
	}

	Writable.call(this, options);

	this.__array = array;
	this.__index = 0;
}
inherits(Stream32BitArray, Readable);

Stream32BitArray.obj = function (array, options) {
	options = options || {};
	options.objectMode = true;

	return new Stream32BitArray(array, options);
};

Stream32BitArray.prototype._read = function () {
	var needMoreData;
	var value;

	if (this.__array.length === 0) {
		// end of data
		this.push(null);

		return;
	}

	/*while (this.__index < this.__array.length && needMoreData !== false) {
		value = this.__array[this.__index++];
        needMoreData = this.push(value);

		if (value === null) {
			// value signaled end of data
			this.__index = this.__array.length;
		} else if (this.__index === this.__array.length) {
			// end of data
			this.push(null);
		}
	}*/
    this.push(Buffer.from(this.__array))
};

module.exports = Stream32BitArray;