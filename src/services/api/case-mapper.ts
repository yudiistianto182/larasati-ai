/**
 * Case Mapper Utility
 * 
 * Mengonversi data dari API backend (/v1/data_case) ke format form wizard frontend (Kasus & StaseSoalData),
 * serta menyusun FormData terstruktur untuk dikirimkan kembali ke backend Adonis pada create & update.
 */

import type { DataCaseDetail } from "@/types/api";
import { buildStorageUrl } from "@/lib/api/api-helper";
import {
  createDefaultStaseSoalData,
  type AiKeywordTrigger,
  type FaktorRisikoItem,
  type InterpretasiImageItem,
  type InterpretasiOption,
  type Kasus,
  type KasusAttribute,
  type ProsedurStepItem,
  type StaseSoalData,
} from "@/routes/(admin)/dashboard/master/kasus/-components/data";

/**
 * Konversi DataURL (base64) ke object File untuk FormData upload
 */
export function dataUrlToFile(dataUrl: string, filename = "image.png"): File | null {
  try {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.error("Failed to convert dataUrl to File:", e);
    return null;
  }
}

/**
 * Membersihkan ID kasus ke format numerik murni untuk backend API.
 * Contoh: "KSS-046" -> "46", "46" -> "46"
 */
export function extractNumericCaseId(id: string | number): string {
  const str = String(id).trim();
  const digits = str.replace(/[^0-9]/g, "");
  return digits || str;
}

/**
 * Membersihkan ID pasien ke format numerik murni.
 * Contoh: "PSN-001" -> "1", "1" -> "1"
 */
export function extractNumericPatientId(id: string | number): number {
  const digits = String(id).replace(/[^0-9]/g, "");
  const num = parseInt(digits, 10);
  return isNaN(num) ? 1 : num;
}

/**
 * Memformat durasi detik ke teks label durasi (contoh: 420 -> "7 Menit", 15 -> "15 Detik", 75 -> "1 Menit 15 Detik")
 */
export function formatDurationLabel(totalSeconds: number): string {
  const sec = Math.max(0, Math.round(totalSeconds));
  if (sec === 0) return "0 Detik";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 0 && s > 0) return `${m} Menit ${s} Detik`;
  if (m > 0) return `${m} Menit`;
  return `${s} Detik`;
}

/**
 * Memetakan response detail API backend ke model Kasus frontend.
 */
