
module.exports = function (extractPath, electronVersion, platform, arch, done) {
    const fs = require('fs');

    if (platform == 'win32') {
        console.log('+++++Platform is ' + platform);        
        //console.log(archive.pointer() + ' total bytes');
        //console.log('archiver has been finalized and the output file descriptor has closed.');
        fs.createReadStream('./dll_bundle/'+arch+'/rtlsdr.dll').pipe(fs.createWriteStream(extractPath + '/rtlsdr.dll'));
        fs.createReadStream('./dll_bundle/'+arch+'/libFLAC_dynamic.dll').pipe(fs.createWriteStream(extractPath + '/libFLAC_dynamic.dll'));
        fs.createReadStream('./dll_bundle/'+arch+'/libFLAC++_dynamic.dll').pipe(fs.createWriteStream(extractPath + '/libFLAC++_dynamic.dll'));
        fs.createReadStream('./dll_bundle/'+arch+'/libusb-1.0.dll').pipe(fs.createWriteStream(extractPath + '/libusb-1.0.dll'));        
    }

    done();
};