# FM Radio Tuner

![Image of fmradio](screens/fmradio.png)

A simple cross-platform Electron app for listening to FM radio using an RTL2832U based USB dongle.

## Features:
- Tested on Windows 10 Windows 7, Ubuntu 16.04 and Fedora 24. Should work on MAC.
- Supports all tuners supported by [rtl-sdr](http://sdr.osmocom.org/trac/wiki/rtl-sdr)
- Stereo decoding.
- Good sound quality at higher sample rates (you be the judge).
- Plays audio locally and on local HTTP server for remote listening.
- Scan for stations.
- Add station presets.
- Record audio in lossless FLAC format.
- Fully configurable.
- Prebuilt for x64 Windows and Linux.

## Hardware Requirements
### Intel CPUs
- Dual core CPU (tested and runs on a 2008 Pentium dual core T4200 laptop).
- 1.5GB RAM.
- Max sample rate for Intel is usually 2.56Msps.
### ARM CPU
- Runs well on ASUS Tinkerboard. Tested using Armbian and TinkerOS. Max stable sample rate is 2.56Msps but will run at higher rates, if unreliably.
- Does not run on Raspberry Pi but should run on any SBC with enough RAM and CPU grunt.

## Building

### Linux
Requires librtlsdr-dev, libusb and libFLAC++-dev.
Install dependencies, clone the repo and run 'npm install', then 'npm start' from the cloned directory.

### Windows
Complicated and a little painful. Will document at some point.



