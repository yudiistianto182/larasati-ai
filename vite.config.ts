import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type Plugin } from "vite";

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

/**
 * Vite Dev Middleware: Menangani endpoint /api/tts secara langsung di server lokal
 * sehingga 100% bebas dari CORS dan tidak pernah menghasilkan 404 / 400.
 */
function ttsDevMiddlewarePlugin(): Plugin {
  return {
    name: "tts-dev-middleware",
    configureServer(server) {
      const handleTts = async (req: any, res: any) => {
        try {
          const url = new URL(req.url || "", `http://${req.headers.host}`);
          let text = url.searchParams.get("text") || "";

          // Handle POST body jika ada
          if (!text && req.method === "POST") {
            const buffers: Buffer[] = [];
            for await (const chunk of req) {
              buffers.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
            }
            try {
              const body = JSON.parse(Buffer.concat(buffers).toString());
              text = body.text || "";
            } catch {
              // Ignore
            }
          }

          const rawText = text.trim();
          if (!rawText) {
            res.statusCode = 400;
            res.end("No text provided");
            return;
          }

          const chunks = splitTextIntoTtsChunks(rawText, 140);
          if (chunks.length === 0) {
            res.statusCode = 400;
            res.end("No valid text chunks");
            return;
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
            res.statusCode = 502;
            res.end("Upstream TTS fetch failed");
            return;
          }

          const finalAudio = Buffer.concat(audioBuffers);
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.statusCode = 200;
          res.end(finalAudio);
        } catch (err) {
          console.error("[Vite TTS Middleware Error]:", err);
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      };

      server.middlewares.use("/service/tts", handleTts);
    },
  };
}

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: /^simli-client$/, replacement: "simli-client/dist/client.js" },
      { find: /^simli-client\/dist\/Client$/, replacement: "simli-client/dist/client.js" },
    ],
  },
  server: {
    watch: {
      ignored: [
        "**/.source/**",
        "**/.output/**",
        "**/.vinxi/**",
        "**/dist/**",
        "**/*.docx",
        "**/*.xlsx",
        "**/*.mp3",
      ],
    },
  },
  plugins: [
    ttsDevMiddlewarePlugin(),
    devtools({
      injectSource: {
        enabled: true,
        ignore: {
          components: ["FullCalendar"],
        },
      },
    }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
});

export default config;
