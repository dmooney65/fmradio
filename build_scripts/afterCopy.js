//const path = require('path');

module.exports = function (copyPath, electronVersion, platform, arch, done) {
  //const file_system = require('fs');
  console.log(" +++++Copy path is " + copyPath);
  console.log(" +++++Platform is " + platform);
  //const archiver = require('archiver');

  //const output = file_system.createWriteStream('my-files.zip');
  //const archive = archiver('zip');

  //output.on('close', function () {
  //console.log(archive.pointer() + ' total bytes');
  //console.log('archiver has been finalized and the output file descriptor has closed.');

  //});

  //archive.on('error', function (err) {
  //  throw err;
  //});

  //archive.pipe(output);
  //archive.directory('external_files/');
  //archive.finalize();
  done();
};