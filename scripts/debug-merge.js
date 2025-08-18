#!/usr/bin/env node
const fs = require('fs');
const { parse } = require('csv-parse/sync');

const pastedPath = process.argv[2] || '/Users/bharath/Downloads/Pasted Content.txt';
const csvPath = process.argv[3] || '/Users/bharath/flow-research/data/professors.csv';

const HEADER_FIELDS = ['name','field_of_research','university_name','email','official_url'];

function read(p){return fs.readFileSync(p,'utf8');}
function hasHeaders(keys){const s=new Set(keys.map(k=>k.toLowerCase().trim())); return HEADER_FIELDS.every(f=>s.has(f));}
function parseFlexible(text){
  if(!text||!text.trim()) return [];
  try{
    const r=parse(text,{columns:true,skip_empty_lines:true,trim:true,relax_quotes:true,relax_column_count:true});
    if(r.length && hasHeaders(Object.keys(r[0]||{}))) return r;
  }catch{}
  const header = HEADER_FIELDS.join(',').toLowerCase();
  const idx = text.toLowerCase().indexOf(header);
  if(idx>=0){
    try{
      const trimmed=text.slice(idx);
      const r=parse(trimmed,{columns:true,skip_empty_lines:true,trim:true,relax_quotes:true,relax_column_count:true});
      if(r.length) return r;
    }catch{}
  }
  const rows = parse(text,{columns:false,skip_empty_lines:true,trim:true,relax_quotes:true,relax_column_count:true});
  return rows.map(r=>({
    name: r[0]||'', field_of_research: r[1]||'', university_name: r[2]||'', email: r[3]||'', official_url: r[4]||''
  }));
}
function norm(s){return (s||'').toString().trim();}
function key(r){return norm(r.name).toLowerCase()+'|'+norm(r.university_name).toLowerCase();}

const current = parseFlexible(read(csvPath)).map(r=>({
  name:norm(r.name), field_of_research:norm(r.field_of_research), university_name:norm(r.university_name), email:norm(r.email), official_url:norm(r.official_url)
})).filter(r=>r.name && r.university_name);
const paste = parseFlexible(read(pastedPath)).map(r=>({
  name:norm(r.name), field_of_research:norm(r.field_of_research), university_name:norm(r.university_name), email:norm(r.email), official_url:norm(r.official_url)
})).filter(r=>r.name && r.university_name);

const currentKeys=new Set(current.map(key));
const pasteKeys=new Set(paste.map(key));

let uniqueNewCount=0; const sampleNew=[];
for(const k of pasteKeys){
  if(!currentKeys.has(k)){
    uniqueNewCount++;
  }
}
for(const r of paste){
  if(!currentKeys.has(key(r))){
    sampleNew.push(r);
    if(sampleNew.length>=10) break;
  }
}

console.log(JSON.stringify({
  currentCount: current.length,
  pastedRawCount: paste.length,
  pastedUniqueKeys: pasteKeys.size,
  overlapKeys: [...pasteKeys].filter(k=>currentKeys.has(k)).length,
  uniqueNewKeys: uniqueNewCount,
  sampleNewFirst10: sampleNew
}, null, 2));
