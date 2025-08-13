// step2_extractor.js
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Load the saved HTML file
const htmlPath = path.resolve('./step2.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Use Cheerio for parsing
const $ = cheerio.load(html);

function extractField(el) {
  const tag = el.tagName.toLowerCase();
  const type = $(el).attr('type') || (tag === 'select' ? 'select' : 'text');
  const name = $(el).attr('name') || '';
  const id = $(el).attr('id') || '';
  const label = $(`label[for="${id}"]`).text().trim() || '';
  const placeholder = $(el).attr('placeholder') || '';
  const required = $(el).attr('required') !== undefined;
  const maxLength = $(el).attr('maxlength') || null;

  let options = null;
  if (tag === 'select') {
    options = [];
    $(el)
      .find('option')
      .each((_, opt) => {
        options.push({
          value: $(opt).attr('value'),
          text: $(opt).text().trim(),
          selected: $(opt).is(':selected'),
        });
      });
  }

  return {
    tag,
    type,
    name,
    id,
    label,
    placeholder,
    required,
    maxLength,
    options,
    disabled: $(el).attr('disabled') !== undefined,
  };
}

const fields = [];

$('input, select, textarea').each((_, el) => {
  fields.push(extractField(el));
});

// Save JSON output
fs.writeFileSync('step2_fields.json', JSON.stringify(fields, null, 2), 'utf8');
console.log('Extracted fields saved to step2_fields.json');
