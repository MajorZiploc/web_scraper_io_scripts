# web_scraper_io_scripts

## Purpose
For use in exploratory data science or for getting data for quick powershell or bash scripts.
A set of jsons for scraping the web using webscraper.io plugin for google chrome, firefox, and opera or the provided scrape script in this repo
Import them as sitemaps in the webscraper.io plugin for easier editing of the sitemap and running them from the browser.
Use the script for headless execution.

## Development Tools
- docker v20.10.7
- nvim
- just command runner v0.10.0

## Headless Scraping Workflow
- Select the sitemap you would like for scraping (or create your own using the webscraper.io plugin on a browser and then export the sitemap)

- Edit either the ./src/config_csv.json or ./src/config_json.json file options. You need to at least specify the relative path to the sitemap file. (Storing the sitemap in this repo makes things easy)

- call the just scrape command (./src/config_json.json is the default config used so you dont need to specify json if you want to use the ./src/config_json.json config):
> just scrape ./src/config_json.json
or
> just scrape ./src/config_csv.json

## List commands
> just -l

## Notes
- webscraping is meant to get raw data. dont worry about cleaning the data in the scraping step of your process. Consider using a tool like python pandas for data cleaning. Examples of this can be found here: [pandas_data_analytics](https://github.com/MajorZiploc/pandas_data_analytics)
