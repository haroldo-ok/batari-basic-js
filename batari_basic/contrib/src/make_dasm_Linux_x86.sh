#!/bin/sh
# /data/fun/Atari/7800basic.0.1/contrib/lib/linux
# rebuild dasm for linux x86 32-bit

export LDFLAGS=' -m32 -L/usr/lib32'
export CFLAGS=' -m32'

rm -fr dasm-2.20.11-update-20140202a
tar -xvzf dasm-2.20.11-update-20140202a.tgz
cd dasm-2.20.11-update-20140202a/src
make
cp dasm ../../../../dasm.Linux.x86
cd ../..
rm -fr dasm-2.20.11-update-20140202a
