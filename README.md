# Stremio Scraper Addon (Educational)

This addon demonstrates how to scrape lawful sources (e.g., NASA TV) and expose them as a Stremio addon.

## Features
- Scrapes catalog entries (channels) from nasa.gov
- Extracts `.m3u8` links for live streaming
- Caches results for performance and efficiency

## Local Run
```bash
npm install
npm start
```
Manifest URL: `http://localhost:7000/manifest.json`

## Deploy to Render
1. Push this repo to GitHub.
2. In Render, create a **Web Service**:
   - Build Command: `npm install`
   - Start Command: `node index.js`
3. After deploy, copy the public URL and append `/manifest.json`
4. In Stremio, go to Add-ons → Community → Install via URL and paste the manifest URL.
