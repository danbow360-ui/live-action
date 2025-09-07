# Stremio Link Extractor Addon (Educational)

This addon demonstrates how to expose lawful live streams in Stremio, and how to extract `<a>` links from HTML using Cheerio.

## Features
- Hardcoded NASA TV stream
- Demo channel (`live:demo`) that parses an HTML snippet and turns `<a>` links into stream entries

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
