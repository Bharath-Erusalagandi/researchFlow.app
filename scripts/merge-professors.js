#!/usr/bin/env node
/*
  Usage:
    node scripts/merge-professors.js "/Users/bharath/Downloads/Pasted Content.txt" "/Users/bharath/flow-research/data/professors.csv"
*/

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const [, , pastedPathArg, csvPathArg] = process.argv;
const pastedPath = pastedPathArg || path.resolve(process.cwd(), 'Pasted Content.txt');
const csvPath = csvPathArg || path.resolve(process.cwd(), 'data/professors.csv');

const HEADER_FIELDS = ['name', 'field_of_research', 'university_name', 'email', 'official_url'];

function readFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) return '';
  return fs.readFileSync(filePath, 'utf8');
}

function hasExpectedHeaders(recordKeys) {
  const keys = new Set(recordKeys.map((k) => k.toLowerCase().trim()));
  return HEADER_FIELDS.every((f) => keys.has(f));
}

function parseFlexible(text) {
  if (!text || !text.trim()) return [];
  // First try as headered CSV
  try {
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
    });
    if (records.length > 0 && hasExpectedHeaders(Object.keys(records[0] || {}))) {
      return records;
    }
  } catch (err) {
    // ignore; will try alternative strategies
  }
  // If not headered, try to locate a header substring — if not present, parse as rows
  const header = HEADER_FIELDS.join(',').toLowerCase();
  const idx = text.toLowerCase().indexOf(header);
  if (idx >= 0) {
    try {
      const trimmed = text.slice(idx);
      const records = parse(trimmed, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
        trim: true,
      });
      if (records.length > 0) return records;
    } catch {}
  }
  // Finally, parse as headerless rows and map to our header fields
  const rows = parse(text, {
    columns: false,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    trim: true,
  });
  return rows
    .map((arr) => {
      const r = Array.isArray(arr) ? arr : [];
      return {
        name: r[0] || '',
        field_of_research: r[1] || '',
        university_name: r[2] || '',
        email: r[3] || '',
        official_url: r[4] || '',
      };
    })
    .filter((r) => r.name || r.university_name);
}

function normalizeRecord(rec) {
  return {
    name: (rec.name || '').toString().trim(),
    field_of_research: (rec.field_of_research || '').toString().trim(),
    university_name: (rec.university_name || '').toString().trim(),
    email: (rec.email || '').toString().trim(),
    official_url: (rec.official_url || '').toString().trim(),
  };
}

function makeKey(rec) {
  return `${rec.name.toLowerCase()}|${rec.university_name.toLowerCase()}`;
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  const needsQuote = /[",\n\r]/.test(s) || s.startsWith(' ') || s.endsWith(' ');
  const doubled = s.replace(/"/g, '""');
  return needsQuote ? `"${doubled}"` : doubled;
}

function writeCsv(filePath, rows) {
  const header = HEADER_FIELDS.join(',');
  const body = rows
    .map((r) => HEADER_FIELDS.map((f) => csvEscape(r[f])).join(','))
    .join('\n');
  const out = `${header}\n${body}\n`;
  fs.writeFileSync(filePath, out, 'utf8');
}

// Read files
const currentCsvText = readFileIfExists(csvPath);
const pastedText = readFileIfExists(pastedPath);

// Parse
const currentRowsRaw = parseFlexible(currentCsvText);
const pastedRowsRaw = parseFlexible(pastedText);

const currentRows = currentRowsRaw.map(normalizeRecord).filter((r) => r.name && r.university_name);
const pastedRows = pastedRowsRaw.map(normalizeRecord).filter((r) => r.name && r.university_name);

// Build map from current
const map = new Map();
for (const r of currentRows) {
  map.set(makeKey(r), r);
}

// Add from pasted if not exists
let added = 0;
for (const r of pastedRows) {
  const key = makeKey(r);
  if (!map.has(key)) {
    map.set(key, r);
    added += 1;
  }
}

// Sort for stability: by university, then name
const merged = Array.from(map.values()).sort((a, b) => {
  const ua = a.university_name.toLowerCase();
  const ub = b.university_name.toLowerCase();
  if (ua < ub) return -1;
  if (ua > ub) return 1;
  const na = a.name.toLowerCase();
  const nb = b.name.toLowerCase();
  if (na < nb) return -1;
  if (na > nb) return 1;
  return 0;
});

// Write back
writeCsv(csvPath, merged);

console.log(`FINAL_COUNT:${merged.length} ADDED:${added} (pastedRows:${pastedRows.length})`);
