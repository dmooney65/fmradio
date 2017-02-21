var cp = require('child_process')
var duplexer = require('duplexer')
var stream = require('stream')
var hashToArray = require('hash-to-array')
var createTempFile = require('create-temp-file')()

module.exports = function soxStream(opts) {
	if (!opts || !opts.output || (!opts.output.t && !opts.output.type)) {
		throw new Error('Options must include output.type')
	}
	var soxOutput = new stream.PassThrough()
	var tmpFile = createTempFile()

    var args = []
			.concat(hashToArray(opts.global || []))
			.concat(hashToArray(opts.input || []))
			.concat(tmpFile.path)
			.concat(hashToArray(opts.output || []))
			.concat('-')
			.concat(opts.effects || [])
			.reduce(function (flattened, ele) {
				return flattened.concat(ele)
			}, [])

    

	tmpFile.on('error', emitErr)
	tmpFile.on('finish', function () {
		
		var sox = cp.spawn(opts.soxPath || 'sox', args)
		sox.stdout.pipe(soxOutput)
		sox.stdout.on('finish', tmpFile.cleanup)
		sox.stderr.on('data', function (chunk) {
			cleanupThenEmitErr(new Error(chunk))
		})
		sox.on('error', cleanupThenEmitErr)
	})

	function cleanupThenEmitErr(err) {
		tmpFile.cleanup(emitErr.bind(null, err))
	}

	function emitErr(err) {
		if (!(err instanceof Error)) err = new Error(err)
		duplex.emit('error', err)
	}

	var duplex = duplexer(tmpFile, soxOutput)
	return duplex
}