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

// 👉 TEMPAT MENGGANTI GOOGLE API KEY:
export const GOOGLE_GEMINI_API_KEY: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GEMINI_API_KEY) ||
  "";

// 👉 DEFAULT MODEL GOOGLE GEMINI (Model 'gemini-3.5-flash-lite' memiliki kuota RPM/RPD tinggi dan bebas rate limit):
export const GOOGLE_GEMINI_MODEL = "gemini-3.5-flash-lite";

/**
 * 📝 PESAN FALLBACK KETIKA PERTANYAAN DI LUAR KONTEKS / SCOPE (OUT OF SCOPE)
 * Anda dapat meng-custom pesan ini jika Bidan menanyakan hal yang tidak dimengerti pasien atau di luar ranah medis/keluhan.
 */
export const DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE =
  "Aduh, maaf ya Bu Bidan... saya agak bingung, sepertinya hal itu tidak terlalu berhubungan dengan keluhan keputihan dan kesehatan saya saat ini.";

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
1. Kamu adalah {patientName} (pasien nyata). Berbicaralah dengan nada santun, sopan, agak cemas/malu namun kooperatif dalam 1-3 kalimat bahasa Indonesia lisan.
2. Jika Bidan bertanya tentang KELUHAN, GEJALA, atau ALASAN DATANG (misal: "Keluhannya apa Bu?", "Kenapa ibu datang?", "Apa yang dirasakan?"), jelaskan keluhan utama kamu secara jelas dan detail (keputihan, bau, warna, durasi, rasa gatal/nyeri, dan perdarahan kontak setelah berhubungan jika ada).
3. Jika Bidan menanyakan bagian mana pun dari 9 riwayat anamnesis (Menstruasi/Haid, Usia Menikah/Pernikahan, Hubungan Seksual, Riwayat Hamil/Melahirkan/Paritas, Kontrasepsi/KB, Riwayat Penyakit/Obat, Kebiasaan/Pola Hidup/Sabun Kewanitaan, Skrining IVA/Pap Smear, atau Vaksin HPV), jawablah secara spesifik dan konsisten dengan data riwayat kesehatan kamu di atas.
4. JIKA BIDAN MENANYAKAN HAL DI LUAR KONTEKS, DI LUAR SCOPE RIWAYAT KESEHATAN, ATAU TOPIK YANG TIDAK BERHUBUNGAN: Jawablah dengan nada bingung dan sopan seperti: "{outOfScopeMessage}" (atau sampaikan bahwa hal itu tidak berhubungan dengan keluhan/pemeriksaan kamu).
5. JANGAN keluar dari peran pasien. Jangan pernah menyebutkan bahwa kamu adalah atau model bahasa.
`.trim();

/**
 * 📝 CUSTOM SYSTEM PROMPT UNTUK POS 5 (ASUHAN & KONSELING KEBIDANAN)
 */
export const CUSTOM_ASUHAN_SYSTEM_PROMPT = `
Kamu berperan sebagai PASIEN PEREMPUAN bernama {patientName} (usia {patientAge} tahun) yang baru saja selesai menjalani pemeriksaan IVA oleh Bidan dan sekarang sedang mendengarkan penjelasan hasil pemeriksaan, konseling, serta asuhan kebidanan dari Bidan di Pos 5.

KONDISI HASIL PEMERIKSAAN & RIWAYAT KASUS:
{patientDescription}

DATA KLINIS PASIEN:
{caseAttributes}

POIN-POIN ASUHAN & KONSELING YANG DIHARAPKAN:
{asuhanTriggers}

