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

function sorter(sortBy) {
  return (r1, r2) => {
    var order = 0;
    for (var key of sortBy) {
      key = key.replace(/(^[^\+\-])/, '+$1');
      const sign = key.charAt(0);
      key = key.replace(/(^.)/, '');
      const modifier = Number(sign + '1');
      if (order != 0) {
        break;
      }
      if (![r1, r2].some(r => r[key] === undefined || r[key] === null)) {
        var order = modifier * r1[key].localeCompare(r2[key]);
      }
    }
    return order;
  };
}

async function main() {
  const config = await fs.readJSON(process.argv[2]);
  const sitemap = await fs.readJSON(`${__dirname}/${config.site_map}`);
  const scrapOptions = { delay: 10, pageLoadDelay: 10, browser: 'headless' }; // optional delay, pageLoadDelay and browser
  const startUrls = config.start_urls ?? [sitemap.startUrl];

  startUrls.forEach(async (startUrl, i) => {
    sitemap.startUrl = startUrl;
    const scraped = await webscraper(sitemap, scrapOptions);
    // Change this to sort your data in the order you would like
    const sortBy = Array.isArray(config.sort_by) ? config.sort_by : [config.sort_by];
    if (sortBy) {
      scraped.sort(sorter(sortBy));
    }
    // ensure that scraped data is an array
    let cleanedData = !Array.isArray(scraped) ? [scraped] : scraped;
    // trim string values
    cleanedData = cleanedData.map(s =>
      jr.fromKeyValArray(jr.toKeyValArray(s).map(kv => ({ key: kv.key, value: trim(kv.value, config.data_format) })))
    );

    var file_content = '<invalid_data_format>';
    if (config.data_format === 'json') {
      file_content = JSON.stringify(cleanedData, null, 2);
    }

    if (config.data_format === 'csv') {
      // quote: '' removes quotes from fields/headers
      // const parserOptions = { quote: '' }
      // OR for no customizations
      const parserOptions = config.parse_options ?? {};
      const csv = json2csv.parse(cleanedData, parserOptions);
      // print scraped data in csv format
      file_content = csv;
    }
    console.log(file_content);
    fs.writeFile(`${__dirname}/${config.output_file_name_seed}_${i}.${config.data_format}`, file_content);
  });
}

main();
