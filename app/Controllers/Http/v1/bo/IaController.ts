import Database from '@ioc:Adonis/Lucid/Database'
import moment from 'moment'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import GeminiService from 'App/Services/ai/GeminiService'

const General = new GeneralRepository()
const geminiService = new GeminiService()

// =========================================================================
// Konstanta Guardrails & Pesan Fallback Sesuai Dokumentasi
// =========================================================================

export const DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE =
    'Aduh, maaf ya Bu Bidan... saya agak bingung, sepertinya hal itu tidak terlalu berhubungan dengan keluhan keputihan dan kesehatan saya saat ini.'

export const DEFAULT_ASUHAN_OUT_OF_SCOPE_FALLBACK_MESSAGE =
    'Maaf Bu Bidan, saya kurang mengerti... Saya sedang cemas dengan hasil IVA saya, bagaimana hasil dan tindak lanjutnya ya Bu?'

export const DEFAULT_ASUHAN_WRONG_ANSWER_FALLBACK_MESSAGE =
    'Ya Allah... Benar separah itu Bu Bidan? Tolong jangan menakuti saya, apa benar tidak ada harapan pengobatan lagi?'

// Regex Guardrail Vonis Malpraktik / Menakuti Pasien di Pos 5
const MALPRACTICE_REGEX =
    /pasti kanker|stadium akhir|stadium 4|stadium iv|tidak ada harapan|tidak bisa diobati|cuma doa|tidak perlu rujukan|tidak usah dirujuk|vonis mati|langsung operasi angkat rahim/i

// =========================================================================
// Interface Data
// =========================================================================

export interface AiKeywordTrigger {
    id: string
    konteks: string
    keyword: string
    skor: number
    jawaban_cadangan: string
}

export interface PatientAiResponse {
    replyText: string
    answer: string
    matchedCategory?: string
    matched_category?: string
    source: 'gemini-api' | 'rule-trigger-fallback'
    matched_trigger_id?: string | null
    score?: number
    is_malpractice?: boolean
    stase?: number
}

// =========================================================================
// Master Triggers Kasus Ny. Ani (Kasus A) Sesuai Panduan Dokumentasi
// =========================================================================

const MASTER_ANAMNESIS_TRIGGERS: AiKeywordTrigger[] = [
    {
        id: 'trg-anm-case_a-1',
        konteks: 'Anamnesis Kategori 1: Riwayat keluhan',
        keyword: 'keluhan, keluhannya apa, kenapa datang, keputihan, berbau, cairan, gatal, ada apa, sakit apa, alasan datang, apa yang dirasakan, keluhan utama, bercak darah, darah setelah berhubungan',
        skor: 10,
        jawaban_cadangan: 'Sudah 3 bulan ini saya keputihan, jumlahnya lebih banyak, berbau, warnanya kekuningan, kadang bercampur darah, dan beberapa kali keluar darah setelah berhubungan suami istri.',
    },
    {
        id: 'trg-anm-case_a-2',
        konteks: 'Anamnesis Kategori 2: Riwayat menstruasi',
        keyword: 'haid, menstruasi, hpht, siklus haid, teratur, mens, datang bulan, haid terakhir, darah haid, ganti pembalut, berapa hari, menstruasi teratur',
        skor: 10,
        jawaban_cadangan: 'Terakhir haid sekitar 2 minggu lalu Bu Bidan. Siklus saya teratur 28 hari, biasanya lamanya sekitar 7 hari.',
    },
    {
        id: 'trg-anm-case_a-3',
        konteks: 'Anamnesis Kategori 3: Riwayat perkawinan / status pernikahan',
        keyword: 'nikah, menikah, perkawinan, suami, berapa kali menikah, usia menikah, pernikahan, kawin, usia berapa menikah, pertama menikah',
        skor: 10,
        jawaban_cadangan: 'Saya menikah usia 18 tahun bu Bidan, dan ini pernikahan pertama saya, sudah menikah selama 27 tahun.',
    },
    {
        id: 'trg-anm-case_a-4',
        konteks: 'Anamnesis Kategori 4: Riwayat hubungan seksual / senggama',
        keyword: 'hubungan seksual, senggama, bersetubuh, berhubungan intim, berdarah saat berhubungan, nyeri saat berhubungan, perdarahan kontak, sakit saat bersetubuh, kontak seksual, darah setelah berhubungan',
        skor: 10,
        jawaban_cadangan: 'Iya Bu Bidan, akhir-akhir ini beberapa kali keluar flek darah setelah berhubungan badan sama suami.',
    },
    {
        id: 'trg-anm-case_a-5',
        konteks: 'Anamnesis Kategori 5: Riwayat obstetri/paritas (G5P4A0)',
        keyword: 'hamil, melahirkan, anak, paritas, persalinan, keguguran, gpa, gravida, berapa anak, berapa kali melahirkan, pernah keguguran, riwayat persalinan, p4a0, g5p4a0, anak berapa, lahir normal',
        skor: 10,
        jawaban_cadangan: 'Sudah bu, anak saya ada empat dan semuanya lahir normal di bidan. Alhamdulillah saya tidak pernah mengalami keguguran.',
    },
    {
        id: 'trg-anm-case_a-6',
        konteks: 'Anamnesis Kategori 6: Riwayat penggunaan kontrasepsi / KB',
        keyword: 'kb, kontrasepsi, spiral, iud, pil kb, suntik kb, pasang kb, alat kontrasepsi, pasang spiral, implan, susuk, pasang iud',
        skor: 10,
        jawaban_cadangan: 'Saya pakai KB spiral IUD sudah sekitar 8 tahun Bu, dan jujur belum pernah kontrol lagi sejak dipasang.',
    },
    {
        id: 'trg-anm-case_a-7',
        konteks: 'Anamnesis Kategori 7: Riwayat penyakit medis & keluarga',
        keyword: 'riwayat penyakit, darah tinggi, hipertensi, gula, kencing manis, diabetes, jantung, asma, kanker di keluarga, keturunan, pms, penyakit kelamin, penyakit menular',
        skor: 10,
        jawaban_cadangan: 'Tidak ada riwayat penyakit darah tinggi, diabetes, ataupun penyakit menular lainnya Bu Bidan, keluarga saya juga tidak ada riwayat kanker.',
    },
    {
        id: 'trg-anm-case_a-8',
        konteks: 'Anamnesis Kategori 8: Riwayat skrining kanker serviks / tes IVA',
        keyword: 'pernah iva, tes iva, periksa iva, skrining, pap smear, papsmear, periksa leher rahim, papsmear sebelumnya, periksa kanker serviks, deteksi dini',
        skor: 10,
        jawaban_cadangan: 'Belum pernah sama sekali Bu Bidan, ini baru pertama kali saya mau diperiksa leher rahim atau IVA.',
    },
    {
        id: 'trg-anm-case_a-9',
        konteks: 'Anamnesis Kategori 9: Riwayat imunisasi / vaksinasi HPV',
        keyword: 'vaksin hpv, imunisasi hpv, suntik hpv, vaksin kanker serviks, vaksinasi serviks, suntik kanker, vaksinasi hpv',
        skor: 10,
        jawaban_cadangan: 'Belum pernah Bu, saya belum pernah dapat vaksinasi HPV atau kanker serviks.',
    },
]