PANDUAN RESPONS PASIEN:
1. Responlah penjelasan, empati, dan edukasi dari Bidan secara emosional dan realistis (merasa lega jika hasil normal, atau cemas/butuh ditenangkan jika IVA positif/rujukan).
2. Jika Bidan memberikan edukasi (misal: rujukan SpOG, krioterapi, atau kebersihan organ kewanitaan), sampaikan bahwa kamu paham dan tanyakan hal praktis jika perlu.
3. Berbicaralah dalam 1-3 kalimat lisan yang sopan dan alami.
4. JANGAN keluar dari peran pasien.
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
}: {
  userMessage: string;
  kasus?: Kasus;
  chatHistory?: GeminiChatHistoryItem[];
  customSystemPrompt?: string;
}): Promise<PatientAiResponse> {
  const patientName = kasus?.nama?.split("—")[0]?.trim() || "Ny. Ani";
  const patientAgeMatch = kasus?.nama?.match(/(\d+)\s*tahun/);
  const patientAge =
    kasus?.atribut?.find((a) => a.key.toLowerCase().includes("usia") || a.key.toLowerCase().includes("umur"))?.value ||
    (patientAgeMatch ? patientAgeMatch[1] : "45");

  const patientObstetri =
    kasus?.atribut?.find((a) => a.key.toLowerCase().includes("obstetri") || a.key.toLowerCase().includes("paritas"))?.value || "Multiparitas";

  const patientDescription = kasus?.deskripsi || "Pemeriksaan IVA dan Skrining Kesehatan Reproduksi";

  const keluhanUtamaAttr = kasus?.atribut?.find((a) => a.key.toLowerCase().includes("keluhan"))?.value;
  const triggers = kasus?.stase_data?.stase1?.triggers || [];
  const mainComplaint =
    keluhanUtamaAttr ||
    cleanText(triggers[0]?.jawaban_cadangan) ||
    "Keputihan abnormal dan rasa tidak nyaman di daerah kewanitaan.";

  const caseAttributes =
    kasus?.atribut?.map((a) => `- ${a.key}: ${cleanText(a.value)}`).join("\n") ||
    `- Status Obstetri: ${patientObstetri}\n- Keluhan Utama: ${mainComplaint}`;

  const anamnesisTriggers = triggers
    .map(
      (t, idx) =>
        `${idx + 1}. [${t.konteks}]\n   - Keyword Pertanyaan Bidan: ${t.keyword}\n   - Fakta Jawaban Pasien: "${cleanText(t.jawaban_cadangan)}"`,
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

  const apiKey = GOOGLE_GEMINI_API_KEY.trim();

  // If user hasn't replaced the placeholder API key, use the local smart trigger matcher
  if (!apiKey || apiKey === "YOUR_GOOGLE_GEMINI_API_KEY_HERE") {
    console.warn(
      "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK (API Key belum diisi/default)",
      "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      { alasan: "API Key belum diatur", pertanyaanBidan: userMessage },
    );
    return generateFallbackTriggerReply(userMessage, triggers, patientName, mainComplaint);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GOOGLE_GEMINI_MODEL}:generateContent?key=${apiKey}`;

    // Build Gemini contents payload with system instructions
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
      {
        role: "user",
        parts: [{ text: `[INSTRUKSI SISTEM & LATAR BELAKANG PASIEN]\n${filledSystemPrompt}` }],
      },
      {
        role: "model",
        parts: [
          {
            text: `Saya mengerti. Saya sekarang adalah ${patientName} (${patientAge} tahun), pasien di Poli KIA. Riwayat keluhan utama saya adalah: ${mainComplaint}. Saya siap menjawab seluruh pertanyaan Bidan secara santun dan sesuai riwayat kesehatan saya.`,
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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      console.warn(
        `%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK (HTTP ${response.status})`,
        "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
        {
          alasan: `Gemini API HTTP status ${response.status}`,
          pertanyaanBidan: userMessage,
        },
      );
      return generateFallbackTriggerReply(userMessage, triggers, patientName, mainComplaint);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (candidateText) {
      const lowerInput = userMessage.toLowerCase();
      const matchedTrg = triggers.find((t) =>
        t.keyword
          .split(/[,|]/)
          .map((k) => k.trim().toLowerCase())
          .filter(Boolean)
          .some((kw) => lowerInput.includes(kw)),
      );

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

    console.warn(
      "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK (Respons Gemini Kosong)",
      "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
    );
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
}: {
  userMessage: string;
  kasus?: Kasus;
  chatHistory?: GeminiChatHistoryItem[];
  customSystemPrompt?: string;
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
    .replace(/{asuhanTriggers}/g, asuhanTriggers);

  const apiKey = GOOGLE_GEMINI_API_KEY.trim();

  if (!apiKey || apiKey === "YOUR_GOOGLE_GEMINI_API_KEY_HERE") {
    console.warn(
      "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK KONSELiNG (API Key belum diisi)",
      "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
    );
    return generateFallbackTriggerReply(userMessage, triggers, patientName);
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
            text: `Saya mengerti. Saya sekarang adalah ${patientName}, mendengarkan penjelasan hasil IVA dan konseling asuhan dari Bu Bidan.`,
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

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      console.warn(
        `%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK KONSELING (HTTP ${response.status})`,
        "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      );
      return generateFallbackTriggerReply(userMessage, triggers, patientName);
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

    return generateFallbackTriggerReply(userMessage, triggers, patientName);
  } catch (error) {
    console.error(
      "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 MENGGUNAKAN LOCAL FALLBACK KONSELING (Error/Offline)",
      "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
      error,
    );
    return generateFallbackTriggerReply(userMessage, triggers, patientName);
  }
}

/**
 * Fallback Trigger Matcher jika API Key belum diisi atau offline
 */
function generateFallbackTriggerReply(
  userMessage: string,
  triggers: Array<{ konteks: string; keyword: string; jawaban_cadangan: string }>,
  patientName: string,
  mainComplaint?: string,
): PatientAiResponse {
  const lowerText = userMessage.toLowerCase();

  // If asking about complaint or reason to visit, prioritize trigger 0 / main complaint
  if (
    lowerText.includes("keluhan") ||
    lowerText.includes("kenapa") ||
    lowerText.includes("alasan") ||
    lowerText.includes("merasa") ||
    lowerText.includes("sakit apa") ||
    lowerText.includes("ada apa")
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
  console.log(
    "%c[AI ENGINE: LOCAL FALLBACK TRIGGER] 🟠 JAWABAN DARI OUT-OF-SCOPE FALLBACK",
    "background: #c2410c; color: #ffffff; font-weight: bold; padding: 4px 8px; border-radius: 4px;",
    { input: userMessage, output: DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE },
  );
  return {
    replyText: DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE,
    matchedCategory: "Di Luar Konteks / Scope",
    source: "rule-trigger-fallback",
  };
}
