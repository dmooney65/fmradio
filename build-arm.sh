#!/bin/bash
set -x #echo on

export HOST=arm-linux-gnueabihf
export CPP="${HOST}-gcc -E"
export STRIP="${HOST}-strip"
export OBJCOPY="${HOST}-objcopy"
export AR="${HOST}-ar"
export RANLIB="${HOST}-ranlib"
export LD="${HOST}-ld"
export OBJDUMP="${HOST}-objdump"
export CC="${HOST}-gcc"
export CXX="${HOST}-g++"
export NM="${HOST}-nm"
export AS="${HOST}-as"
export LD="$CXX"
export LINK="$CXX"

export GYP_DEFINES="arm_lib_dir='~/source/armlibs/'"

rm -Rf node_modules/

npm install --arch=arm && npm run distarm

