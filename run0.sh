#!/usr/bin/bash
rm -rf out
mkdir out

mkdir out/baratebi
echo ferma2.xlsx | ./mapreduce.js --outDir out/baratebi --mrscript ./mr00.js > /dev/null

mkdir out/genetika
find out/baratebi -type f | ./mapreduce.js --outDir out/genetika --mrscript ./mr01.js > /dev/null

find out/genetika -type f | ./mapreduce.js --outDir ../ferma-web --mrscript ./mr02.js > /dev/null

mkdir out/mdgomareoba
find out/baratebi -type f | ./mapreduce.js --outDir out/mdgomareoba --mrscript ./mrfuri.js > /dev/null

mkdir out/raodenobebi
find out/baratebi -type f | ./mapreduce.js --outDir out/raodenobebi --mrscript ./mrraodenobebi.js > /dev/null

mkdir out/report
find out/ -type f | ./mapreduce.js --outDir out/report --mrscript ./mrmerge.js > /dev/null

mkdir out/excel-report
find out/report -type f | ./mapreduce.js --outDir out/excel-report --mrscript ./mrexcel.js > /dev/null

./json2xlsx.js ./out/excel-report/array.json ./rep.xlsx