const MASTER_ASUHAN_TRIGGERS: AiKeywordTrigger[] = [
    {
        id: 'trg-ash-case_a-1',
        konteks: 'Asuhan Topik 1: Edukasi Hasil Pemeriksaan IVA Positif',
        keyword: 'hasil iva, iva positif, bukan vonis kanker, bukan vonis, lesi pra-kanker, pra-kanker, pra kanker, bercak putih, belum tentu kanker, acetowhite, perubahan sel, positif bukan kanker',
        skor: 10,
        jawaban_cadangan: 'Alhamdulillah ya Allah kalau belum tentu kanker... terima kasih banyak Bu Bidan penjelasannya. Saya jauh lebih tenang mendengarnya.',
    },
    {
        id: 'trg-ash-case_a-2',
        konteks: 'Asuhan Topik 2: Rencana Rujukan ke Dokter Spesialis (SpOG)',
        keyword: 'rujukan, rujuk, rumah sakit, spesialis, spog, dokter kandungan, pemeriksaan lanjutan, biopsi, kolposkopi, surat rujukan, ke rumah sakit, rujuk rs',
        skor: 10,
        jawaban_cadangan: 'Baik Bu Bidan, saya siap dan bersedia mengikuti rujukan ke dokter spesialis kandungan di rumah sakit demi kepastian pengobatan saya.',
    },
    {
        id: 'trg-ash-case_a-3',
        konteks: 'Asuhan Topik 3: Reassurance / Konseling Empatik Menenangkan Pasien',
        keyword: 'tenang, jangan panik, jangan cemas, kami dampingi, bisa disembuhkan, masih bisa dicegah, dukungan, berdoa, jangan takut, ibu tidak sendiri, tidak perlu cemas',
        skor: 10,
        jawaban_cadangan: 'Terima kasih banyak Bu Bidan atas dukungan dan ketenangannya, saya merasa sangat terbantu dan tidak merasa cemas lagi.',
    },
    {
        id: 'trg-ash-case_a-4',
        konteks: 'Asuhan Topik 4: Memastikan Pemahaman Pasien & Evaluasi Konseling',
        keyword: 'apakah ibu paham, ada yang ingin ditanyakan, sudah jelas, mengerti, ada pertanyaan, bagaimana perasaan ibu, apakah setuju, apakah ibu bersedia, paham bu',
        skor: 10,
        jawaban_cadangan: 'Saya sudah paham sekali Bu Bidan, informasinya sangat jelas dan saya siap mengikuti anjuran Ibu.',
    },
]

