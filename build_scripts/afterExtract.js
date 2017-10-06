
module.exports = function (extractPath, electronVersion, platform, arch, done) {
    const fs = require('fs');
    console.log('+++++Extract path is ' + extractPath);
    
    if (platform == 'linux') {
        console.log('+++++Platform is ' + platform);        
        //console.log(archive.pointer() + ' total bytes');
        //console.log('archiver has been finalized and the output file descriptor has closed.');
        fs.createReadStream('./build_scripts/afterCopy.js').pipe(fs.createWriteStream(extractPath + '/afterCopy.js'));
    }

    if (platform == 'win32') {
        console.log('+++++Platform is ' + platform);        
        //console.log(archive.pointer() + ' total bytes');
        //console.log('archiver has been finalized and the output file descriptor has closed.');
        fs.createReadStream('./build_scripts/gyp-defines.ps1').pipe(fs.createWriteStream(extractPath + '/gyp-defines.ps1'));
    }

    done();
};