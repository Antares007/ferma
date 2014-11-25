#!/usr/bin/bash
rm -rf out
mkdir out

mkdir out/baratebi
echo ferma2.xlsx | ./mapreduce.js --outDir out/baratebi --mrscript ./mr-baratebi.js > /dev/null

mkdir out/genetika
find out/baratebi -type f | ./mapreduce.js --outDir out/genetika --mrscript ./mr-genetika.js > /dev/null

find out/genetika -type f | ./mapreduce.js --outDir ../ferma-web --mrscript ./mr-ferma-web.js > /dev/null

mkdir out/mdgomareoba
find out/baratebi -type f | ./mapreduce.js --outDir out/mdgomareoba --mrscript ./mr-mdgomareoba.js > /dev/null

mkdir out/raodenobebi
find out/baratebi -type f | ./mapreduce.js --outDir out/raodenobebi --mrscript ./mr-raodenobebi.js > /dev/null

mkdir out/report
find out/ -type f | ./mapreduce.js --outDir out/report --mrscript ./mr-report.js > /dev/null

mkdir out/excel-report
find out/report -type f | ./mapreduce.js --outDir out/excel-report --mrscript ./mr-excel-report.js > /dev/null

./json2xlsx.js ./out/excel-report/array.json ./rep.xlsx
