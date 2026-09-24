/**
 * ============================================================================
 * GOOGLE GEMINI INTEGRATION SERVICE — MIDWIFE CIRCUIT CHALLENGE
 * ============================================================================
 * 
 * 🔑 CARA MENGGANTI GOOGLE GEMINI API KEY:
 * 1. Dapatkan Google Gemini API Key gratis di: https://aistudio.google.com/app/apikey
 * 2. Ganti string di bawah ini pada konstanta GOOGLE_GEMINI_API_KEY, ATAU
 * 3. Tambahkan ke file .env: VITE_GEMINI_API_KEY=AIzaSy...
 * 
 * 📝 CARA MENG-CUSTOM PROMPT:
 * - Anda dapat mengubah CUSTOM_ANAMNESIS_SYSTEM_PROMPT dan CUSTOM_ASUHAN_SYSTEM_PROMPT di bawah.
 */

import type { Kasus } from "@/routes/(admin)/dashboard/master/kasus/-components/data";
import { useSysConfigStore, FALLBACK_GEMINI_API_KEY } from "@/stores/sys-config-store";

// 👉 TEMPAT MENGGANTI GOOGLE API KEY:
export const GOOGLE_GEMINI_API_KEY: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
  FALLBACK_GEMINI_API_KEY;

/**
 * Mendapatkan Google Gemini API Key efektif (prioritas: dynamic sys-config -> fallback)
 */
export function getEffectiveGeminiApiKey(): string {
  try {
    const dynamicKey = useSysConfigStore.getState().getEffectiveGeminiKey();
    if (dynamicKey && dynamicKey.trim()) return dynamicKey.trim();
  } catch {
    // fallback
  }
  return GOOGLE_GEMINI_API_KEY.trim();
}

// 👉 DEFAULT MODEL GOOGLE GEMINI (Model 'gemini-3.5-flash-lite' memiliki kuota RPM/RPD tinggi dan bebas rate limit):
export const GOOGLE_GEMINI_MODEL = "gemini-3.5-flash-lite";

/**
 * 📝 PESAN FALLBACK KETIKA PERTANYAAN DI LUAR KONTEKS / SCOPE (OUT OF SCOPE)
 * Anda dapat meng-custom pesan ini jika Bidan menanyakan hal yang tidak dimengerti pasien atau di luar ranah medis/keluhan.
 */
export const DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE =
  "Aduh, maaf ya Bu Bidan... saya agak bingung, sepertinya hal itu tidak terlalu berhubungan dengan keluhan keputihan dan kesehatan saya saat ini.";

export const DEFAULT_ASUHAN_OUT_OF_SCOPE_FALLBACK_MESSAGE =
  "Maaf Bu Bidan, saya kurang mengerti... Saya sedang cemas dengan hasil IVA saya, bagaimana hasil dan tindak lanjutnya ya Bu?";

export const DEFAULT_ASUHAN_WRONG_ANSWER_FALLBACK_MESSAGE =
  "Ya Allah... Benar separah itu Bu Bidan? Tolong jangan menakuti saya, apa benar tidak ada harapan pengobatan lagi?";

/**
 * 📝 CUSTOM SYSTEM PROMPT UNTUK POS 1 (ANAMNESIS PASIEN)
 * Prompt ini secara otomatis menyematkan seluruh data riwayat klinis pasien dari master kasus.
 */
