const http = require("http");
const url = require("url");
const axios = require("axios");
const cheerio = require("cheerio");
const NodeCache = require("node-cache");

const PORT = process.env.PORT || 7000;
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Manifest
const manifest = {
  id: "com.example.scraper.live",
  version: "1.0.0",
  name: "Scraper Live Demo",
  description: "Educational Stremio addon scraping public live streams",
  resources: ["catalog", "stream"],
  types: ["tv"],
  idPrefixes: ["scraper"],
  catalogs: [
    {
      type: "tv",
      id: "scraper.channels",
      name: "Scraped Live Channels"
    }
  ]
};

// Scrape a demo page listing channels
async function scrapeCatalog() {
  if (cache.has("catalog")) return cache.get("catalog");
  const metas = [];

  try {
    // Example: scrape NASA TV listing page
    const { data } = await axios.get("https://www.nasa.gov/multimedia/nasatv/");
    const $ = cheerio.load(data);

    $("a").each((i, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href");
      if (text.includes("NASA TV")) {
        metas.push({
          id: "scraper:" + href,
          type: "tv",
          name: text,
          description: "Scraped from nasa.gov"
        });
      }
    });
    cache.set("catalog", metas);
  } catch (err) {
    console.error("Catalog scrape failed:", err.message);
  }

  return metas;
}

// Scrape stream links for a given channel
async function scrapeStreams(id) {
  const cacheKey = "stream:" + id;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const streams = [];

  try {
    const pageUrl = id.replace("scraper:", "");
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);

    // Example: look for an HLS .m3u8 link
    const m3u8 = $('a[href$=".m3u8"]').attr("href");
    if (m3u8) {
      streams.push({
        title: "Live Stream",
        url: m3u8
      });
    }
  } catch (err) {
    console.error("Stream scrape failed:", err.message);
  }

  cache.set(cacheKey, streams);
  return streams;
}

// Helpers
function sendJSON(res, obj) {
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(obj));
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ err: "not found" }));
}

// Server
const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true);

  if (pathname === "/manifest.json") return sendJSON(res, manifest);

  if (/^\/catalog\/tv\/scraper\.channels\.json$/.test(pathname)) {
    const metas = await scrapeCatalog();
    return sendJSON(res, { metas });
  }

  const streamMatch = pathname.match(/^\/stream\/tv\/([^/]+)\.json$/);
  if (streamMatch) {
    const id = decodeURIComponent(streamMatch[1]);
    const streams = await scrapeStreams(id);
    return sendJSON(res, { streams });
  }

  notFound(res);
});

server.listen(PORT, () => {
  console.log(`Scraper addon running on :${PORT}`);
  console.log(`Manifest: http://localhost:${PORT}/manifest.json`);
});