export function mapApiDetailToKasus(detail: DataCaseDetail): Kasus {
  const baseDefaults = createDefaultStaseSoalData();

  // 1. Identitas & Atribut
  const cleanId = `KSS-${detail.case_id}`;
  const nama = detail.case_name || "";
  const deskripsi = detail.case_desc || "";
  const teksPerkenalan = detail.case_introduction || "";

  const atribut: KasusAttribute[] = Array.isArray(detail.attribute) && detail.attribute.length > 0
    ? detail.attribute.map((a, idx) => ({
      id: a.caseattribute_id ? `attr-${a.caseattribute_id}` : `attr-idx-${idx}`,
      key: a.caseattribute_name || "",
      value: a.caseattribute_value || "",
    }))
    : [
      { id: `attr-${Date.now()}-1`, key: "Diagnosis Utama", value: "" },
      { id: `attr-${Date.now()}-2`, key: "Tingkat Kegawatan", value: "" },
    ];

  // 2. Pasien Terkait
  const pasienIds: string[] = Array.isArray(detail.patient)
    ? detail.patient.map((p) => `PSN-${p.casepatient_patient_id}`)
    : [];
  const patientCount = typeof (detail as any).patient_count === "number"
    ? (detail as any).patient_count
    : typeof (detail as any).pasien_count === "number"
      ? (detail as any).pasien_count
      : pasienIds.length;

  // 3. Stase Soal
  const staseData: StaseSoalData = {
    stase1: { ...baseDefaults.stase1, triggers: [...baseDefaults.stase1.triggers] },
    stase2: { ...baseDefaults.stase2, faktor_risiko: [...baseDefaults.stase2.faktor_risiko] },
    stase3: { ...baseDefaults.stase3, langkah_prosedur: [...baseDefaults.stase3.langkah_prosedur] },
    stase4: { ...baseDefaults.stase4, images: [...baseDefaults.stase4.images], pilihan_jawaban: [...baseDefaults.stase4.pilihan_jawaban] },
    stase5: { ...baseDefaults.stase5, triggers: [...baseDefaults.stase5.triggers] },
  };

  let hasPerekamNilai = false;

  if (Array.isArray(detail.quest)) {
    // Sort berdasarkan order jika ada
    const sortedQuests = [...detail.quest].sort((a, b) => (a.casequest_order || 0) - (b.casequest_order || 0));

    // Stase 1: Method 1 pertama atau order 1
    // Stase 1: Method 1 (Anamnesis) atau order 1
    const quest1 = sortedQuests.find((q) => q.casequest_order === 1 || q.casequest_method_id === 1);
    if (quest1) {
      const q1Seconds = typeof quest1.casequest_limit_time === "number" && quest1.casequest_limit_time > 0
        ? quest1.casequest_limit_time
        : 300;
      staseData.stase1 = {
        casequest_id: quest1.casequest_id,
        header: {
          nama_stase: quest1.casequest_name || baseDefaults.stase1.header.nama_stase,
          kode_amplop: (quest1 as any).casequest_envelope_code || baseDefaults.stase1.header.kode_amplop,
          durasi_detik: q1Seconds,
          durasi_menit: q1Seconds >= 60 ? Math.round(q1Seconds / 60) : 1,
          petunjuk_soal: baseDefaults.stase1.header.petunjuk_soal,
        },
        ai_system_prompt: quest1.personality || baseDefaults.stase1.ai_system_prompt,
        init_message: quest1.casequestia_initmsg || baseDefaults.stase1.init_message || "Selamat siang Bidan.",
        triggers: Array.isArray(quest1.trigger) && quest1.trigger.length > 0
          ? quest1.trigger.map((t, idx): AiKeywordTrigger => ({
            id: t.casequestiatrigger_id ? String(t.casequestiatrigger_id) : `trg-1-${idx}`,
            konteks: t.casequestiatrigger_name || "",
            keyword: t.casequestiatrigger_key || "",
            skor: parseFloat(String(t.casequestiatrigger_score || 0)) || 10,
            jawaban_cadangan: t.casequestiatrigger_response || "",
          }))
          : baseDefaults.stase1.triggers,
      };
    }

    // Stase 2: Method 2 atau order 2
    const quest2 = sortedQuests.find((q) => q.casequest_order === 2 || q.casequest_method_id === 2);
    if (quest2) {
      const q2Seconds = typeof quest2.casequest_limit_time === "number" && quest2.casequest_limit_time > 0
        ? quest2.casequest_limit_time
        : 300;
      staseData.stase2 = {
        casequest_id: quest2.casequest_id,
        header: {
          nama_stase: quest2.casequest_name || baseDefaults.stase2.header.nama_stase,
          kode_amplop: (quest2 as any).casequest_envelope_code || baseDefaults.stase2.header.kode_amplop,
          durasi_detik: q2Seconds,
          durasi_menit: q2Seconds >= 60 ? Math.round(q2Seconds / 60) : 1,
          petunjuk_soal: baseDefaults.stase2.header.petunjuk_soal,
        },
        faktor_risiko: Array.isArray(quest2.mc) && quest2.mc.length > 0
          ? quest2.mc.map((m, idx): FaktorRisikoItem => ({
            id: m.casequestmc_id ? String(m.casequestmc_id) : `mc-${idx}`,
            nama_jawaban: m.casequestmc_name || "",
            syarat_id: m.casequestmc_required_id ? String(m.casequestmc_required_id) : "tanpa_syarat",
            skor: parseFloat(String(m.casequestmc_score || 0)) || 15,
          }))
          : baseDefaults.stase2.faktor_risiko,
      };
    }

    // Stase 3: Method 3 atau order 3
    const quest3 = sortedQuests.find((q) => q.casequest_order === 3 || q.casequest_method_id === 3);
    if (quest3) {
      const q3Seconds = typeof quest3.casequest_limit_time === "number" && quest3.casequest_limit_time > 0
        ? quest3.casequest_limit_time
        : 600;
      staseData.stase3 = {
        casequest_id: quest3.casequest_id,
        header: {
          nama_stase: quest3.casequest_name || baseDefaults.stase3.header.nama_stase,
          kode_amplop: (quest3 as any).casequest_envelope_code || baseDefaults.stase3.header.kode_amplop,
          durasi_detik: q3Seconds,
          durasi_menit: q3Seconds >= 60 ? Math.round(q3Seconds / 60) : 1,
          petunjuk_soal: baseDefaults.stase3.header.petunjuk_soal,
        },
        langkah_prosedur: Array.isArray(quest3.os) && quest3.os.length > 0
          ? quest3.os.map((o, idx): ProsedurStepItem => ({
            id: o.casequestos_id ? String(o.casequestos_id) : `os-${idx}`,
            nama_langkah: o.casequestos_name || "",
            order: o.casequestos_order || idx + 1,
            skor: parseFloat(String(o.casequestos_score || 0)) || 10,
          }))
          : baseDefaults.stase3.langkah_prosedur,
      };
    }

    // Stase 4: Method 4 atau order 4
    const quest4 = sortedQuests.find((q) => q.casequest_order === 4 || q.casequest_method_id === 4);
    if (quest4) {
      const q4Seconds = typeof quest4.casequest_limit_time === "number" && quest4.casequest_limit_time > 0
        ? quest4.casequest_limit_time
        : 300;
      const mappedImages: InterpretasiImageItem[] = Array.isArray(quest4.ci) && quest4.ci.length > 0
        ? quest4.ci.map((c, idx) => ({
          id: c.casequestci_id ? String(c.casequestci_id) : `ci-${idx}`,
          nama: c.casequestci_name || "",
          keterangan: c.casequestci_desc || "",
          url: buildStorageUrl(c.casequestci_image),
          raw_image: c.casequestci_image || "",
        }))
        : (baseDefaults.stase4.images as InterpretasiImageItem[]);

      const mappedOptions: InterpretasiOption[] = Array.isArray(quest4.ci_option) && quest4.ci_option.length > 0
        ? quest4.ci_option.map((o, idx) => {
          const scoreNum = parseFloat(String(o.casequestcioption_score || 0));
          return {
            id: o.casequestcioption_id ? String(o.casequestcioption_id) : `opt-${idx}`,
            label: o.casequestcioption_name || "",
            is_correct: scoreNum > 0,
            skor: scoreNum,
          };
        })
        : baseDefaults.stase4.pilihan_jawaban;

      staseData.stase4 = {
        casequest_id: quest4.casequest_id,
        header: {
          nama_stase: quest4.casequest_name || baseDefaults.stase4.header.nama_stase,
          kode_amplop: (quest4 as any).casequest_envelope_code || baseDefaults.stase4.header.kode_amplop,
          durasi_detik: q4Seconds,
          durasi_menit: q4Seconds >= 60 ? Math.round(q4Seconds / 60) : 1,
          petunjuk_soal: baseDefaults.stase4.header.petunjuk_soal,
        },
        images: mappedImages,
        pilihan_jawaban: mappedOptions,
      };
    }

    // Stase 5: Pos 5 / Method 1 kedua atau order 5
    const method1Quests = sortedQuests.filter((q) => q.casequest_method_id === 1);
    const quest5 = sortedQuests.find((q) => q.casequest_order === 5) || (method1Quests.length > 1 ? method1Quests[1] : undefined);
    if (quest5) {
      const q5Seconds = typeof quest5.casequest_limit_time === "number" && quest5.casequest_limit_time > 0
        ? quest5.casequest_limit_time
        : 300;
      staseData.stase5 = {
        casequest_id: quest5.casequest_id,
        header: {
          nama_stase: quest5.casequest_name || baseDefaults.stase5.header.nama_stase,
          kode_amplop: (quest5 as any).casequest_envelope_code || baseDefaults.stase5.header.kode_amplop,
          durasi_detik: q5Seconds,
          durasi_menit: q5Seconds >= 60 ? Math.round(q5Seconds / 60) : 1,
          petunjuk_soal: baseDefaults.stase5.header.petunjuk_soal,
        },
        ai_system_prompt: quest5.personality || baseDefaults.stase5.ai_system_prompt,
        init_message: quest5.casequestia_initmsg || baseDefaults.stase5.init_message || "Terima kasih atas penjelasannya Bu Bidan.",
        triggers: Array.isArray(quest5.trigger) && quest5.trigger.length > 0
          ? quest5.trigger.map((t, idx): AiKeywordTrigger => ({
            id: t.casequestiatrigger_id ? String(t.casequestiatrigger_id) : `trg-5-${idx}`,
            konteks: t.casequestiatrigger_name || "",
            keyword: t.casequestiatrigger_key || "",
            skor: parseFloat(String(t.casequestiatrigger_score || 0)) || 10,
            jawaban_cadangan: t.casequestiatrigger_response || "",
          }))
          : baseDefaults.stase5.triggers,
      };
    }

    // Perekam Nilai: Method 5 / order 6
    const quest6 = sortedQuests.find((q) => q.casequest_method_id === 5 || q.casequest_order === 6);
    if (quest6) {
      staseData.stase6 = {
        casequest_id: quest6.casequest_id,
      };
      hasPerekamNilai = Boolean(
        quest6.casequestrecord_is_active === 1 ||
        (quest6 as any).is_active === 1 ||
        (quest6 as any).record === 1
      );
    }
  }

  return {
    id: cleanId,
    nama,
    deskripsi,
    teks_perkenalan: teksPerkenalan,
    atribut,
    pasien_ids: pasienIds,
    patient_count: patientCount,
    pasien_count: patientCount,
    stase_data: staseData,
    has_perekam_nilai: hasPerekamNilai,
    created_at: detail.insert_timestamp ? detail.insert_timestamp.split("T")[0] : "2026-09-15",
  };
}

