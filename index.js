const http = require("http");
const url = require("url");
const cheerio = require("cheerio"); // <-- using cheerio

const PORT = process.env.PORT || 7000;

// Manifest
const manifest = {
  id: "com.example.linkextractor.live",
  version: "1.1.1",
  name: "Link Extractor Addon",
  description: "Demo addon with hardcoded sources and <a> link parsing",
  resources: ["catalog", "stream"],
  types: ["tv"],
  idPrefixes: ["live"],
  catalogs: [
    {
      type: "tv",
      id: "live.channels",
      name: "Live Channels"
    }
  ]
};

// Catalog entries
const metas = [
  {
    id: "live:nasa",
    type: "tv",
    name: "NASA TV",
    poster: "https://www.nasa.gov/sites/default/files/thumbnails/image/nasa-logo-web-rgb.png",
    description: "NASA public livestream"
  },
  {
    id: "live:demo",
    type: "tv",
    name: "Demo HTML Parser",
    poster: "https://upload.wikimedia.org/wikipedia/commons/6/6a/HTML5_logo_and_wordmark.svg",
    description: "Extracts all <a> links from a sample HTML"
  }
];

// Hardcoded streams
const STREAMS = {
  "live:nasa": [
    {
      title: "NASA HLS",
      url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-Public/master.m3u8"
    }
  ]
};

// Example HTML snippet with <a> links (for demo purposes)
const demoHTML = `
<div class="video-list">
  <a href="https://example.com/stream1.m3u8">Stream 1</a>
  <a href="https://example.com/stream2.m3u8">Stream 2</a>
</div>
`;

// Function to extract <a> links from HTML
function extractLinksFromHTML(html) {
  const $ = cheerio.load(html);
  const links = $("a").map((i, el) => $(el).attr("href")).get();
  return links.map(l => ({ title: "Extracted Link", url: l }));
}

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

const server = http.createServer(async (req, res) => {
  const { pathname } = url.parse(req.url, true);

  if (pathname === "/manifest.json") return sendJSON(res, manifest);

  if (/^\/catalog\/tv\/live\.channels\.json$/.test(pathname)) {
    return sendJSON(res, { metas });
  }

  const streamMatch = pathname.match(/^\/stream\/tv\/([^/]+)\.json$/);
  if (streamMatch) {
    const id = decodeURIComponent(streamMatch[1]);

    // Normal hardcoded streams
    if (STREAMS[id]) {
      return sendJSON(res, { streams: STREAMS[id] });
    }

    // Demo extractor: turn <a> tags into streams
    if (id === "live:demo") {
      const extracted = extractLinksFromHTML(demoHTML);
      return sendJSON(res, { streams: extracted });
    }
  }

  notFound(res);
});

server.listen(PORT, () => {
  console.log(`Addon running on :${PORT}`);
  console.log(`Manifest: http://localhost:${PORT}/manifest.json`);
});