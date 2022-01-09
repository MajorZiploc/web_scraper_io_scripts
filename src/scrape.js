const webscraper = require('web-scraper-headless');
const fs = require('fs-extra');
const json2csv = require('json2csv');
const jtu = require('json-test-utility');
const jr = jtu.jsonRefactor;

function trim(thing, dataFormat) {
  var res = thing;
  if (typeof thing === 'string') {
    res = thing.trim().replace(/\s{2,}/g, ' ');
    if (dataFormat === 'csv') {
      res = res.replace(/,/g, ';');
    }
  }
  return res;
}

function sorter(sortBys) {
  return (r1, r2) => {
    var order = 0;
    for (var sortBy of sortBys) {
      if (sortBy.constructor.name === 'String') {
        sortBy = sortBy.replace(/(^[^\+\-])/, '+$1');
        const sign = sortBy.charAt(0);
        sortBy = sortBy.replace(/(^.)/, '');
        const modifier = Number(sign + '1');
        if (![r1, r2].some(r => r[sortBy] === undefined || r[sortBy] === null)) {
          order = modifier * r1[sortBy].localeCompare(r2[sortBy]);
        }
      } else {
        order = sortBy(r1, r2);
      }
      if (order !== 0) break;
    }
    return order;
  };
}

async function main() {
  const config = await fs.readJSON(process.argv[2]);
  const sitemap = await fs.readJSON(`${__dirname}/${config.siteMap}`);
  const scrapOptions = { delay: 10, pageLoadDelay: 10, browser: 'headless' }; // optional delay, pageLoadDelay and browser
  const startUrls = config.startUrls ?? [sitemap.startUrl];

  startUrls.forEach(async (startUrl, i) => {
    sitemap.startUrl = startUrl;
    const scraped = await webscraper(sitemap, scrapOptions);
    // Change this to sort your data in the order you would like
    if (config.sortBy) {
      const sortBy = Array.isArray(config.sortBy) ? config.sortBy : [config.sortBy];
      scraped.sort(sorter(sortBy));
    }
    // ensure that scraped data is an array
    let cleanedData = Array.isArray(scraped) ? scraped : [scraped];
    // trim string values
    cleanedData = cleanedData.map(s =>
      jr.fromKeyValArray(jr.toKeyValArray(s).map(kv => ({ key: kv.key, value: trim(kv.value, config.dataFormat) })))
    );

    var fileContent = '<invalid_data_format>';
    if (config.dataFormat === 'json') {
      fileContent = JSON.stringify(cleanedData, null, 2);
    }

    if (config.dataFormat === 'csv') {
      // quote: '' removes quotes from fields/headers
      // const parserOptions = { quote: '' }
      // OR for no customizations
      const parserOptions = config.parseOptions ?? {};
      const csv = json2csv.parse(cleanedData, parserOptions);
      // print scraped data in csv format
      fileContent = csv;
    }
    console.log(fileContent);
    fs.writeFile(`${__dirname}/${config.output_file_name_seed}_${i}.${config.dataFormat}`, fileContent);
  });
}

main();