export const CUSTOM_ANAMNESIS_SYSTEM_PROMPT = `
Kamu berperan sebagai PASIEN PEREMPUAN bernama {patientName} (usia {patientAge} tahun, status obstetri {patientObstetri}) yang sedang datang ke Poli KIA Puskesmas untuk berkonsultasi dan diperiksa oleh seorang Mahasiswa Bidan.

DESKRIPSI KLINIS KASUS:
{patientDescription}

KELUHAN UTAMA & ALASAN KEDATANGAN:
{mainComplaint}

DATA LENGKAP 9 RIWAYAT KESEHATAN & ANAMNESIS KAMU:
{caseAttributes}

POIN-POIN JAWABAN DETIL SESUAI KATEGORI ANAMNESIS:
{anamnesisTriggers}

PANDUAN & ATURAN WAWANCARA:
1. Kamu adalah {patientName} (pasien nyata). Berbicaralah SINGKAT dan PADAT dengan nada santun dalam 1-2 kalimat pendek bahasa Indonesia lisan (maksimal 20 kata / 120 karakter).
2. Jika Bidan bertanya tentang KELUHAN, GEJALA, atau ALASAN DATANG (misal: "Keluhannya apa Bu?", "Kenapa ibu datang?", "Apa yang dirasakan?"), jelaskan keluhan utama kamu secara jelas dan detail (keputihan, bau, warna, durasi, rasa gatal/nyeri, dan perdarahan kontak setelah berhubungan jika ada).
3. Jika Bidan menanyakan bagian mana pun dari 9 riwayat anamnesis (Menstruasi/Haid, Usia Menikah/Pernikahan, Hubungan Seksual, Riwayat Hamil/Melahirkan/Paritas, Kontrasepsi/KB, Riwayat Penyakit/Obat, Kebiasaan/Pola Hidup/Sabun Kewanitaan, Skrining IVA/Pap Smear, atau Vaksin HPV), jawablah secara spesifik dan konsisten dengan data riwayat kesehatan kamu di atas.
4. JIKA BIDAN MENANYAKAN HAL DI LUAR KONTEKS, DI LUAR SCOPE RIWAYAT KESEHATAN, ATAU TOPIK YANG TIDAK BERHUBUNGAN: Jawablah dengan nada bingung dan sopan seperti: "{outOfScopeMessage}" (atau sampaikan bahwa hal itu tidak berhubungan dengan keluhan/pemeriksaan kamu).
5. JANGAN keluar dari peran pasien. Jangan pernah menyebutkan bahwa kamu adalah AI atau model bahasa.
`.trim();

/**
 * 📝 CUSTOM SYSTEM PROMPT UNTUK POS 5 (ASUHAN & KONSELING KEBIDANAN)
 */
export const CUSTOM_ASUHAN_SYSTEM_PROMPT = `
Kamu berperan sebagai PASIEN PEREMPUAN bernama {patientName} (usia {patientAge} tahun) yang baru selesai diperiksa IVA di Pos 5 dan mendengarkan penjelasan hasil, konseling, serta asuhan dari Bidan.

KONDISI HASIL PEMERIKSAAN & RIWAYAT KASUS:
{patientDescription}

DATA KLINIS PASIEN:
{caseAttributes}

POIN-POIN ASUHAN & KONSELING YANG DIHARAPKAN (TOPIK RESMI ASUHAN):
{asuhanTriggers}

ATURAN DAN PANDUAN WAJIB RESPONS PASIEN:
1. SANGAT PENTING: Jawablah dengan SINGKAT, PADAT, dan LISAN (Maksimal 1-2 kalimat pendek, di bawah 20 kata / 110 karakter). DILARANG menjawab panjang-lebar.
2. JIKA BIDAN MEMBERIKAN ASUHAN YANG BENAR (misal: menjelaskan IVA positif belum tentu kanker, perlunya kolaborasi SpOG, rencana rujukan, atau memastikan pemahaman):
   - Jawablah singkat dengan rasa lega, paham, dan siap mengikuti rencana rujukan ke rumah sakit.
3. JIKA BIDAN MEMBERIKAN PERNYATAAN SALAH / MENAKUTI / MENYESATKAN (misal: langsung memvonis pasti kanker stadium lanjut / susah diobati / menyuruh pasrah saja, atau bilang tidak perlu rujukan):
   - Jawablah singkat dengan reaksi kaget, takut, cemas, dan tanyakan kepastiannya ke Bidan: "{asuhanWrongAnswerMessage}"
4. JIKA PERNYATAAN / PERTANYAAN BIDAN BENAR-BENAR DI LUAR KONTEKS ASUHAN & HASIL PEMERIKSAAN IVA (misal: topik acak tidak relevan):
   - Jawablah singkat bahwa kamu tidak mengerti dan minta Bidan kembali fokus ke hasil pemeriksaan IVA: "{asuhanOutOfScopeMessage}"
5. JANGAN keluar dari peran pasien. Jangan pernah menyebutkan bahwa kamu adalah AI atau model bahasa.
`.trim();

export interface GeminiChatHistoryItem {
  sender: "midwife" | "ai";
  text: string;
}

export interface PatientAiResponse {
  replyText: string;
  matchedCategory?: string;
  source: "gemini-api" | "rule-trigger-fallback";
}

/**
 * Membersihkan tanda kutip ganda/escaping dari string cadangan
 */
