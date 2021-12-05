const webscraper = require('web-scraper-headless');
const fs = require('fs-extra');
const json2csv = require('json2csv');
const jtu = require('json-test-utility');
const jr = jtu.jsonRefactor;

function trim(thing, data_format) {
  var res = thing;
  if (typeof thing === 'string') {
    res = thing.trim().replace(/\s{2,}/g, ' ');
    if (data_format === 'csv') {
      res = res.replace(/,/g, ';');
    }
  }
  return res;
}

async function main() {
  const data_format = process.argv[2];
  const sitemap = fs.readJSONSync(__dirname + '/sitemap.json');

  const scrapOptions = { delay: 10, pageLoadDelay: 10, browser: 'headless' }; // optional delay, pageLoadDelay and browser
  const scraped = await webscraper(sitemap, scrapOptions);
  // ensure that scraped data is an array
  let cleanedData = !Array.isArray(scraped) ? [scraped] : scraped;
  // trim string values
  cleanedData = cleanedData.map(s =>
    jr.fromKeyValArray(jr.toKeyValArray(s).map(kv => ({ key: kv.key, value: trim(kv.value, data_format) })))
  );

  if (data_format === 'json') {
    // print scraped data in json format
    console.log(JSON.stringify(cleanedData, null, 2));
  }

  if (data_format === 'csv') {
    // quote: '' removes quotes from fields/headers
    // const parserOptions = { quote: '' }
    // OR for no customizations
    const parserOptions = {};
    const csv = json2csv.parse(cleanedData, parserOptions);
    // print scraped data in csv format
    console.log(csv);
  }
}

main();