/**
 * Membangun payload FormData untuk endpoint POST /v1/data_case atau PUT /v1/data_case/:id
 * Sesuai format parameter backend Adonis yang telah diverifikasi.
 */
export function buildCaseFormData(
  kasus: Partial<Kasus>,
  options?: { forceZeroRequiredId?: boolean }
): FormData {
  const fd = new FormData();

  // 1. Identitas Dasar
  fd.append("name", kasus.nama?.trim() || "Kasus Tanpa Nama");
  fd.append("desc", kasus.deskripsi?.trim() || "-");
  fd.append("introduction", kasus.teks_perkenalan?.trim() || "-");

  // 2. Atribut Kasus
  const rawAttrs = kasus.atribut || [];
  const validAttrs = rawAttrs.filter((a) => a.key?.trim() || a.value?.trim());
  validAttrs.forEach((attr, i) => {
    fd.append(`attribute[${i}][name]`, attr.key?.trim() || "-");
    fd.append(`attribute[${i}][value]`, attr.value?.trim() || "-");
  });

  // 3. Pasien Terkait
  const pasienIds = kasus.pasien_ids || [];
  pasienIds.forEach((pId, j) => {
    const numericId = extractNumericPatientId(pId);
    fd.append(`patient[${j}][patient_id]`, String(numericId));
  });

  // 4. Stase Ujian (Pos 1 - 5)
  const stase = kasus.stase_data || createDefaultStaseSoalData();

  // --- Pos 1: Anamnesis (method_id: 1) ---
  fd.append("quest[0][name]", stase.stase1.header.nama_stase || "Pos 1: Anamnesis Pasien");
  fd.append("quest[0][method_id]", "1");
  fd.append("quest[0][limit_time]", String((stase.stase1.header.durasi_menit || 5) * 60));
  fd.append("quest[0][order]", "1");
  fd.append("quest[0][personality]", stase.stase1.ai_system_prompt || "-");
  fd.append(
    "quest[0][initmsg]",
    stase.stase1.init_message ||
    stase.stase1.triggers[0]?.jawaban_cadangan ||
    "Selamat siang Bidan."
  );
  stase.stase1.triggers.forEach((trg, tIdx) => {
    fd.append(`quest[0][trigger][${tIdx}][name]`, trg.konteks || `Trigger ${tIdx + 1}`);
    fd.append(`quest[0][trigger][${tIdx}][key]`, trg.keyword || "-");
    fd.append(`quest[0][trigger][${tIdx}][response]`, trg.jawaban_cadangan || "-");
    fd.append(`quest[0][trigger][${tIdx}][score]`, String(trg.skor || 10));
  });

  // --- Pos 2: Faktor Risiko (method_id: 2) ---
  fd.append("quest[1][name]", stase.stase2.header.nama_stase || "Pos 2: Deteksi Faktor Risiko");
  fd.append("quest[1][method_id]", "2");
  fd.append("quest[1][limit_time]", String((stase.stase2.header.durasi_menit || 5) * 60));
  fd.append("quest[1][order]", "2");
  stase.stase2.faktor_risiko.forEach((item, mIdx) => {
    fd.append(`quest[1][mc][${mIdx}][name]`, item.nama_jawaban || "-");
    fd.append(`quest[1][mc][${mIdx}][score]`, String(item.skor || 0));
    const isZero =
      Boolean(options?.forceZeroRequiredId) ||
      !item.syarat_id ||
      item.syarat_id === "tanpa_syarat" ||
      item.syarat_id === "0";
    const reqId = isZero ? "0" : extractNumericCaseId(item.syarat_id);
    fd.append(`quest[1][mc][${mIdx}][required_id]`, reqId || "0");
  });

  // --- Pos 3: Prosedur IVA (method_id: 3) ---
  fd.append("quest[2][name]", stase.stase3.header.nama_stase || "Pos 3: Prosedur IVA");
  fd.append("quest[2][method_id]", "3");
  fd.append("quest[2][limit_time]", String((stase.stase3.header.durasi_menit || 5) * 60));
  fd.append("quest[2][order]", "3");
  stase.stase3.langkah_prosedur.forEach((step, sIdx) => {
    fd.append(`quest[2][os][${sIdx}][name]`, step.nama_langkah || "-");
    fd.append(`quest[2][os][${sIdx}][order]`, String(step.order || sIdx + 1));
    fd.append(`quest[2][os][${sIdx}][score]`, String(step.skor || 10));
  });

  // --- Pos 4: Interpretasi Visual (method_id: 4) ---
  fd.append("quest[3][name]", stase.stase4.header.nama_stase || "Pos 4: Interpretasi Visual");
  fd.append("quest[3][method_id]", "4");
  fd.append("quest[3][limit_time]", String((stase.stase4.header.durasi_menit || 5) * 60));
  fd.append("quest[3][order]", "4");
  stase.stase4.images.forEach((img, iIdx) => {
    const isObj = typeof img === "object" && img !== null;
    const imgName = isObj ? (img as InterpretasiImageItem).nama || `Gambar ${iIdx + 1}` : `Gambar ${iIdx + 1}`;
    const imgDesc = isObj ? (img as InterpretasiImageItem).keterangan || "-" : "-";
    fd.append(`quest[3][ci][${iIdx}][name]`, imgName);
    fd.append(`quest[3][ci][${iIdx}][desc]`, imgDesc);

    // Lampirkan file foto ke quest[3][ci][iIdx][image]
    if (isObj && (img as InterpretasiImageItem).file instanceof File) {
      fd.append(`quest[3][ci][${iIdx}][image]`, (img as InterpretasiImageItem).file!);
    } else if (isObj && (img as InterpretasiImageItem).url?.startsWith("data:")) {
      const file = dataUrlToFile((img as InterpretasiImageItem).url, `${imgName || `image-${iIdx + 1}`}.png`);
      if (file) {
        fd.append(`quest[3][ci][${iIdx}][image]`, file);
      }
    } else if (typeof img === "string" && img.startsWith("data:")) {
      const file = dataUrlToFile(img, `image-${iIdx + 1}.png`);
      if (file) {
        fd.append(`quest[3][ci][${iIdx}][image]`, file);
      }
    }
  });
  stase.stase4.pilihan_jawaban.forEach((opt, oIdx) => {
    const letters = ["A", "B", "C", "D", "E", "F"];
    const code = letters[oIdx] || String(oIdx + 1);
    fd.append(`quest[3][ci_option][${oIdx}][code]`, code);
    fd.append(`quest[3][ci_option][${oIdx}][name]`, opt.label || "-");
    fd.append(`quest[3][ci_option][${oIdx}][score]`, String(opt.is_correct ? (opt.skor || 25) : 0));
  });

  // --- Pos 5: Asuhan Kebidanan & Konseling (method_id: 1) ---
  fd.append("quest[4][name]", stase.stase5.header.nama_stase || "Pos 5: Asuhan Kebidanan & Konseling Interaktif");
  fd.append("quest[4][method_id]", "1");
  fd.append("quest[4][limit_time]", String((stase.stase5.header.durasi_menit || 5) * 60));
  fd.append("quest[4][order]", "5");
  fd.append("quest[4][personality]", stase.stase5.ai_system_prompt || "-");
  fd.append(
    "quest[4][initmsg]",
    stase.stase5.init_message ||
    stase.stase5.triggers[0]?.jawaban_cadangan ||
    "Terima kasih atas penjelasannya Bu Bidan."
  );
  stase.stase5.triggers.forEach((trg, tIdx) => {
    fd.append(`quest[4][trigger][${tIdx}][name]`, trg.konteks || `Trigger ${tIdx + 1}`);
    fd.append(`quest[4][trigger][${tIdx}][key]`, trg.keyword || "-");
    fd.append(`quest[4][trigger][${tIdx}][response]`, trg.jawaban_cadangan || "-");
    fd.append(`quest[4][trigger][${tIdx}][score]`, String(trg.skor || 10));
  });

  // --- Pos 6: Perekam Nilai (method_id: 5) ---
  if (kasus.has_perekam_nilai) {
    fd.append("quest[5][name]", "Pos 6: Record Peserta");
    fd.append("quest[5][method_id]", "5");
    fd.append("quest[5][limit_time]", "300");
    fd.append("quest[5][order]", "6");
    fd.append("quest[5][is_active]", "1");
  }

  return fd;
}
