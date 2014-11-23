#!/usr/bin/bash
rm -rf out0
mkdir out0
echo ferma2.xlsx | ./mapreduce.js --outDir out0 --mrscript ./mr00.js