function cleanText(txt?: string): string {
  if (!txt) return "";
  return txt.replace(/^["'\s\\]+|["'\s\\]+$/g, "").trim();
}

/**
 * Mengirim pesan / transkrip suara Bidan ke Google Gemini API untuk menghasilkan respons Pasien Virtual di Pos 1 (Anamnesis).
 */
export async function fetchPatientAnamnesisAiReply({
  userMessage,
  kasus,
  chatHistory = [],
  customSystemPrompt,
  disableGemini = false,
}: {
  userMessage: string;
  kasus?: Kasus;
  chatHistory?: GeminiChatHistoryItem[];
  customSystemPrompt?: string;
  disableGemini?: boolean;
}): Promise<PatientAiResponse> {
  const rawPatientName = kasus?.nama?.split("—")[0]?.trim() || "Ny. Ani";
  const patientName = rawPatientName.replace(/\s*\([^)]*\)/g, "").trim() || "Ny. Ani";
  const patientAgeMatch = kasus?.nama?.match(/(\d+)\s*tahun/);
  const patientAge =
    kasus?.atribut?.find((a) => a.key.toLowerCase().includes("usia") || a.key.toLowerCase().includes("umur"))?.value ||
    (patientAgeMatch ? patientAgeMatch[1] : "45");

  const patientObstetri =
    kasus?.atribut?.find((a) => a.key.toLowerCase().includes("obstetri") || a.key.toLowerCase().includes("paritas"))
      ?.value || "G5P4A0";

  const mainComplaint =
    kasus?.atribut?.find((a) => a.key.toLowerCase().includes("keluhan"))?.value ||
    "Keputihan abnormal dan berbau, serta ada perdarahan setelah berhubungan suami istri";

  const patientDescription = kasus?.deskripsi || "Pemeriksaan IVA dan Deteksi Dini Kanker Leher Rahim";

  const caseAttributes =
    kasus?.atribut?.map((a) => `- ${a.key}: ${cleanText(a.value)}`).join("\n") ||
    "- Usia: 45 tahun\n- Paritas: G5P4A0\n- Keluhan: Keputihan dan perdarahan kontak";

  const triggers = kasus?.stase_data?.stase1?.triggers || [];
  const anamnesisTriggers = triggers
    .map(
      (t, idx) =>
        `${idx + 1}. [${t.konteks}]\n   - Kata Kunci / Pertanyaan: ${t.keyword}\n   - Fakta Medis Pasien: "${cleanText(t.jawaban_cadangan)}"`,
    )
    .join("\n\n");

  // Format the system prompt
  const basePromptTemplate = customSystemPrompt || CUSTOM_ANAMNESIS_SYSTEM_PROMPT;
  const filledSystemPrompt = basePromptTemplate
    .replace(/{patientName}/g, patientName)
    .replace(/{patientAge}/g, patientAge)
    .replace(/{patientObstetri}/g, patientObstetri)
    .replace(/{patientDescription}/g, patientDescription)
    .replace(/{mainComplaint}/g, mainComplaint)
    .replace(/{caseAttributes}/g, caseAttributes)
    .replace(/{anamnesisTriggers}/g, anamnesisTriggers)
    .replace(/{outOfScopeMessage}/g, DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE);

  const matchedTrg = triggers.find((trg) => {
    const kws = trg.keyword
      .split(/[,|]/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    return kws.some((kw) => userMessage.toLowerCase().includes(kw));
  });

  const apiKey = getEffectiveGeminiApiKey();

  // If Gemini is disabled (offline/static mode) or API key is not configured, use local trigger matcher
  if (disableGemini || !apiKey || apiKey === "YOUR_GOOGLE_GEMINI_API_KEY_HERE") {
    console.log(
      "%c[AI ENGINE: LOCAL TRIGGER MODE] 🔵 MENGGUNAKAN LOCAL FALLBACK TRIGGER (Mode Statis / Gemini Nonaktif)",
      "background: #1e3a8a; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
    );
    return generateFallbackTriggerReply(userMessage, triggers, patientName, mainComplaint);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_GEMINI_MODEL}:generateContent?key=${apiKey}`;

    // Build Gemini contents payload with system instructions
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
      {
        role: "user",
        parts: [{ text: `[INSTRUKSI SISTEM & DATA MEDIS PASIEN]\n${filledSystemPrompt}` }],
      },
      {
        role: "model",
        parts: [
          {
            text: `Saya mengerti dan siap berperan sebagai ${patientName}. Saya akan menjawab pertanyaan Bidan secara konsisten dengan data riwayat kesehatan saya di atas.`,
          },
        ],
      },
    ];

    // Append recent chat history (up to last 6 messages)
    const recentHistory = chatHistory.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.sender === "midwife" ? "user" : "model",
        parts: [{ text: cleanText(msg.text) }],
      });
    }

    // Append current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 65,
          topP: 0.9,
        },
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(
        `%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK (HTTP ${response.status})`,
        "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      );
      return generateFallbackTriggerReply(userMessage, triggers, patientName, mainComplaint);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (candidateText) {
      const finalReply = cleanText(candidateText);
      console.log(
        "%c[AI ENGINE: GOOGLE GEMINI API] 🟢 BERHASIL MENGGUNAKAN GEMINI API",
        "background: #047857; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        {
          model: GOOGLE_GEMINI_MODEL,
          pertanyaanBidan: userMessage,
          jawabanPasienGemini: finalReply,
          kategoriKlinis: matchedTrg?.konteks || "Wawancara Bebas Terarah",
          source: "gemini-api",
        },
      );

      return {
        replyText: finalReply,
        matchedCategory: matchedTrg?.konteks || "Wawancara Terarah",
        source: "gemini-api",
      };
    }

    return generateFallbackTriggerReply(userMessage, triggers, patientName, mainComplaint);
  } catch (error) {
    console.error(
      "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK (Fetch Error/Offline)",
      "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      error,
    );
    return generateFallbackTriggerReply(userMessage, triggers, patientName, mainComplaint);
  }
}

/**
 * Mengirim pesan / transkrip suara Bidan ke Google Gemini API untuk Pos 5 (Asuhan & Konseling).
 */
export async function fetchPatientCounselingAiReply({
  userMessage,
  kasus,
  chatHistory = [],
  customSystemPrompt,
  disableGemini = false,
}: {
  userMessage: string;
  kasus?: Kasus;
  chatHistory?: GeminiChatHistoryItem[];
  customSystemPrompt?: string;
  disableGemini?: boolean;
}): Promise<PatientAiResponse> {
  const patientName = kasus?.nama?.split("—")[0]?.trim() || "Ny. A";
  const patientAgeMatch = kasus?.nama?.match(/(\d+)\s*tahun/);
  const patientAge =
    kasus?.atribut?.find((a) => a.key.toLowerCase().includes("usia") || a.key.toLowerCase().includes("umur"))?.value ||
    (patientAgeMatch ? patientAgeMatch[1] : "45");

  const patientDescription = kasus?.deskripsi || "Pemeriksaan IVA dan Skrining Kesehatan Reproduksi";
  const caseAttributes =
    kasus?.atribut?.map((a) => `- ${a.key}: ${cleanText(a.value)}`).join("\n") || "Pasien KIA";

  const triggers = kasus?.stase_data?.stase5?.triggers || [];
  const asuhanTriggers = triggers
    .map(
      (t, idx) =>
        `${idx + 1}. [${t.konteks}]\n   - Topik Pembahasan: ${t.keyword}\n   - Respon/Paham Pasien: "${cleanText(t.jawaban_cadangan)}"`,
    )
    .join("\n\n");

  const basePromptTemplate = customSystemPrompt || CUSTOM_ASUHAN_SYSTEM_PROMPT;
  const filledSystemPrompt = basePromptTemplate
    .replace(/{patientName}/g, patientName)
    .replace(/{patientAge}/g, patientAge)
    .replace(/{patientDescription}/g, patientDescription)
    .replace(/{caseAttributes}/g, caseAttributes)
    .replace(/{asuhanTriggers}/g, asuhanTriggers)
    .replace(/{asuhanWrongAnswerMessage}/g, DEFAULT_ASUHAN_WRONG_ANSWER_FALLBACK_MESSAGE)
    .replace(/{asuhanOutOfScopeMessage}/g, DEFAULT_ASUHAN_OUT_OF_SCOPE_FALLBACK_MESSAGE);

  const apiKey = getEffectiveGeminiApiKey();

  // If Gemini is disabled (offline/static mode) or API key is not configured, use local trigger matcher
  if (disableGemini || !apiKey || apiKey === "YOUR_GOOGLE_GEMINI_API_KEY_HERE") {
    console.log(
      "%c[AI ENGINE: LOCAL TRIGGER MODE] 🔵 MENGGUNAKAN LOCAL FALLBACK KONSELING (Mode Statis / Gemini Nonaktif)",
      "background: #1e3a8a; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
    );
    return generateFallbackTriggerReply(userMessage, triggers, patientName, undefined, "asuhan");
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const contents = [
      {
        role: "user",
        parts: [{ text: `[INSTRUKSI SISTEM & LATAR BELAKANG PASIEN]\n${filledSystemPrompt}` }],
      },
      {
        role: "model",
        parts: [
          {
            text: `Saya mengerti. Saya sekarang adalah ${patientName}, mendengarkan penjelasan hasil IVA dan konseling asuhan dari Bu Bidan secara singkat dan santun.`,
          },
        ],
      },
    ];

    const recentHistory = chatHistory.slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.sender === "midwife" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 65,
          topP: 0.9,
        },
      }),
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(
        `%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK KONSELING (HTTP ${response.status})`,
        "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      );
      return generateFallbackTriggerReply(userMessage, triggers, patientName, undefined, "asuhan");
    }

    const data = await response.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (candidateText) {
      const finalReply = cleanText(candidateText);
      console.log(
        "%c[AI ENGINE: GOOGLE GEMINI API] 🟢 BERHASIL MENGGUNAKAN GEMINI API KONSELING",
        "background: #047857; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        {
          model: GOOGLE_GEMINI_MODEL,
          penjelasanBidan: userMessage,
          responPasienGemini: finalReply,
          source: "gemini-api",
        },
      );

      return {
        replyText: finalReply,
        matchedCategory: "Konseling Empatik",
        source: "gemini-api",
      };
    }

    return generateFallbackTriggerReply(userMessage, triggers, patientName, undefined, "asuhan");
  } catch (error) {
    console.error(
      "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK KONSELING (Error/Offline)",
      "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      error,
    );
    return generateFallbackTriggerReply(userMessage, triggers, patientName, undefined, "asuhan");
  }
}

/**
 * Fallback Trigger Matcher jika API Key belum diisi atau offline
 */
export function generateFallbackTriggerReply(
  userMessage: string,
  triggers: Array<{ konteks: string; keyword: string; jawaban_cadangan: string }>,
  _patientName: string,
  mainComplaint?: string,
  stageType: "anamnesis" | "asuhan" = "anamnesis",
): PatientAiResponse {
  const lowerText = userMessage.toLowerCase();

  // If in Pos 5 (Asuhan): Check for explicitly misleading/wrong diagnosis keywords
  if (
    stageType === "asuhan" &&
    (lowerText.includes("pasti kanker") ||
      lowerText.includes("kanker serviks berat") ||
      lowerText.includes("stadium lanjut") ||
      lowerText.includes("susah diobat") ||
      lowerText.includes("tidak bisa diobat") ||
      lowerText.includes("tidak ada harapan") ||
      lowerText.includes("cuma doa") ||
      lowerText.includes("berdoa aja") ||
      lowerText.includes("tidak perlu rujukan") ||
      lowerText.includes("tidak usah periksa"))
  ) {
    console.log(
      "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 JAWABAN DARI WRONG-ANSWER ASUHAN FALLBACK",
      "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      { input: userMessage, output: DEFAULT_ASUHAN_WRONG_ANSWER_FALLBACK_MESSAGE },
    );
    return {
      replyText: DEFAULT_ASUHAN_WRONG_ANSWER_FALLBACK_MESSAGE,
      matchedCategory: "Respon Kekeliruan Asuhan",
      source: "rule-trigger-fallback",
    };
  }

  // If in Anamnesis: asking about complaint or reason to visit, prioritize trigger 0 / main complaint
  if (
    stageType === "anamnesis" &&
    (lowerText.includes("keluhan") ||
      lowerText.includes("kenapa") ||
      lowerText.includes("alasan") ||
      lowerText.includes("merasa") ||
      lowerText.includes("sakit apa") ||
      lowerText.includes("ada apa"))
  ) {
    const complaintText = cleanText(triggers[0]?.jawaban_cadangan) || mainComplaint;
    if (complaintText) {
      console.log(
        "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 JAWABAN DARI TRIGGER KELUHAN LOKAL",
        "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        { input: userMessage, output: complaintText },
      );
      return {
        replyText: complaintText,
        matchedCategory: triggers[0]?.konteks || "Riwayat Keluhan Utama",
        source: "rule-trigger-fallback",
      };
    }
  }

  // Try keyword match across all triggers
  for (const trg of triggers) {
    const keywords = trg.keyword
      .split(/[,|]/)
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (keywords.some((kw) => lowerText.includes(kw))) {
      const resp = cleanText(trg.jawaban_cadangan);
      console.log(
        `%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 JAWABAN DARI TRIGGER LOKAL: ${trg.konteks}`,
        "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        { input: userMessage, output: resp },
      );
      return {
        replyText: resp,
        matchedCategory: trg.konteks,
        source: "rule-trigger-fallback",
      };
    }
  }

  // If no keywords match and question is out of scope / unrecognized
  const outOfScopeText =
    stageType === "asuhan"
      ? DEFAULT_ASUHAN_OUT_OF_SCOPE_FALLBACK_MESSAGE
      : DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE;

  console.log(
    "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 JAWABAN DARI OUT-OF-SCOPE FALLBACK",
    "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
    { input: userMessage, output: outOfScopeText },
  );
  return {
    replyText: outOfScopeText,
    matchedCategory: "Di Luar Konteks / Scope",
    source: "rule-trigger-fallback",
  };
}
