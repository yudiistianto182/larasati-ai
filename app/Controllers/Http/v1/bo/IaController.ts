import Database from '@ioc:Adonis/Lucid/Database'
import moment from 'moment'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import GeminiService from 'App/Services/ai/GeminiService'

const General = new GeneralRepository()
const geminiService = new GeminiService()

export default class IaController {
    /**
     * GET /v1/ia?response_id=xxx
     * Menampilkan riwayat percakapan berdasarkan response_id.
     * Jika response_id tidak diberikan, tampilkan info endpoint.
     */
    public async index({ request, response }) {
        const responseId = request.input('response_id')

        // Jika tidak ada response_id, tampilkan info endpoint
        if (!responseId) {
            return response.send({
                status: true,
                message: 'Larasati AI Service is active',
                usage: {
                    endpoint: 'POST /v1/ia or POST /v1/ia/ask',
                    payload: {
                        response_id: 'string | number (required) - ID response dari trx_response',
                        message: 'string (required) - Pertanyaan dari dokter / user',
                        casequest_id: 'number (optional) - ID case quest jika tersedia',
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

            // 4. Format percakapan ke dalam array yang mudah dibaca
            const patientLabel = trxResponse.patient_name
                ? `${genderInfo.honorific}. ${trxResponse.patient_name}${age !== null ? ` (${age} tahun)` : ''}`
                : 'Pasien'

            const conversation = chatHistory.map((chat) => {
                const isPatient = chat.responseia_sender === 2
                const sender = isPatient ? patientLabel : 'Anda (Bidan)'
                return {
                    responseia_id: chat.responseia_id,
                    sender: sender,
                    sender_type: isPatient ? 'patient' : 'bidan',
                    message: chat.responseia_text,
                    casequest_id: chat.responseia_casequest_id,
                    insert_timestamp: chat.insert_timestamp,
                    // Format teks tampilan: "Pengirim pesan"
                    display: `${sender} ${chat.responseia_text}`,
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
     * Postdata: { response_id: "1", message: "pertanyaan" }
     * 1. Mendapatkan patient_id, nama, gender, dan birthdate dari response_id (join trx_response & data_patient).
     * 2. Menyimpan pertanyaan dari peserta ke trx_response_ia (responseia_sender = 2).
     * 3. Mencocokkan keyword pertanyaan dengan tabel data_case_quest_ia (column casequestia_answer).
     * 4. Jika cocok, kembalikan value dari column casequestia_score_correct & simpan response ke trx_response_ia (responseia_sender = 1).
     * 5. Jika tidak cocok, teruskan prompt dan context pasien ke API Gemini AI, kembalikan respon & simpan ke trx_response_ia (responseia_sender = 1).
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
            // 1. Ambil data response, case, dan patient berdasarkan response_id
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
                    'c.case_name',
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

            // Jika patient_id belum ter-join dengan data_patient, lakukan query terpisah
            let patient = {
                patient_id: trxResponse.patient_id || trxResponse.response_patient_id,
                patient_name: trxResponse.patient_name,
                patient_gender: trxResponse.patient_gender,
                patient_birthdate: trxResponse.patient_birthdate,
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
                }
            }

            // 2. Olah data pasien (usia dan format jenis kelamin)
            const age = this.calculateAge(patient.patient_birthdate)
            const genderInfo = this.formatGender(patient.patient_gender)
            const birthdateFormatted = patient.patient_birthdate
                ? moment(patient.patient_birthdate).format('YYYY-MM-DD')
                : null

            // 3. Mencocokkan keyword pertanyaan dengan tabel data_case_quest_ia (column casequestia_answer)
            let matchedQuestIa: any = null
            try {
                let questIaList: any[] = []

                if (trxResponse.response_case_id) {
                    try {
                        questIaList = await Database.query()
                            .from('data_case_quest_ia as ia')
                            .leftJoin('data_case_quest as dq', 'dq.casequest_id', 'ia.casequestia_casequest_id')
                            .where('dq.casequest_case_id', trxResponse.response_case_id)
                            .select('ia.*')
                    } catch (joinErr) {
                        console.warn('[IaController] Join query failed, fallback to direct query:', joinErr.message)
                    }
                }

                // Fallback: Jika tidak ada data dari filter case, ambil langsung dari tabel data_case_quest_ia
                if (!questIaList || questIaList.length === 0) {
                    questIaList = await Database.query().from('data_case_quest_ia').select('*')
                }

                if (questIaList && questIaList.length > 0) {
                    const normalizedMessage = messageText.toLowerCase()

                    // Cari kecocokan keyword pada column casequestia_answer
                    for (const item of questIaList) {
                        const answerKeyword = (item.casequestia_answer || '').trim()
                        if (!answerKeyword) continue

                        const normalizedAnswer = answerKeyword.toLowerCase()

                        // 1. Cek kecocokan langsung atau substring
                        if (
                            normalizedMessage.includes(normalizedAnswer) ||
                            normalizedAnswer.includes(normalizedMessage)
                        ) {
                            matchedQuestIa = item
                            break
                        }

                        // 2. Cek kecocokan jika keyword dipisahkan koma / garis miring / titik koma / baris baru
                        const keywords = answerKeyword
                            .split(/[,;/|\n]+/)
                            .map((k: string) => k.trim().toLowerCase())
                            .filter(Boolean)

                        const isMatch = keywords.some(
                            (kw: string) => normalizedMessage.includes(kw) || kw.includes(normalizedMessage)
                        )
                        if (isMatch) {
                            matchedQuestIa = item
                            break
                        }
                    }
                }
            } catch (err) {
                // Log warning jika query data_case_quest_ia error
                console.warn('[IaController] Warning when querying data_case_quest_ia:', err.message)
            }

            // Dapatkan casequest_id yang paling relevan
            if (!casequestId && matchedQuestIa?.casequestia_casequest_id) {
                casequestId = matchedQuestIa.casequestia_casequest_id
            }

            if (!casequestId && trxResponse.response_case_id) {
                try {
                    const defaultQuest = await Database.query()
                        .from('data_case_quest')
                        .where('casequest_case_id', trxResponse.response_case_id)
                        .first()
                    if (defaultQuest) {
                        casequestId = defaultQuest.casequest_id
                    }
                } catch (_) { }
            }

            // Simpan pertanyaan dari peserta ke tabel trx_response_ia (sender = 2: peserta)
            const userChatId = await this.saveChatHistory(responseId, casequestId, 2, messageText)

            // 4. Jika keyword ditemukan pada data_case_quest_ia, langsung kembalikan value dari casequestia_score_correct
            if (matchedQuestIa) {
                const scoreValue =
                    matchedQuestIa.casequestia_score_correct !== undefined &&
                        matchedQuestIa.casequestia_score_correct !== null
                        ? matchedQuestIa.casequestia_score_correct
                        : matchedQuestIa.casequestia_scorer ?? 0

                // Simpan jawaban ke tabel trx_response_ia (sender = 1: response AI / sistem)
                await this.saveChatHistory(responseId, casequestId, 1, String(scoreValue))

                return response.send({
                    status: true,
                    message: 'Success',
                    data: {
                        response_id: responseId,
                        patient: {
                            patient_id: patient.patient_id,
                            patient_name: patient.patient_name,
                            patient_gender: patient.patient_gender,
                            patient_gender_text: genderInfo.label,
                            patient_honorific: genderInfo.honorific,
                            patient_birthdate: birthdateFormatted,
                            patient_age: age,
                        },
                        message: messageText,
                        answer: scoreValue,
                        casequestia_score_correct: scoreValue,
                        source: 'casequestia_score_correct',
                        matched_keyword: matchedQuestIa.casequestia_answer,
                        casequestia_id: matchedQuestIa.casequestia_id,
                    },
                })
            }

            // 5. Jika tidak ada kecocokan keyword di database, teruskan ke Gemini AI API
            // Ambil atribut klinis tambahan jika tersedia
            let attributes: any[] = []
            if (patient.patient_id) {
                attributes = await Database.query()
                    .select(['patientattribute_name', 'patientattribute_value'])
                    .from('data_patient_attribute')
                    .where('patientattribute_patient_id', patient.patient_id)
            }

            const systemInstruction = this.buildPatientSystemInstruction(
                {
                    ...patient,
                    age,
                    genderText: genderInfo.label,
                    honorific: genderInfo.honorific,
                    birthdateFormatted,
                    case_introduction: trxResponse.case_introduction,
                },
                attributes,
                body.system_instruction || request.input('system_instruction')
            )

            // Insert ke tabel trx_response_req sebelum melakukan request ke Gemini
            const provideId =
                body.responsereq_provide_id ||
                body.provide_id ||
                request.input('provide_id') ||
                1

            const responseReqId = await this.saveResponseReq({
                responsereq_responseia_id:
                    body.responsereq_responseia_id ||
                    body.responseia_id ||
                    userChatId ||
                    null,
                responsereq_provide_id: provideId,
                responsereq_prompt: body.responsereq_prompt || messageText,
                responsereq_response: body.responsereq_response || null,
                responsereq_answer_id:
                    body.responsereq_answer_id ||
                    body.answer_id ||
                    casequestId ||
                    null,
                responsereq_confidence:
                    body.responsereq_confidence ||
                    body.confidence ||
                    null,
            })

            const aiAnswer = await geminiService.generateContent({
                prompt: messageText,
                systemInstruction: systemInstruction,
                temperature: body.temperature ?? request.input('temperature') ?? 0.3,
                maxOutputTokens: body.max_tokens ?? request.input('max_tokens') ?? 500,
                model: body.model ?? request.input('model'),
            })

            // Update responsereq_response di trx_response_req setelah response didapatkan
            await this.updateResponseReq(responseReqId, aiAnswer)

            // Simpan jawaban AI ke tabel trx_response_ia (sender = 1: response AI)
            await this.saveChatHistory(responseId, casequestId, 1, aiAnswer)

            return response.send({
                status: true,
                message: 'Success',
                data: {
                    response_id: responseId,
                    patient: {
                        patient_id: patient.patient_id,
                        patient_name: patient.patient_name,
                        patient_gender: patient.patient_gender,
                        patient_gender_text: genderInfo.label,
                        patient_honorific: genderInfo.honorific,
                        patient_birthdate: birthdateFormatted,
                        patient_age: age,
                        attributes: attributes.map((item) => ({
                            name: item.patientattribute_name,
                            value: item.patientattribute_value,
                        })),
                    },
                    message: messageText,
                    answer: aiAnswer,
                    source: 'gemini_ai',
                    responsereq_id: responseReqId,
                },
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

    /**
     * Simpan riwayat chat ke tabel trx_response_ia
     * @param responseId ID response pada trx_response
     * @param casequestId ID casequest pada data_case_quest
     * @param sender 1: Response AI, 2: Pertanyaan Peserta
     * @param text Teks pertanyaan atau jawaban
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
     * Update response pada tabel trx_response_req setelah respon dari Gemini didapatkan
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
            return { label: 'Perempuan', honorific: 'Nyonya/Nona' }
        }
        return { label: gender || 'Tidak diketahui', honorific: 'Bapak/Ibu' }
    }

    /**
     * Menyusun System Instruction / Persona Pasien untuk Gemini AI
     */
    private buildPatientSystemInstruction(
        patient: any,
        attributes: any[],
        customInstruction?: string
    ): string {
        let attributeDetails = ''
        if (attributes && attributes.length > 0) {
            attributeDetails =
                '\nInformasi / Keluhan Klinis Pasien:\n' +
                attributes.map((a) => `- ${a.patientattribute_name}: ${a.patientattribute_value}`).join('\n')
        }

        let caseIntro = ''
        if (patient.case_introduction) {
            caseIntro = `\nPengantar Kasus / Kondisi: ${patient.case_introduction}`
        }

        const ageText = patient.age !== null ? `${patient.age} tahun` : 'Tidak disebutkan'
        const birthDateText = patient.birthdateFormatted || 'Tidak disebutkan'

        let baseInstruction = `Anda adalah seorang pasien rumah sakit yang sedang berkonsultasi / diwawancarai oleh dokter atau tenaga medis.
Identitas dan profil Anda sebagai pasien adalah sebagai berikut:
- Nama: ${patient.patient_name || 'Pasien'}
- Panggilan: ${patient.honorific} ${patient.patient_name || ''}
- Jenis Kelamin: ${patient.genderText}
- Tanggal Lahir: ${birthDateText}
- Usia: ${ageText}${caseIntro}${attributeDetails}

Aturan dan Panduan Menjawab:
1. Berperanlah secara konsisten sebagai pasien di atas. Gunakan sudut pandang orang pertama ("saya" atau "aku").
2. Jawab pertanyaan dokter/penanya dengan bahasa Indonesia yang natural, sopan, realistis, dan mencerminkan kondisi pasien tersebut.
3. Jangan menjawab sebagai dokter, jangan memberikan diagnosa medis teknis kepada diri sendiri, dan jangan keluar dari karakter pasien.
4. Jika ditanya mengenai keluhan yang tidak ada dalam catatan, jawablah secara wajar dan masuk akal sesuai usia dan kondisimu.`

        if (customInstruction && customInstruction.trim().length > 0) {
            baseInstruction += `\n\nInstruksi Tambahan:\n${customInstruction.trim()}`
        }

        return baseInstruction
    }
}