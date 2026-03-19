#!/usr/bin/env node

// CommonJS script for converting Markdown to DOCX with markdown-docx library
const fs = require('fs').promises;
const path = require('path');

// import markdown-docx; the package exports a default function plus Packer
const markdownDocxPkg = require('markdown-docx');
const markdownDocx = markdownDocxPkg.default || markdownDocxPkg;
const { Packer } = markdownDocxPkg;

// CLI usage: node convertMarkdown.cjs input.md [output.docx]
const [,, input, output] = process.argv;
if (!input) {
  console.error('Usage: node convertMarkdown.cjs <input.md> [output.docx]');
  process.exit(1);
}

let outPath = output;
if (!outPath) {
  outPath = input.replace(/\.mdx?$/i, '.docx');
}
if (!path.extname(outPath)) {
  outPath += '.docx';
}

async function run() {
  try {
    const markdown = await fs.readFile(input, 'utf-8');
    const doc = await markdownDocx(markdown);
    const buffer = await Packer.toBuffer(doc);
    await fs.writeFile(outPath, buffer);
    console.log('Converted', input, 'to', outPath);
  } catch (err) {
    console.error('Error during conversion:', err);
    process.exit(1);
  }
}

run();
