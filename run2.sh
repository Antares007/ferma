#!/usr/bin/bash
rm -rf out
mkdir out
echo ferma2.xlsx | ./mapreduce.js --outDir out --mrscript ./mr01.js
find out -type f -name "*.json" | ./mapreduce.js --outDir ../ferma-web --mrscript ./mr02.js