export default class IaController {
    /**
     * GET /v1/ia?response_id=xxx
     * Menampilkan riwayat percakapan berdasarkan response_id.
     */
    public async index({ request, response }) {
        const responseId = request.input('response_id')

        if (!responseId) {
            return response.send({
                status: true,
                message: 'Larasati AI Service is active',
                usage: {
                    endpoint: 'POST /v1/ia or POST /v1/ia/ask',
                    payload: {
                        response_id: 'string | number (required) - ID response dari trx_response',
                        message: 'string (required) - Pertanyaan dari bidan / peserta',
                        casequest_id: 'number (optional) - ID case quest jika tersedia',
                        pos: 'number (optional) - Pos 1 (Anamnesis) atau Pos 5 (Asuhan)',
                    },
                },
            })
        }

        try {
            // 1. Ambil data response, pasien, dan kasus berdasarkan response_id
            const trxResponse = await Database.query()
                .select([
                    'a.response_id',
                    'a.response_case_id',
                    'a.response_patient_id',
                    'p.patient_id',
                    'p.patient_name',
                    'p.patient_gender',
                    'p.patient_birthdate',
                    'p.patient_avatar_id',
                    'c.case_name',
                ])
                .from('trx_response as a')
                .leftJoin('data_patient as p', 'p.patient_id', 'a.response_patient_id')
                .leftJoin('data_case as c', 'c.case_id', 'a.response_case_id')
                .where('a.response_id', responseId)
                .first()

            if (!trxResponse) {
                return response.status(404).send({
                    status: false,
                    message: `Data response dengan response_id ${responseId} tidak ditemukan.`,
                })
            }

            // 2. Olah data pasien
            const age = this.calculateAge(trxResponse.patient_birthdate)
            const genderInfo = this.formatGender(trxResponse.patient_gender)

            // 3. Ambil semua riwayat percakapan berdasarkan response_id, urut dari yang terlama
            const chatHistory = await Database.query()
                .select([
                    'responseia_id',
                    'responseia_sender',
                    'responseia_text',
                    'responseia_casequest_id',
                    'insert_timestamp',
                ])
                .from('trx_response_ia')
                .where('responseia_response_id', responseId)
                .orderBy('responseia_id', 'asc')

            // 4. Format percakapan: sender 1 adalah Pasien (AI), sender 2 adalah Bidan (Peserta)
            const patientLabel = trxResponse.patient_name
                ? `${genderInfo.honorific}. ${trxResponse.patient_name}${age !== null ? ` (${age} tahun)` : ''}`
                : 'Pasien'

            const conversation = chatHistory.map((chat) => {
                const isPatient = chat.responseia_sender === 1
                const sender = isPatient ? patientLabel : 'Anda (Bidan)'
                return {
                    responseia_id: chat.responseia_id,
                    sender: sender,
                    sender_type: isPatient ? 'patient' : 'bidan',
                    message: chat.responseia_text,
                    casequest_id: chat.responseia_casequest_id,
                    insert_timestamp: chat.insert_timestamp,
                    display: `${sender}: ${chat.responseia_text}`,
                }
            })

            return response.send({
                status: true,
                message: 'Berhasil mengambil riwayat percakapan',
                data: {
                    response_id: trxResponse.response_id,
                    patient: {
                        patient_id: trxResponse.patient_id,
                        patient_name: trxResponse.patient_name,
                        patient_gender: trxResponse.patient_gender,
                        patient_gender_text: genderInfo.label,
                        patient_honorific: genderInfo.honorific,
                        patient_age: age,
                        patient_label: patientLabel,
                        patient_avatar_id: trxResponse.patient_avatar_id || null,
                    },
                    case_name: trxResponse.case_name || null,
                    total_messages: conversation.length,
                    conversation: conversation,
                },
            })
        } catch (error: any) {
            return response.badRequest({
                status: false,
                message: error.message || 'Gagal mengambil riwayat percakapan',
            })
        }
    }

