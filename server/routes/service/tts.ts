import { defineEventHandler, readBody, getQuery, setResponseHeader } from "h3";

function splitTextIntoTtsChunks(text: string, maxLen = 140): string[] {
  const clean = text.replace(/[*_#`~>]/g, " ").replace(/\s+/g, " ").trim();
  const sentences = clean.split(/(?<=[.?!,;:])\s+/);
  const chunks: string[] = [];
  let cur = "";

  for (const s of sentences) {
    if ((cur + " " + s).trim().length <= maxLen) {
      cur = (cur + " " + s).trim();
    } else {
      if (cur) chunks.push(cur);
      if (s.length > maxLen) {
        const words = s.split(/\s+/);
        let wCur = "";
        for (const w of words) {
          if ((wCur + " " + w).trim().length <= maxLen) {
            wCur = (wCur + " " + w).trim();
          } else {
            if (wCur) chunks.push(wCur);
            wCur = w;
          }
        }
        cur = wCur;
      } else {
        cur = s;
      }
    }
  }
  if (cur) chunks.push(cur);
  return chunks.filter((c) => c.length > 0);
}

export default defineEventHandler(async (event) => {
  // Handle CORS
  setResponseHeader(event, "Access-Control-Allow-Origin", "*");
  setResponseHeader(event, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  setResponseHeader(event, "Access-Control-Allow-Headers", "Content-Type");

  if (event.method === "OPTIONS") {
    return "";
  }

  let text = "";

  // Handle POST body
  if (event.method === "POST") {
    try {
      const body = await readBody(event);
      text = body?.text || "";
    } catch {
      // Ignore parse errors
    }
  }

  // Fallback to query string
  if (!text) {
    const query = getQuery(event);
    text = (query.text as string) || "";
  }

  const rawText = text.trim();
  if (!rawText) {
    event.node.res.statusCode = 400;
    return "No text provided";
  }

  const chunks = splitTextIntoTtsChunks(rawText, 140);
  if (chunks.length === 0) {
    event.node.res.statusCode = 400;
    return "No valid text chunks";
  }

  const audioBuffers: Buffer[] = [];
  for (const chunk of chunks) {
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=id&client=tw-ob`;

    try {
      const upstreamRes = await fetch(googleUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      });

      if (upstreamRes.ok) {
        const arrayBuffer = await upstreamRes.arrayBuffer();
        audioBuffers.push(Buffer.from(arrayBuffer));
      }
    } catch (err) {
      console.warn("[TTS API] Upstream fetch error for chunk:", err);
    }
  }

  if (audioBuffers.length === 0) {
    event.node.res.statusCode = 502;
    return "Upstream TTS fetch failed";
  }

  const finalAudio = Buffer.concat(audioBuffers);
  setResponseHeader(event, "Content-Type", "audio/mpeg");
  return finalAudio;
});
