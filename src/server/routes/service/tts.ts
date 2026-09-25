import { defineEventHandler, getQuery, readBody, setHeader, setResponseStatus } from "nitro/h3";

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
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  setHeader(event, "Access-Control-Allow-Headers", "Content-Type");

  if (event.method === "OPTIONS") {
    setResponseStatus(event, 204);
    return "";
  }

  let text = "";
  const query = getQuery(event);
  if (query.text) {
    text = String(query.text);
  }

  if (!text && event.method === "POST") {
    try {
      const body = await readBody(event);
      if (typeof body === "string") {
        try {
          text = JSON.parse(body).text || "";
        } catch {
          text = body;
        }
      } else if (body && typeof body === "object") {
        text = body.text || "";
      }
    } catch {
      // ignore
    }
  }

  const rawText = text.trim();
  if (!rawText) {
    setResponseStatus(event, 400);
    return "No text provided";
  }

  const chunks = splitTextIntoTtsChunks(rawText, 140);
  if (chunks.length === 0) {
    setResponseStatus(event, 400);
    return "No valid text chunks";
  }

  const audioBuffers: Buffer[] = [];
  for (const chunk of chunks) {
    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
      chunk,
    )}&tl=id&client=tw-ob`;

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
  }

  if (audioBuffers.length === 0) {
    setResponseStatus(event, 502);
    return "Upstream TTS fetch failed";
  }

  const finalAudio = Buffer.concat(audioBuffers);
  setHeader(event, "Content-Type", "audio/mpeg");
  return finalAudio;
});
