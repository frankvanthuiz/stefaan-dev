/**
 * MetricForge Studio — Image Generator
 * Uses kie.ai GPT-4o Image API to generate all site images
 * Run: node generate-images.js
 * Resumable: skips already-downloaded images
 */

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const API_KEY = process.env.KIE_API_KEY;
if (!API_KEY) {
  console.error('❌  KIE_API_KEY not found in .env');
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, 'images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR);

const GENERATE_URL = 'https://api.kie.ai/api/v1/gpt4o-image/generate';
const POLL_URL_BASE = 'https://api.kie.ai/api/v1/gpt4o-image/record-info';
const POLL_INTERVAL = 5000;
const MAX_ATTEMPTS = 60;

const IMAGES = [
  {
    name: 'hero.jpg',
    prompt: 'Abstract data visualization dashboard for a digital agency. Dark navy blue background with glowing cyan and electric blue gradient charts, floating analytics cards showing growth metrics, interconnected data nodes with light trails, futuristic web performance monitoring interface. Cinematic depth of field, editorial tech photography style. No text, no logos, no UI labels.',
    size: '3:2',
  },
  {
    name: 'why-data.jpg',
    prompt: 'Clean modern analytics dashboard on a premium laptop screen showing web performance metrics, conversion funnels, and growth charts. Placed on a minimal white desk with soft side lighting. Shallow depth of field, professional tech photography. Electric blue and white color scheme. No visible text, no logos.',
    size: '3:2',
  },
  {
    name: 'author-1.jpg',
    prompt: 'Professional headshot of a woman creative director in her early 30s, confident expression, modern minimalist office background with blue accent lighting, smart casual attire. Studio portrait photography, sharp focus, no text, no logos.',
    size: '1:1',
  },
  {
    name: 'author-2.jpg',
    prompt: 'Professional headshot of a man lead developer in his late 20s, dark hair, casual tech attire, neutral background with subtle tech environment blur. Studio portrait photography, natural lighting, no text, no logos.',
    size: '1:1',
  },
  {
    name: 'author-3.jpg',
    prompt: 'Professional headshot of a woman data analyst in her early 30s, glasses, confident smile, bright modern office background. Studio portrait photography, clean and professional, no text, no logos.',
    size: '1:1',
  },
  {
    name: 'case-study-1.jpg',
    prompt: 'E-commerce product website mockup displayed on a sleek MacBook Pro. Clean minimalist design with conversion-optimized layout, prominent call-to-action, product photography. Dark desk background, studio lighting. Professional product photography, no visible text.',
    size: '3:2',
  },
  {
    name: 'case-study-2.jpg',
    prompt: 'SaaS dashboard interface on a curved ultrawide monitor. Electric blue and white data visualization, performance analytics, real-time charts and metrics. Dark studio background, dramatic product photography, no readable text.',
    size: '3:2',
  },
  {
    name: 'case-study-3.jpg',
    prompt: 'Mobile-first website design shown on iPhone and iPad simultaneously. Clean modern design with bold typography and strong visual hierarchy. White background, soft shadow. Professional product photography, no readable text, no logos.',
    size: '3:2',
  },
  {
    name: 'process-discover.jpg',
    prompt: 'User experience research session. Person studying heatmaps and session recordings on multiple screens in a dark analytics room. Blue monitor glow lighting, focused composition, editorial photography style. No text, no logos.',
    size: '3:2',
  },
  {
    name: 'process-build.jpg',
    prompt: 'Close-up of developer hands on keyboard with multiple code editor screens visible in background. Cyan syntax highlighting, dark theme IDE, shallow depth of field. Professional editorial photography, moody tech atmosphere. No readable text.',
    size: '3:2',
  },
];

function httpRequest(options, postData) {
  return new Promise(function (resolve, reject) {
    var req = https.request(options, function (res) {
      var data = '';
      res.on('data', function (chunk) { data += chunk; });
      res.on('end', function () {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

function downloadFile(fileUrl, dest) {
  return new Promise(function (resolve, reject) {
    var parsed = url.parse(fileUrl);
    var options = { hostname: parsed.hostname, path: parsed.path, method: 'GET' };
    var req = https.request(options, function (res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      var file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', function () { file.close(resolve); });
    });
    req.on('error', function (err) { fs.unlink(dest, function () {}); reject(err); });
    req.end();
  });
}

async function generateImage(img) {
  var dest = path.join(IMAGES_DIR, img.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log('  ⏭  Skipping ' + img.name + ' (already exists)');
    return;
  }

  console.log('\n🎨 Generating: ' + img.name);

  var payload = JSON.stringify({
    prompt: img.prompt,
    size: img.size,
    isEnhance: true,
    enableFallback: true,
    fallbackModel: 'FLUX_MAX',
  });

  var parsed = url.parse(GENERATE_URL);
  var result = await httpRequest({
    hostname: parsed.hostname,
    path: parsed.path,
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  }, payload);

  if (result.status !== 200 || !result.body.data) {
    console.error('  ❌ Generate failed (' + result.status + '):', JSON.stringify(result.body));
    return;
  }

  var taskId = result.body.data.taskId;
  console.log('  ⏳ Task ID: ' + taskId);

  for (var attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL);
    var pollParsed = url.parse(POLL_URL_BASE + '?taskId=' + taskId);
    var poll = await httpRequest({
      hostname: pollParsed.hostname,
      path: pollParsed.path,
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + API_KEY },
    });

    var d = poll.body && poll.body.data;
    if (!d) { console.log('  ⏳ Waiting... (' + (attempt + 1) + ')'); continue; }

    if (d.successFlag === 2) {
      console.error('  ❌ Generation failed for ' + img.name);
      return;
    }

    if (d.successFlag === 1) {
      var urls = d.response && d.response.resultUrls;
      if (!urls || !urls[0]) { console.error('  ❌ No result URL'); return; }
      console.log('  ⬇  Downloading...');
      await downloadFile(urls[0], dest);
      var size = fs.statSync(dest).size;
      console.log('  ✅ Saved: ' + img.name + ' (' + Math.round(size / 1024) + 'KB)');
      return;
    }

    console.log('  ⏳ Still processing... (' + (attempt + 1) + '/' + MAX_ATTEMPTS + ')');
  }

  console.error('  ⚠️  Timeout for ' + img.name);
}

async function main() {
  console.log('🚀 MetricForge Studio — Image Generator');
  console.log('   Generating ' + IMAGES.length + ' images via kie.ai\n');

  for (var i = 0; i < IMAGES.length; i++) {
    await generateImage(IMAGES[i]);
  }

  console.log('\n✨ Done! All images saved to ./images/');
}

main().catch(function (err) { console.error('Fatal:', err); process.exit(1); });
