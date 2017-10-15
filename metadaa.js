var fs = require('fs');
var flac = require('flac-metadata');

var reader = fs.createReadStream('./out/fmradio-win32-x64/output.flac');
var processor = new flac.Processor({ parseMetaDataBlocks: true });
processor.on('postprocess', function(mdb) {
    console.log(mdb.toString());
});

reader.pipe(processor);