    /**
     * POST /v1/ia or POST /v1/ia/ask
     * Implementasi Dual-Layer Architecture Sesuai DOKUMENTASI_INTERAKSI_AI_GEMINI_SIMLI.md:
     * 1. Layer 2: Normalisasi pesan, evaluasi keyword trigger lokal & cek guardrail malpraktik.
     * 2. Layer 1: Injeksi Dynamic Clinical Brief (System Prompt Pos 1 / Pos 5) & Query Gemini AI.
     * 3. Safety Net Fallback: Jika offline / error / timeout (>3,5 detik), kembalikan jawaban cadangan deterministik.
     * 4. Simpan riwayat interaksi dan kembalikan struktur objek PatientAiResponse.
     */
    public async store({ request, response }) {
        const body = request.body() || {}
        const responseId = body.response_id || request.input('response_id')
        let casequestId = body.casequest_id || request.input('casequest_id') || body.responseia_casequest_id
        const rawMessage =
            body.message ||
            body.question ||
            body.prompt ||
            body.pertanyaan ||
            request.input('message') ||
            request.input('question') ||
            request.input('prompt') ||
            request.input('pertanyaan')

        if (!responseId) {
            return response.badRequest({
                status: false,
                message: 'Field response_id wajib diisi.',
            })
        }

        if (!rawMessage || typeof rawMessage !== 'string' || rawMessage.trim().length === 0) {
            return response.badRequest({
                status: false,
                message: 'Field message (pertanyaan) wajib diisi.',
            })
        }

        const messageText = rawMessage.trim()

        try {
            // -------------------------------------------------------------
            // 1. Ambil data response, case, dan patient berdasarkan response_id
            // -------------------------------------------------------------
            const trxResponse = await Database.query()
                .select([
                    'a.response_id',
                    'a.response_contest_id',
                    'a.response_contestteam_id',
                    'a.response_case_id',
                    'a.response_patient_id',
                    'p.patient_id',
                    'p.patient_name',
                    'p.patient_gender',
                    'p.patient_birthdate',
                    'p.patient_photo',
                    'p.patient_avatar_id',
                    'c.case_name',
                    'c.case_desc',
                    'c.case_introduction',
                ])
                .from('trx_response as a')
                .leftJoin('data_patient as p', 'p.patient_id', 'a.response_patient_id')
                .leftJoin('data_case as c', 'c.case_id', 'a.response_case_id')
                .where('a.response_id', responseId)
                .first()

            if (!trxResponse) {
                return response.status(404).send({
                    status: false,
                    message: `Data response dengan response_id ${responseId} tidak ditemukan.`,
                })
            }

            // Normalisasi data pasien
            let patient = {
                patient_id: trxResponse.patient_id || trxResponse.response_patient_id,
                patient_name: trxResponse.patient_name || 'Ny. Ani',
                patient_gender: trxResponse.patient_gender || 'P',
                patient_birthdate: trxResponse.patient_birthdate || '1980-12-31',
                patient_avatar_id: trxResponse.patient_avatar_id || null,
            }

            if (!patient.patient_name && patient.patient_id) {
                const pData = await Database.query()
                    .from('data_patient')
                    .where('patient_id', patient.patient_id)
                    .first()
                if (pData) {
                    patient.patient_name = pData.patient_name
                    patient.patient_gender = pData.patient_gender
                    patient.patient_birthdate = pData.patient_birthdate
                    patient.patient_avatar_id = pData.patient_avatar_id || null
                }
            }

            const age = this.calculateAge(patient.patient_birthdate) || 45
            const genderInfo = this.formatGender(patient.patient_gender)
            const birthdateFormatted = patient.patient_birthdate
                ? moment(patient.patient_birthdate).format('YYYY-MM-DD')
                : null

            // -------------------------------------------------------------
            // 2. Identifikasi Pos / Stase (Pos 1 Anamnesis vs Pos 5 Asuhan)
            // -------------------------------------------------------------
            let activeQuest: any = null
            if (casequestId) {
                activeQuest = await Database.query()
                    .from('data_case_quest')
                    .where('casequest_id', casequestId)
                    .first()
            } else if (trxResponse.response_case_id) {
                // Ambil quest pertama jika tidak dispesifikasikan
                activeQuest = await Database.query()
                    .from('data_case_quest')
                    .where('casequest_case_id', trxResponse.response_case_id)
                    .orderBy('casequest_order', 'asc')
                    .first()
                if (activeQuest) {
                    casequestId = activeQuest.casequest_id
                }
            }

            const requestedPos = body.pos ?? body.stase ?? request.input('pos') ?? request.input('stase')
            const isPos5 =
                Number(requestedPos) === 5 ||
                (activeQuest && (
                    Number(activeQuest.casequest_order) === 5 ||
                    Number(activeQuest.casequest_method_id) === 5 ||
                    String(activeQuest.casequest_name || '').toLowerCase().includes('asuhan') ||
                    String(activeQuest.casequest_name || '').toLowerCase().includes('konseling')
                ))

            const staseNumber = isPos5 ? 5 : 1

            // -------------------------------------------------------------
            // 3. Muat Data Triggers (Master Kasus + Database data_case_quest_ia)
            // -------------------------------------------------------------
            let triggers: AiKeywordTrigger[] = isPos5
                ? [...MASTER_ASUHAN_TRIGGERS]
                : [...MASTER_ANAMNESIS_TRIGGERS]

            let outOfScopeFallbackMessage = isPos5
                ? DEFAULT_ASUHAN_OUT_OF_SCOPE_FALLBACK_MESSAGE
                : DEFAULT_OUT_OF_SCOPE_FALLBACK_MESSAGE

            // Ambil data konfigurasi dari data_case_quest_ia jika tersedia
            try {
                let dbIaList: any[] = []
                if (casequestId) {
                    dbIaList = await Database.query()
                        .from('data_case_quest_ia')
                        .where('casequestia_casequest_id', casequestId)
                }

                if (dbIaList && dbIaList.length > 0) {
                    for (const row of dbIaList) {
                        if (row.casequestia_unknown && row.casequestia_unknown.trim()) {
                            outOfScopeFallbackMessage = row.casequestia_unknown.trim()
                        }
                        if (row.casequestia_answer && row.casequestia_answer.trim()) {
                            // Cek jika trigger DB ingin melengkapi atau menimpa trigger
                            const dbAnswer = row.casequestia_answer.trim()
                            const existingTrg = triggers.find((t) =>
                                t.keyword.toLowerCase().includes(dbAnswer.toLowerCase()) ||
                                dbAnswer.toLowerCase().includes(t.id)
                            )
                            if (existingTrg) {
                                if (row.casequestia_score_correct !== undefined && row.casequestia_score_correct !== null) {
                                    existingTrg.skor = Number(row.casequestia_score_correct)
                                }
                            } else {
                                triggers.push({
                                    id: `db-ia-${row.casequestia_id}`,
                                    konteks: `Kategori Khusus: ${dbAnswer}`,
                                    keyword: dbAnswer,
                                    skor: row.casequestia_score_correct ?? 10,
                                    jawaban_cadangan: row.casequestia_unknown || 'Baik Bu, saya mengerti.',
                                })
                            }
                        }
                    }
                }
            } catch (dbErr: any) {
                console.warn('[IaController] Warning reading data_case_quest_ia:', dbErr.message)
            }

            // -------------------------------------------------------------
            // 4. Layer 2: Local Keyword Matching Engine (Evaluasi Cepat)
            // -------------------------------------------------------------
            const normalizedMessage = this.normalizeText(messageText)
            let matchedTrigger: AiKeywordTrigger | null = null
            let isMalpractice = false

            // Pengecekan Guardrail Malpraktik di Pos 5
            if (isPos5 && MALPRACTICE_REGEX.test(normalizedMessage)) {
                isMalpractice = true
            }

            // Cari kecocokan keyword trigger
            if (!isMalpractice) {
                for (const trg of triggers) {
                    const keywords = trg.keyword
                        .split(/[,|]/)
                        .map((k) => this.normalizeText(k))
                        .filter(Boolean)

                    const isMatch = keywords.some((kw) => {
                        return normalizedMessage.includes(kw) || kw.includes(normalizedMessage)
                    })

                    if (isMatch) {
                        matchedTrigger = trg
                        break
                    }
                }

                // Jika belum cocok dan berada di Pos 1, cek pertanyaan umum keluhan
                if (!matchedTrigger && !isPos5) {
                    const complaintKeywords = ['keluhan', 'kenapa', 'alasan', 'sakit apa', 'ada apa', 'dirasakan', 'keluhannya']
                    const isGeneralComplaint = complaintKeywords.some((ck) => normalizedMessage.includes(ck))
                    if (isGeneralComplaint) {
                        matchedTrigger = triggers[0] // Trigger 1: Keluhan Utama
                    }
                }
            }

            // Tentukan matchedCategory dan skor
            let matchedCategory: string = 'Di Luar Konteks / Scope'
            let scoreValue = 0

            if (isMalpractice) {
                matchedCategory = 'Respon Kekeliruan Asuhan (Malpractice Guardrail)'
                scoreValue = 0
            } else if (matchedTrigger) {
                matchedCategory = matchedTrigger.konteks
                scoreValue = matchedTrigger.skor
            }

            // Simpan pertanyaan dari peserta ke tabel trx_response_ia (sender = 2: peserta/Bidan)
            const userChatId = await this.saveChatHistory(responseId, casequestId, 2, messageText)

            // Catat ke tabel trx_response_req
            const responseReqId = await this.saveResponseReq({
                responsereq_responseia_id: userChatId || null,
                responsereq_provide_id: 1,
                responsereq_prompt: messageText,
                responsereq_response: null,
                responsereq_answer_id: casequestId || null,
                responsereq_confidence: matchedTrigger ? 1.0 : 0.5,
            })

            // -------------------------------------------------------------
            // 5. Susun Dynamic Clinical Brief (System Prompt)
            // -------------------------------------------------------------
            const patientObstetri = 'G5P4A0 (multiparitas)'
            const patientDescription =
                trxResponse.case_desc ||
                'Pemeriksaan IVA dengan Hasil IVA Positif disertai Lesi Luas / Mencurigakan Keganasan'
            const mainComplaint =
                'Keputihan abnormal berbau dan keluar darah setelah berhubungan suami istri sejak 3 bulan yang lalu'

            let systemPrompt = ''
            if (isPos5) {
                systemPrompt = this.buildAsuhanSystemPrompt({
                    patientName: patient.patient_name,
                    patientAge: age,
                    patientDescription: patientDescription,
                    triggers: triggers,
                    asuhanWrongAnswerMessage: DEFAULT_ASUHAN_WRONG_ANSWER_FALLBACK_MESSAGE,
                    asuhanOutOfScopeMessage: outOfScopeFallbackMessage,
                    customInstruction: body.system_instruction || request.input('system_instruction'),
                })
            } else {
                systemPrompt = this.buildAnamnesisSystemPrompt({
                    patientName: patient.patient_name,
                    patientAge: age,
                    patientObstetri: patientObstetri,
                    patientDescription: patientDescription,
                    mainComplaint: mainComplaint,
                    triggers: triggers,
                    outOfScopeMessage: outOfScopeFallbackMessage,
                    customInstruction: body.system_instruction || request.input('system_instruction'),
                })
            }

            // -------------------------------------------------------------
            // 6. Layer 1: Query Gemini AI dengan Context Chat & Timeout
            // -------------------------------------------------------------
            let replyText = ''
            let source: 'gemini-api' | 'rule-trigger-fallback' = 'gemini-api'

            // Ambil riwayat percakapan terkini untuk konteks dialog LLM
            let contextPrompt = messageText
            try {
                const recentChats = await Database.query()
                    .from('trx_response_ia')
                    .where('responseia_response_id', responseId)
                    .orderBy('responseia_id', 'desc')
                    .limit(6)

                if (recentChats && recentChats.length > 1) {
                    const sortedHistory = recentChats.reverse().slice(0, -1) // Kecualikan pertanyaan yang baru diinsert
                    const formattedHistory = sortedHistory
                        .map((c) => (c.responseia_sender === 2 ? `Bidan: ${c.responseia_text}` : `Pasien: ${c.responseia_text}`))
                        .join('\n')

                    contextPrompt = `Riwayat percakapan sebelumnya:\n${formattedHistory}\n\nPertanyaan/pernyataan Bidan saat ini:\n${messageText}`
                }
            } catch (histErr) {
                console.warn('[IaController] Failed to fetch chat context:', histErr.message)
            }

            try {
                const aiResult = await geminiService.generatePatientAnswer({
                    prompt: contextPrompt,
                    systemInstruction: systemPrompt,
                    temperature: body.temperature ?? request.input('temperature') ?? 0.6,
                    maxOutputTokens: body.max_tokens ?? request.input('max_tokens') ?? 250,
                    topP: body.top_p ?? request.input('top_p') ?? 0.9,
                    timeout: 3500, // Timeout 3,5 detik sesuai panduan Simli
                    model: body.model ?? request.input('model'),
                })

                replyText = this.cleanReplyForTts(aiResult)
                const isAbrupt = !/[.!?…'"]\s*$/.test(replyText)
                if (!replyText || replyText.length < 20 || isAbrupt) {
                    throw new Error('Respons Gemini belum lengkap atau terpotong')
                }
                source = 'gemini-api'
            } catch (aiErr: any) {
                // ---------------------------------------------------------
                // 7. Safety Net Deterministik (Local Engine Fallback)
                // ---------------------------------------------------------
                console.warn(
                    `[IaController] Gemini fallback triggered (${aiErr.message}), activating local deterministic engine...`
                )
                source = 'rule-trigger-fallback'

                if (isPos5) {
                    if (isMalpractice) {
                        replyText = DEFAULT_ASUHAN_WRONG_ANSWER_FALLBACK_MESSAGE
                    } else if (matchedTrigger) {
                        replyText = matchedTrigger.jawaban_cadangan
                    } else {
                        replyText = DEFAULT_ASUHAN_OUT_OF_SCOPE_FALLBACK_MESSAGE
                    }
                } else {
                    if (matchedTrigger) {
                        replyText = matchedTrigger.jawaban_cadangan
                    } else {
                        replyText = outOfScopeFallbackMessage
                    }
                }
            }

            // Update catatan respons di trx_response_req
            await this.updateResponseReq(responseReqId, replyText)

            // Simpan jawaban pasien ke tabel trx_response_ia (sender = 1: pasien/AI)
            await this.saveChatHistory(responseId, casequestId, 1, replyText)

            // -------------------------------------------------------------
            // 8. Bentuk Payload Sesuai Kontrak PatientAiResponse
            // -------------------------------------------------------------
            const responseData: PatientAiResponse & Record<string, any> = {
                response_id: responseId,
                replyText: replyText,
                answer: replyText,
                matchedCategory: matchedCategory,
                matched_category: matchedCategory,
                source: source,
                matched_trigger_id: matchedTrigger ? matchedTrigger.id : null,
                score: scoreValue,
                casequestia_score_correct: scoreValue,
                is_malpractice: isMalpractice,
                stase: staseNumber,
                patient: {
                    patient_id: patient.patient_id,
                    patient_name: patient.patient_name,
                    patient_gender: patient.patient_gender,
                    patient_gender_text: genderInfo.label,
                    patient_honorific: genderInfo.honorific,
                    patient_birthdate: birthdateFormatted,
                    patient_age: age,
                    patient_avatar_id: patient.patient_avatar_id || null,
                },
                message: messageText,
                responsereq_id: responseReqId,
                casequestia_id: matchedTrigger ? matchedTrigger.id : null,
                matched_keyword: matchedTrigger ? matchedTrigger.keyword : null,
            }

            return response.send({
                status: true,
                message: 'Success',
                data: responseData,
            })
        } catch (error: any) {
            return response.badRequest({
                status: false,
                message: error.message || 'Gagal memproses pertanyaan',
            })
        }
    }

    /**
     * Alias method for asking question
     */
    public async ask(ctx) {
        return this.store(ctx)
    }

    // =========================================================================
    // Prompt Builders Sesuai DOKUMENTASI_INTERAKSI_AI_GEMINI_SIMLI.md
    // =========================================================================

    /**
     * Anatomi System Prompt Pos 1 (Anamnesis Pasien)
     * Menginjeksi 9 riwayat kesehatan & aturan lisan singkat (1-2 kalimat)
     */
    private buildAnamnesisSystemPrompt(params: {
        patientName: string
        patientAge: number
        patientObstetri: string
        patientDescription: string
        mainComplaint: string
        triggers: AiKeywordTrigger[]
        outOfScopeMessage: string
        customInstruction?: string
    }): string {
        const caseAttributes = `1. Riwayat keluhan: Keputihan abnormal berbau, gatal, dan keluar flek darah pasca senggama sejak 3 bulan terakhir.
2. Riwayat menstruasi: Terakhir haid 2 minggu lalu (HPHT), siklus teratur 28 hari, durasi 7 hari.
3. Riwayat perkawinan: Menikah pertama kali usia 18 tahun, lama menikah 27 tahun.
4. Riwayat hubungan seksual: Aktif secara seksual, mengalami perdarahan kontak pasca senggama.
5. Riwayat obstetri / paritas: G5P4A0 (hamil 5 kali, melahirkan 4 kali hidup normal di bidan, tidak pernah keguguran).
6. Riwayat kontrasepsi / KB: Menggunakan KB spiral (IUD) selama 8 tahun, belum pernah kontrol lagi.
7. Riwayat penyakit medis & keluarga: Tidak ada riwayat hipertensi, diabetes, penyakit menular, maupun riwayat kanker di keluarga.
8. Riwayat skrining kanker serviks / tes IVA: Belum pernah melakukan pemeriksaan IVA ataupun Pap Smear sebelumnya.
9. Riwayat vaksinasi HPV: Belum pernah mendapatkan imunisasi atau vaksin kanker serviks (HPV).`

        const formattedTriggers = params.triggers
            .map((trg, index) => {
                return `${index + 1}. [${trg.konteks}]
   - Kata Kunci / Pertanyaan: ${trg.keyword}
   - Fakta Medis Pasien: "${trg.jawaban_cadangan}"`
            })
            .join('\n')

        let prompt = `Kamu berperan sebagai PASIEN PEREMPUAN bernama ${params.patientName} (usia ${params.patientAge} tahun, status obstetri ${params.patientObstetri}) yang sedang datang ke Poli KIA Puskesmas untuk berkonsultasi dan diperiksa oleh seorang Mahasiswa Bidan.

DESKRIPSI KLINIS KASUS:
${params.patientDescription}

KELUHAN UTAMA & ALASAN KEDATANGAN:
${params.mainComplaint}

DATA LENGKAP 9 RIWAYAT KESEHATAN & ANAMNESIS KAMU:
${caseAttributes}

POIN-POIN JAWABAN DETIL SESUAI KATEGORI ANAMNESIS:
${formattedTriggers}

PANDUAN & ATURAN WAWANCARA:
1. Kamu adalah ${params.patientName} (pasien nyata). Berbicaralah SINGKAT dan PADAT dengan nada santun dalam 1-2 kalimat pendek bahasa Indonesia lisan (maksimal 20 kata / 120 karakter).
2. Jika Bidan bertanya tentang KELUHAN, GEJALA, atau ALASAN DATANG, jelaskan keluhan utama kamu secara jelas dan detail.
3. Jika Bidan menanyakan bagian mana pun dari 9 riwayat anamnesis, jawablah secara spesifik dan konsisten dengan data riwayat kesehatan kamu di atas.
4. JIKA BIDAN MENANYAKAN HAL DI LUAR KONTEKS, DI LUAR SCOPE RIWAYAT KESEHATAN, ATAU TOPIK YANG TIDAK BERHUBUNGAN: Jawablah dengan nada bingung dan sopan seperti: "${params.outOfScopeMessage}".
5. JANGAN keluar dari peran pasien. Jangan pernah menyebutkan bahwa kamu adalah AI atau model bahasa.`

        if (params.customInstruction && params.customInstruction.trim().length > 0) {
            prompt += `\n\nInstruksi Tambahan:\n${params.customInstruction.trim()}`
        }

        return prompt
    }

    /**
     * Anatomi System Prompt Pos 5 (Asuhan Kebidanan & Konseling)
     * Menginjeksi respon empati hasil IVA positif, klarifikasi bukan kanker, dan rencana rujukan SpOG
     */
    private buildAsuhanSystemPrompt(params: {
        patientName: string
        patientAge: number
        patientDescription: string
        triggers: AiKeywordTrigger[]
        asuhanWrongAnswerMessage: string
        asuhanOutOfScopeMessage: string
        customInstruction?: string
    }): string {
        const formattedTriggers = params.triggers
            .map((trg, index) => {
                return `${index + 1}. [${trg.konteks}]
   - Poin Asuhan Bidan: ${trg.keyword}
   - Respons Alami Pasien: "${trg.jawaban_cadangan}"`
            })
            .join('\n')

        let prompt = `Kamu berperan sebagai PASIEN PEREMPUAN bernama ${params.patientName} (usia ${params.patientAge} tahun) yang baru selesai diperiksa IVA di Pos 5 dan mendengarkan penjelasan hasil, konseling, serta asuhan dari Bidan.

KONDISI HASIL PEMERIKSAAN & RIWAYAT KASUS:
${params.patientDescription}

POIN-POIN ASUHAN & KONSELING YANG DIHARAPKAN (TOPIK RESMI ASUHAN):
${formattedTriggers}

ATURAN DAN PANDUAN WAJIB RESPONS PASIEN:
1. SANGAT PENTING: Jawablah dengan SINGKAT, PADAT, dan LISAN (Maksimal 1-2 kalimat pendek, di bawah 20 kata / 110 karakter). DILARANG menjawab panjang-lebar.
2. JIKA BIDAN MEMBERIKAN ASUHAN YANG BENAR (misal: menjelaskan IVA positif belum tentu kanker, perlunya kolaborasi SpOG, rencana rujukan, atau memastikan pemahaman):
   - Jawablah singkat dengan rasa lega, paham, dan siap mengikuti rencana rujukan ke rumah sakit.
3. JIKA BIDAN MEMBERIKAN PERNYATAAN SALAH / MENAKUTI / MENYESATKAN (misal: langsung memvonis pasti kanker stadium lanjut / susah diobati / menyuruh pasrah saja, atau bilang tidak perlu rujukan):
   - Jawablah singkat dengan reaksi kaget, takut, cemas, dan tanyakan kepastiannya ke Bidan: "${params.asuhanWrongAnswerMessage}"
4. JIKA PERNYATAAN / PERTANYAAN BIDAN BENAR-BENAR DI LUAR KONTEKS ASUHAN & HASIL PEMERIKSAAN IVA:
   - Jawablah singkat bahwa kamu tidak mengerti dan minta Bidan kembali fokus ke hasil pemeriksaan IVA: "${params.asuhanOutOfScopeMessage}"
5. JANGAN keluar dari peran pasien. Jangan pernah menyebutkan bahwa kamu adalah AI atau model bahasa.`

        if (params.customInstruction && params.customInstruction.trim().length > 0) {
            prompt += `\n\nInstruksi Tambahan:\n${params.customInstruction.trim()}`
        }

        return prompt
    }

    // =========================================================================
    // Helper Functions
    // =========================================================================

    /**
     * Normalisasi teks untuk evaluasi pencocokan keyword
     */
    private normalizeText(text: string): string {
        return (text || '')
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
    }

    /**
     * Membersihkan teks keluaran Gemini agar murni bahasa lisan untuk TTS Simli
     */
    private cleanReplyForTts(text: string): string {
        let clean = (text || '').trim()
        clean = clean.replace(/^(pasien|ny\.\s*ani|ibu\s*ani)\s*:\s*/i, '')
        clean = clean.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()
        return clean
    }

    /**
     * Simpan riwayat chat ke tabel trx_response_ia
     * @param sender 1: Pasien (AI / Sistem), 2: Bidan (Pertanyaan Peserta)
     */
    private async saveChatHistory(
        responseId: string | number,
        casequestId: string | number | null | undefined,
        sender: number,
        text: string
    ): Promise<number | string | null> {
        try {
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            const result = await Database.table('trx_response_ia').insert({
                responseia_response_id: responseId,
                responseia_casequest_id: casequestId || null,
                responseia_sender: sender,
                responseia_text: text,
                insert_timestamp: now,
            })
            const insertedId = Array.isArray(result) ? result[0] : result
            return insertedId || null
        } catch (err: any) {
            console.warn('[IaController] Failed to save chat to trx_response_ia:', err.message)
            return null
        }
    }

    /**
     * Simpan data request ke tabel trx_response_req sebelum memanggil Gemini AI
     */
    private async saveResponseReq(data: {
        responsereq_responseia_id?: string | number | null
        responsereq_provide_id?: string | number | null
        responsereq_prompt: string
        responsereq_response?: string | null
        responsereq_answer_id?: string | number | null
        responsereq_confidence?: string | number | null
    }): Promise<number | string | null> {
        try {
            const result = await Database.table('trx_response_req').insert({
                responsereq_responseia_id: data.responsereq_responseia_id || null,
                responsereq_provide_id: data.responsereq_provide_id || 1,
                responsereq_prompt: data.responsereq_prompt,
                responsereq_response: data.responsereq_response || null,
                responsereq_answer_id: data.responsereq_answer_id || null,
                responsereq_confidence: data.responsereq_confidence || null,
            })
            const insertedId = Array.isArray(result) ? result[0] : result
            return insertedId || null
        } catch (err: any) {
            console.warn('[IaController] Failed to insert into trx_response_req:', err.message)
            return null
        }
    }

    /**
     * Update response pada tabel trx_response_req setelah respon didapatkan
     */
    private async updateResponseReq(
        responseReqId: number | string | null,
        aiResponse: string
    ): Promise<void> {
        if (!responseReqId) return
        try {
            await Database.from('trx_response_req')
                .where('responsereq_id', responseReqId)
                .update({
                    responsereq_response: aiResponse,
                })
        } catch (err: any) {
            console.warn('[IaController] Failed to update response in trx_response_req:', err.message)
        }
    }

    /**
     * Hitung umur berdasarkan tanggal lahir (patient_birthdate)
     */
    private calculateAge(dateString?: string | Date | null): number | null {
        if (!dateString) return null
        const birthDate = moment(dateString)
        if (!birthDate.isValid()) return null
        return moment().diff(birthDate, 'years')
    }

    /**
     * Format jenis kelamin (patient_gender) menjadi teks dan panggilan
     */
    private formatGender(gender?: string | null): { label: string; honorific: string } {
        const g = (gender || '').toUpperCase().trim()
        if (g === 'L' || g === 'M') {
            return { label: 'Laki-laki', honorific: 'Tuan' }
        }
        if (g === 'P' || g === 'F' || g === 'W') {
            return { label: 'Perempuan', honorific: 'Nyonya' }
        }
        return { label: gender || 'Tidak diketahui', honorific: 'Ibu' }
    }
}