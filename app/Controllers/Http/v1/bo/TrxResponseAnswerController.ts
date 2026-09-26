import Application from '@ioc:Adonis/Core/Application'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import ApiHealthController from './ApiHealthController'
import Database from '@ioc:Adonis/Lucid/Database'
import date from 'date-and-time'
import moment from 'moment'
import GeminiService from 'App/Services/ai/GeminiService'

const General = new GeneralRepository()
const ApiHealth = new ApiHealthController()
const geminiService = new GeminiService()

export default class TrxResponseAnswerController {

    // =====================================================================
    // GET /v1/trx_response_answer/:id
    // Menampilkan semua jawaban per response_id (semua pos)
    // =====================================================================
    public async detail({ params, response }) {
        const responseId = params.id

        try {
            // Ambil info trx_response (header)
            const trxResponse = await Database.query()
                .select([
                    'a.response_id',
                    'a.response_contest_id',
                    'a.response_contestteam_id',
                    'a.response_case_id',
                    'a.response_patient_id',
                    'a.response_total_score',
                    'a.response_is_submited',
                    'p.patient_name',
                    'p.patient_birthdate',
                    'p.patient_gender',
                    'c.case_name',
                    'c.case_desc',
                    't.contestteam_name',
                ])
                .from('trx_response as a')
                .leftJoin('data_patient as p', 'p.patient_id', 'a.response_patient_id')
                .leftJoin('data_case as c', 'c.case_id', 'a.response_case_id')
                .leftJoin('data_contest_team as t', 't.contestteam_id', 'a.response_contestteam_id')
                .where('a.response_id', responseId)
                .first()

            if (!trxResponse) {
                return response.status(404).send({
                    status: false,
                    message: `Data response dengan response_id ${responseId} tidak ditemukan.`,
                })
            }

            // Fallback data pasien jika response_patient_id kosong
            let patientName = trxResponse.patient_name || 'Pasien'
            let patientBirthdate = trxResponse.patient_birthdate || null
            let patientGender = trxResponse.patient_gender || null

            if (!trxResponse.patient_name && trxResponse.response_case_id) {
                const cp = await Database.query()
                    .from('data_case_patient as cp')
                    .join('data_patient as p', 'p.patient_id', 'cp.casepatient_patient_id')
                    .where('cp.casepatient_case_id', trxResponse.response_case_id)
                    .first()
                if (cp) {
                    patientName = cp.patient_name || patientName
                    patientBirthdate = cp.patient_birthdate || patientBirthdate
                    patientGender = cp.patient_gender || patientGender
                }
            }

            const patientAge = patientBirthdate ? `${moment().diff(moment(patientBirthdate), 'years')} Tahun` : ''
            const patientTitle = patientGender === 'L' || patientGender === 'M' ? 'Tuan' : 'Ny'
            const patientDisplay = patientAge ? `${patientName} (${patientAge})` : patientName

            const renderTemplate = (text: string, limitTimeSec?: number) => {
                if (!text) return text
                const durationMin = limitTimeSec ? Math.round(limitTimeSec / 60) : 3
                const durationText = `${durationMin} Menit`

                const templateVars: Record<string, string> = {
                    '{{patient_name}}': patientName,
                    '{{patient_age}}': patientAge,
                    '{{patient_title}}': patientTitle,
                    '{{patient_name_age}}': patientDisplay,
                    '{{limit_time}}': durationText,
                    '{{case_name}}': trxResponse.case_name || '',
                    '{{case_desc}}': trxResponse.case_desc || '',
                }

                let res = text
                for (const [k, v] of Object.entries(templateVars)) {
                    res = res.split(k).join(v)
                }
                return res
            }

            // Ambil semua quest untuk case ini
            const quests = await Database.query()
                .from('data_case_quest')
                .where('casequest_case_id', trxResponse.response_case_id)
                .orderBy('casequest_order', 'asc')

            // Susun hasil per pos / quest
            const posResults: any[] = []
            for (const quest of quests) {
                let method = await General.getWhereRowObject('ref_method', { method_id: quest.casequest_method_id })

                // Ambil data ref_method_rule & detail
                let rawRules: any[] = []
                if (quest.casequest_method_id) {
                    rawRules = await Database.query()
                        .from('ref_method_rule')
                        .where('methodrule_method_id', quest.casequest_method_id)
                        .orderBy('methodrule_order', 'asc')

                    for (let r of rawRules) {
                        r.detail = await Database.query()
                            .from('ref_method_rule_detail')
                            .where('methodruledetail_methodrule_id', r.methodrule_id)
                            .orderBy('methodruledetail_order', 'asc')
                    }
                }

                const rules = rawRules.map((r: any) => ({
                    methodrule_id: r.methodrule_id,
                    methodrule_method_id: r.methodrule_method_id,
                    methodrule_text: renderTemplate(r.methodrule_text, quest.casequest_limit_time),
                    methodrule_order: r.methodrule_order,
                    detail: (r.detail || []).map((d: any) => ({
                        methodruledetail_id: d.methodruledetail_id,
                        methodruledetail_methodrule_id: d.methodruledetail_methodrule_id,
                        methodruledetail_text: renderTemplate(d.methodruledetail_text, quest.casequest_limit_time),
                        methodruledetail_order: d.methodruledetail_order,
                    }))
                }))

                const posData: any = {
                    casequest_id: quest.casequest_id,
                    casequest_name: quest.casequest_name,
                    casequest_method_id: quest.casequest_method_id,
                    method_name: method ? method.method_name : null,
                    casequest_order: quest.casequest_order,
                    casequest_limit_time: quest.casequest_limit_time,
                    rule: rules,
                    answers: [],
                    total_score: 0,
                }

                switch (Number(quest.casequest_method_id)) {
                    case 1: { // Pos 1: IA (Intelligent Assistant)
                        let rawChats = await Database.query()
                            .select([
                                'responseia_id',
                                'responseia_sender',
                                'responseia_text',
                                'insert_timestamp',
                            ])
                            .from('trx_response_ia')
                            .where('responseia_response_id', responseId)
                            .where('responseia_casequest_id', quest.casequest_id)
                            .orderBy('responseia_id', 'asc')

                        let chats = rawChats.map((c: any) => {
                            const senderLabel = c.responseia_sender === 1 ? 'Pasien' : 'Bidan'
                            const chatTime = c.insert_timestamp ? moment(c.insert_timestamp).format('HH:mm:ss') : null
                            return {
                                responseia_id: c.responseia_id,
                                responseia_sender: c.responseia_sender,
                                sender: senderLabel,
                                responseia_text: c.responseia_text,
                                insert_timestamp: c.insert_timestamp,
                                chat_time: chatTime,
                            }
                        })

                        // Selalu pastikan chat pertama merupakan pesan pembuka dari casequestia_initmsg
                        const iaConfig = await General.getWhereRowObject('data_case_quest_ia', { casequestia_casequest_id: quest.casequest_id })
                        if (iaConfig && iaConfig.casequestia_initmsg) {
                            const initTimestamp = chats.length > 0 ? chats[0].insert_timestamp : null
                            const initChatTime = initTimestamp ? moment(initTimestamp).format('HH:mm:ss') : null
                            const initMsgObj = {
                                responseia_id: null,
                                responseia_sender: 1,
                                sender: 'Pasien',
                                responseia_text: iaConfig.casequestia_initmsg,
                                insert_timestamp: initTimestamp,
                                chat_time: initChatTime,
                            }
                            if (!chats || chats.length === 0) {
                                chats = [initMsgObj]
                            } else if (chats[0]?.responseia_text !== iaConfig.casequestia_initmsg) {
                                chats.unshift(initMsgObj)
                            }
                        }

                        const triggers = await Database.query()
                            .from('trx_response_ia_trigger as a')
                            .leftJoin('data_case_quest_ia_trigger as b', 'b.casequestiatrigger_id', 'a.responseiatrigger_trigger_id')
                            .where('a.responseiatrigger_response_id', responseId)
                            .where('a.responseiatrigger_casequest_id', quest.casequest_id)
                            .select('a.*', 'b.casequestiatrigger_name', 'b.casequestiatrigger_key')

                        posData.answers = { chats, triggers }
                        posData.total_score = triggers.reduce((sum: number, t: any) => sum + Number(t.responseiatrigger_score || 0), 0)
                        break
                    }

                    case 2: { // Pos 2: MC (Multiple Choice)
                        const mc = await General.getWhereObject('data_case_quest_mc', { casequestmc_casequest_id: quest.casequest_id })
                        const mcAnswers = await Database.query()
                            .from('trx_response_mc as a')
                            .leftJoin('data_case_quest_mc as b', 'b.casequestmc_id', 'a.responsemc_casequestmc_id')
                            .where('a.responsemc_response_id', responseId)
                            .where('a.responsemc_casequest_id', quest.casequest_id)
                            .select('a.*', 'b.casequestmc_name')

                        posData.mc = mc
                        posData.answers = mcAnswers
                        posData.total_score = mcAnswers.reduce((sum: number, a: any) => sum + Number(a.responsemc_score || 0), 0)
                        break
                    }

                    case 3: { // Pos 3: OS (Ordering Step)
                        const os = await Database.query()
                            .from('data_case_quest_os')
                            .where('casequestos_casequest_id', quest.casequest_id)
                            .orderBy('casequestos_order', 'asc')
                        const osAnswers = await Database.query()
                            .from('trx_response_os as a')
                            .leftJoin('data_case_quest_os as b', 'b.casequestos_id', 'a.responseos_casequestos_id')
                            .where('a.responseos_response_id', responseId)
                            .where('a.responseos_casequest_id', quest.casequest_id)
                            .orderBy('a.responseos_order', 'asc')
                            .select('a.*', 'b.casequestos_name', 'b.casequestos_order as correct_order')

                        posData.os = os
                        posData.answers = osAnswers
                        posData.total_score = osAnswers.reduce((sum: number, a: any) => sum + Number(a.responseos_score || 0), 0)
                        break
                    }

                    case 4: { // Pos 4: CI (Clinical Inquiry / Image Choice)
                        const ci = await General.getWhereObject('data_case_quest_ci', { casequestci_casequest_id: quest.casequest_id })
                        const ci_option = await General.getWhereObject('data_case_quest_ci_option', { casequestcioption_casequest_id: quest.casequest_id })
                        const ciAnswers = await Database.query()
                            .from('trx_response_ci as a')
                            .leftJoin('data_case_quest_ci_option as b', 'b.casequestcioption_id', 'a.responseci_casequestcioption_id')
                            .where('a.responseci_response_id', responseId)
                            .where('a.responseci_casequest_id', quest.casequest_id)
                            .select('a.*', 'b.casequestcioption_code', 'b.casequestcioption_name')

                        posData.ci = ci
                        posData.ci_option = ci_option
                        posData.answers = ciAnswers
                        posData.total_score = ciAnswers.reduce((sum: number, a: any) => sum + Number(a.responseci_score || 0), 0)
                        break
                    }

                    case 5: { // Pos 5: Record
                        const recordConfig = await General.getWhereRowObject('data_case_quest_record', { casequestrecord_casequest_id: quest.casequest_id })
                        const recordAnswers = await Database.query()
                            .from('trx_response_record')
                            .where('responserecord_response_id', responseId)
                            .where('responserecord_casequest_id', quest.casequest_id)

                        posData.record = recordConfig ? (recordConfig.casequestrecord_is_active ?? 0) : 0
                        posData.is_active_record = recordConfig ? (recordConfig.casequestrecord_is_active ?? 0) : 0
                        posData.record_detail = recordConfig || null
                        posData.answers = recordAnswers
                        posData.total_score = 0
                        break
                    }

                    default:
                        break
                }

                // Ambil data dari tabel trx_response_answer untuk pos ini (skor, status submited, & duration)
                const respAnswer = await Database.query()
                    .from('trx_response_answer')
                    .where('responseanswer_response_id', responseId)
                    .where('responseanswer_casequest_id', quest.casequest_id)
                    .first()

                posData.responseanswer = respAnswer || null
                posData.responseanswer_duration = respAnswer ? parseInt(respAnswer.responseanswer_duration, 10) || 0 : 0
                posData.duration = posData.responseanswer_duration
                posData.responseanswer_submited = respAnswer ? Number(respAnswer.responseanswer_submited || 0) : 0

                posResults.push(posData)
            }

            const totalScore = posResults.reduce((sum: number, p: any) => sum + Number(p.total_score || 0), 0)

            return response.send({
                status: true,
                message: 'Success',
                data: {
                    ...trxResponse,
                    calculated_total_score: totalScore,
                    pos: posResults,
                },
            })
        } catch (error: any) {
            return response.badRequest({
                status: false,
                message: error.message || 'Gagal mengambil data jawaban',
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer
    // Menyimpan jawaban per-pos secara dinamis berdasarkan casequest_method_id
    // Body: { response_id, casequest_id, ...answers }
    // =====================================================================
    public async store({ request, response }) {
        try {
            const post = request.all()

            if (!post.response_id || !post.casequest_id) {
                return response.badRequest({
                    status: false,
                    message: 'response_id dan casequest_id wajib diisi.',
                    received_body: post,
                })
            }

            const data_case_quest = await General.getWhereRowObject('data_case_quest', {
                casequest_id: post.casequest_id,
            })

            if (!data_case_quest) {
                return response.status(404).send({
                    status: false,
                    message: `Data quest dengan casequest_id ${post.casequest_id} tidak ditemukan di tabel data_case_quest.`,
                })
            }

            switch (String(data_case_quest.casequest_method_id)) {
                case '1':
                    return await this.storeIa({ request, response })
                case '2':
                    return await this.storeMc({ request, response })
                case '3':
                    return await this.storeOs({ request, response })
                case '4':
                    return await this.storeCi({ request, response })
                case '5':
                    return await this.storeRecord({ request, response })
                default:
                    return response.badRequest({
                        status: false,
                        message: `Metode quest (${data_case_quest.casequest_method_id}) tidak didukung.`,
                    })
            }
        } catch (error: any) {
            console.error('[TrxResponseAnswer.store] Error:', error)
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal memproses jawaban quest.',
                error_detail: error.toString(),
            })
        }
    }

    // =====================================================================
    // Service / Helper: Simpan chat method_id 1 (IA) dan proses trigger otomatis
    // @param sender: 1 (AI / Pasien) | 2 (Peserta Lomba, default: 2)
    // =====================================================================
    public async saveChat({
        response_id,
        casequest_id,
        sender = 2,
        text,
    }: {
        response_id: number | string
        casequest_id: number | string
        sender?: number | string
        text: string
    }, dbInstance: any = Database) {
        const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
        const senderNum = Number(sender)

        // 1. Jika pesan dari Peserta (sender = 2):
        if (senderNum === 2) {
            // A. Simpan pesan chat peserta ke trx_response_ia
            const participantChatInsert = {
                responseia_response_id: response_id,
                responseia_casequest_id: casequest_id,
                responseia_sender: 2, // 2 = Peserta
                responseia_text: text,
                insert_timestamp: now,
            }
            const partResult = await dbInstance
                .insertQuery()
                .table('trx_response_ia')
                .insert(participantChatInsert)
            const participantChatId = Array.isArray(partResult) ? partResult[0] : partResult

            // B. Cek apakah post.text mengandung keyword pada tabel data_case_quest_ia_trigger (soal terkait)
            const triggers = await dbInstance
                .query()
                .from('data_case_quest_ia_trigger')
                .where('casequestiatrigger_casequest_id', casequest_id)

            let matchedTrigger: any = this.findMatchingTrigger(triggers, text)
            let savedTrigger: any = null

            if (matchedTrigger) {
                // Simpan ke tabel trx_response_ia_trigger
                const triggerInsert = {
                    responseiatrigger_response_id: response_id,
                    responseiatrigger_casequest_id: casequest_id,
                    responseiatrigger_trigger_id: matchedTrigger.casequestiatrigger_id,
                    responseiatrigger_score: matchedTrigger.casequestiatrigger_score ?? 0,
                }

                // Check exist triger
                const checkTriger = await dbInstance
                    .query()
                    .from('trx_response_ia_trigger')
                    .where('responseiatrigger_response_id', response_id)
                    .where('responseiatrigger_casequest_id', casequest_id)
                    .where('responseiatrigger_trigger_id', matchedTrigger.casequestiatrigger_id)
                    .first()

                if (!checkTriger) {
                    const trgResult = await dbInstance
                        .insertQuery()
                        .table('trx_response_ia_trigger')
                        .insert(triggerInsert)
                    const trgId = Array.isArray(trgResult) ? trgResult[0] : trgResult

                    savedTrigger = {
                        responseiatrigger_id: trgId,
                        ...triggerInsert,
                        trigger_name: matchedTrigger.casequestiatrigger_name,
                        trigger_key: matchedTrigger.casequestiatrigger_key,
                    }
                } else {
                    savedTrigger = checkTriger
                }
            }

            let aiText = ''

            // Dapatkan respon balasan pasien via Gemini AI & susun prompt lengkap yang dikirim ke Gemini
            let fullPromptToGemini = ''
            let responseTime: number | null = null

            try {
                const status_api_gemini = await ApiHealth.checkGemini()
                if (status_api_gemini.connected || (status_api_gemini as any).connect) {
                    const startTime = Date.now()
                    const geminiResult = await this.getResponseGemini({
                        response_id,
                        casequest_id,
                        text,
                        matchedTrigger,
                        triggers,
                        dbInstance,
                    })
                    responseTime = Date.now() - startTime
                    aiText = geminiResult.replyText
                    fullPromptToGemini = geminiResult.fullPrompt
                } else {
                    // Fallback jika API Gemini disconnected: ambil dari data_case_quest_ia_trigger jika cocok, atau fallback default jika tidak cocok
                    aiText = matchedTrigger?.casequestiatrigger_response || 'Maaf bu bidan, saya kurang paham dengan pertanyaan tersebut. Apakah ada yang ingin ditanyakan terkait keluhan saya?'
                    const promptData = await this.buildGeminiPromptOnly({
                        response_id,
                        casequest_id,
                        text,
                        matchedTrigger,
                        triggers,
                        dbInstance,
                    })
                    fullPromptToGemini = promptData
                }
            } catch (aiErr: any) {
                console.warn('[TrxResponseAnswerController.saveChat] Error calling Gemini API:', aiErr?.message)
                aiText = matchedTrigger?.casequestiatrigger_response || 'Maaf bu bidan, saya kurang paham dengan pertanyaan tersebut. Apakah ada yang ingin ditanyakan terkait keluhan saya?'
                fullPromptToGemini = `[Error Fallback: ${aiErr?.message}] ${text}`
            }

            // Simpan hasil prompt yang dikirim ke Gemini dan responnya ke tabel trx_response_req
            const responseReqId = await this.saveResponseReq({
                responsereq_responseia_id: participantChatId || null,
                responsereq_provide_id: 1, // 1 = Google Gemini AI
                responsereq_prompt: fullPromptToGemini,
                responsereq_response: aiText,
                responsereq_confidence: matchedTrigger ? 1.0 : 0.5,
                responsereq_time: responseTime,
            }, dbInstance)

            // C. Simpan balasan AI ke trx_response_ia dengan sender = 1
            const aiChatInsert = {
                responseia_response_id: response_id,
                responseia_casequest_id: casequest_id,
                responseia_sender: 1, // 1 = AI / Pasien
                responseia_text: aiText,
                insert_timestamp: now,
            }
            const aiResult = await dbInstance
                .insertQuery()
                .table('trx_response_ia')
                .insert(aiChatInsert)
            const aiChatId = Array.isArray(aiResult) ? aiResult[0] : aiResult

            return {
                participant_chat: {
                    responseia_id: participantChatId,
                    ...participantChatInsert,
                },
                ai_reply: {
                    responseia_id: aiChatId,
                    ...aiChatInsert,
                },
                matched_trigger: savedTrigger,
                is_trigger_matched: !!matchedTrigger,
                responsereq_id: responseReqId,
            }
        } else {
            // Jika langsung menyimpan chat AI (sender = 1)
            const aiChatInsert = {
                responseia_response_id: response_id,
                responseia_casequest_id: casequest_id,
                responseia_sender: 1,
                responseia_text: text,
                insert_timestamp: now,
            }
            const result = await dbInstance
                .insertQuery()
                .table('trx_response_ia')
                .insert(aiChatInsert)
            const insertedId = Array.isArray(result) ? result[0] : result

            return {
                ai_reply: {
                    responseia_id: insertedId,
                    ...aiChatInsert,
                },
                is_trigger_matched: false,
            }
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/chat
    // Simpan 1 baris chat antara AI dan Peserta
    // Body: { response_id, casequest_id, sender: 1 | 2 (opsional, default: 2), text }
    // =====================================================================
    public async storeChat({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            sender: schema.number.optional(),
            text: schema.string([rules.minLength(1)]),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
            })
        }

        const post = request.all()
        const trx = await Database.transaction()
        try {
            const result = await this.saveChat({
                response_id: post.response_id,
                casequest_id: post.casequest_id,
                sender: post.sender || 2,
                text: post.text,
            }, trx)

            await trx.commit()

            return response.send({
                status: true,
                message: 'Pesan chat dan respon AI berhasil diproses.',
                data: result,
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan chat.',
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/ia
    // Pos 1: IA (Intelligent Assistant) — Simpan data jawaban pos IA ke trx_response_answer
    // Body: {
    //   response_id: "1",
    //   casequest_id: "1",
    //   responseanswer_submited: 1 (opsional, default: 1),
    //   responseanswer_duration: 120 (opsional, int)
    // }
    // =====================================================================
    public async storeIa({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            responseanswer_submited: schema.number.optional(),
            responseanswer_duration: schema.number.optional(),
            duration: schema.number.optional(),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
            })
        }

        const post = request.all()
        const responseId = post.response_id
        const casequestId = post.casequest_id
        const submited = post.responseanswer_submited !== undefined
            ? parseInt(post.responseanswer_submited, 10)
            : 1

        const trx = await Database.transaction()
        try {
            // Hitung total skor dari trx_response_ia_trigger untuk response_id & casequest_id ini
            const iaScore = await trx
                .from('trx_response_ia_trigger')
                .where('responseiatrigger_response_id', responseId)
                .where('responseiatrigger_casequest_id', casequestId)
                .sum('responseiatrigger_score as total')
                .first()

            const score = Number(iaScore?.total || 0)

            // Cek apakah data jawaban pos IA sudah ada di tabel trx_response_answer
            const existingAnswer = await trx
                .from('trx_response_answer')
                .where('responseanswer_response_id', responseId)
                .where('responseanswer_casequest_id', casequestId)
                .first()

            const rawDuration = post.responseanswer_duration ?? post.duration
            const duration = rawDuration !== undefined && rawDuration !== null
                ? parseInt(rawDuration, 10) || 0
                : (existingAnswer ? parseInt(existingAnswer.responseanswer_duration, 10) || 0 : 0)

            const answerData: any = {
                responseanswer_response_id: responseId,
                responseanswer_casequest_id: casequestId,
                responseanswer_submited: submited,
                responseanswer_score: score,
                responseanswer_duration: duration,
            }

            if (existingAnswer) {
                await trx
                    .from('trx_response_answer')
                    .where('responseanswer_response_id', responseId)
                    .where('responseanswer_casequest_id', casequestId)
                    .update(answerData)
            } else {
                await trx
                    .insertQuery()
                    .table('trx_response_answer')
                    .insert(answerData)
            }

            // Sinkronisasi total skor ke tabel trx_response
            await this.syncTotalScore(responseId, trx)
            await trx.commit()

            return response.send({
                status: true,
                message: 'Data jawaban IA berhasil disimpan.',
                data: {
                    ...answerData,
                },
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan data jawaban IA.',
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/mc
    // Pos 2: Multiple Choice — peserta memilih satu atau lebih opsi jawaban
    // Body: {
    //   response_id: "1",
    //   casequest_id: "2",
    //   answers: [casequestmc_id, casequestmc_id, ...] atau casequestmc_id,
    //   responseanswer_duration: 120 (opsional, int),
    //   responseanswer_submited: 1 (opsional)
    // }
    // =====================================================================
    public async storeMc({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            answers: schema.array.optional().anyMembers(),
            casequestmc_id: schema.string.optional(),
            responseanswer_submited: schema.number.optional(),
            responseanswer_duration: schema.number.optional(),
            duration: schema.number.optional(),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
                validation_errors: validationError.messages?.errors,
            })
        }

        const post = request.all()
        const responseId = post.response_id
        const casequestId = post.casequest_id

        let mcList: any[] = []
        if (Array.isArray(post.answers)) {
            mcList = post.answers
        } else if (post.casequestmc_id) {
            mcList = [post.casequestmc_id]
        } else if (post.answers) {
            mcList = [post.answers]
        }

        if (mcList.length === 0) {
            return response.badRequest({
                status: false,
                message: 'Pilihan jawaban (answers atau casequestmc_id) tidak boleh kosong.',
            })
        }

        const trx = await Database.transaction()
        try {
            // Hapus jawaban MC lama untuk pos ini (replace mode)
            await trx
                .from('trx_response_mc')
                .where('responsemc_response_id', responseId)
                .where('responsemc_casequest_id', casequestId)
                .delete()

            const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
            let totalScore = 0
            const insertedAnswers: any[] = []

            for (const item of mcList) {
                const casequestmcId = typeof item === 'object' ? (item.casequestmc_id || item.id) : item

                if (!casequestmcId) {
                    await trx.rollback()
                    return response.badRequest({
                        status: false,
                        message: 'Format answer tidak valid. ID pilihan jawaban (casequestmc_id) tidak ditemukan pada item.',
                        item_received: item,
                    })
                }

                const questMc = await trx
                    .query()
                    .from('data_case_quest_mc')
                    .where('casequestmc_id', casequestmcId)
                    .where('casequestmc_casequest_id', casequestId)
                    .first()

                if (!questMc) {
                    const existAnywhere = await trx
                        .query()
                        .from('data_case_quest_mc')
                        .where('casequestmc_id', casequestmcId)
                        .first()

                    await trx.rollback()
                    if (existAnywhere) {
                        return response.badRequest({
                            status: false,
                            message: `Pilihan jawaban casequestmc_id ${casequestmcId} terdaftar pada casequest_id ${existAnywhere.casequestmc_casequest_id}, bukan pada casequest_id ${casequestId}.`,
                        })
                    } else {
                        return response.badRequest({
                            status: false,
                            message: `Pilihan jawaban dengan casequestmc_id ${casequestmcId} tidak ditemukan di database.`,
                        })
                    }
                }

                let score = Number(questMc.casequestmc_score || 0)

                // Jika terdapat casequestmc_required_id, cek apakah trigger sudah tercapai di trx_response_ia_trigger
                if (questMc.casequestmc_required_id && Number(questMc.casequestmc_required_id) !== 0) {
                    const checkTrigger = await trx
                        .query()
                        .from('trx_response_ia_trigger')
                        .where('responseiatrigger_response_id', responseId)
                        .where('responseiatrigger_trigger_id', questMc.casequestmc_required_id)
                        .first()

                    if (!checkTrigger) {
                        score = 0
                    }
                }

                totalScore += score

                await trx.insertQuery().table('trx_response_mc').insert({
                    responsemc_response_id: responseId,
                    responsemc_casequest_id: casequestId,
                    responsemc_casequestmc_id: casequestmcId,
                    responsemc_score: score,
                    insert_timestamp: now,
                })

                insertedAnswers.push({
                    casequestmc_id: casequestmcId,
                    casequestmc_name: questMc.casequestmc_name,
                    score: score,
                })
            }

            // Simpan data jawaban pos MC ke tabel trx_response_answer
            const rawDuration = post.responseanswer_duration ?? post.duration
            const submited = post.responseanswer_submited !== undefined
                ? parseInt(post.responseanswer_submited, 10)
                : 1

            const existingAnswer = await trx
                .from('trx_response_answer')
                .where('responseanswer_response_id', responseId)
                .where('responseanswer_casequest_id', casequestId)
                .first()

            const duration = rawDuration !== undefined && rawDuration !== null
                ? parseInt(rawDuration, 10) || 0
                : (existingAnswer ? parseInt(existingAnswer.responseanswer_duration, 10) || 0 : 0)

            const answerData: any = {
                responseanswer_response_id: responseId,
                responseanswer_casequest_id: casequestId,
                responseanswer_submited: submited,
                responseanswer_score: totalScore,
                responseanswer_duration: duration,
            }

            if (existingAnswer) {
                await trx
                    .from('trx_response_answer')
                    .where('responseanswer_response_id', responseId)
                    .where('responseanswer_casequest_id', casequestId)
                    .update(answerData)
            } else {
                await trx
                    .insertQuery()
                    .table('trx_response_answer')
                    .insert(answerData)
            }

            await this.syncTotalScore(responseId, trx)
            await trx.commit()

            return response.send({
                status: true,
                message: 'Jawaban Multiple Choice berhasil disimpan.',
                data: {
                    response_id: responseId,
                    casequest_id: casequestId,
                    total_answers: insertedAnswers.length,
                    total_score: totalScore,
                    responseanswer_duration: duration,
                    duration: duration,
                    answers: insertedAnswers,
                },
            })
        } catch (error: any) {
            await trx.rollback()
            console.error('[storeMc] Error:', error)
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan jawaban MC.',
                error_detail: error.toString(),
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/os
    // Pos 3: Ordering Step — peserta mengurutkan langkah-langkah
    // Body: {
    //   response_id: "1",
    //   casequest_id: "3",
    //   answers: [
    //     { casequestos_id: "1", order: 1 },
    //     { casequestos_id: "2", order: 2 },
    //   ],
    //   responseanswer_duration: 120 (opsional, int),
    //   responseanswer_submited: 1 (opsional)
    // }
    // =====================================================================
    public async storeOs({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            answers: schema.array().members(
                schema.object().anyMembers()
            ),
            responseanswer_submited: schema.number.optional(),
            responseanswer_duration: schema.number.optional(),
            duration: schema.number.optional(),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
            })
        }

        const post = request.all()
        const responseId = post.response_id
        const casequestId = post.casequest_id
        const answers: any[] = post.answers || []

        const trx = await Database.transaction()
        try {
            // Hapus jawaban OS lama (replace mode)
            await trx
                .from('trx_response_os')
                .where('responseos_response_id', responseId)
                .where('responseos_casequest_id', casequestId)
                .delete()

            const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
            let totalScore = 0
            const insertedAnswers: any[] = []

            for (let i = 0; i < answers.length; i++) {
                const item = answers[i]
                const casequestosId = item.casequestos_id || item.id
                const userOrder = Number(item.order ?? item.user_order ?? (i + 1))

                const questOs = await trx
                    .query()
                    .from('data_case_quest_os')
                    .where('casequestos_id', casequestosId)
                    .where('casequestos_casequest_id', casequestId)
                    .first()

                if (!questOs) {
                    await trx.rollback()
                    return response.badRequest({
                        status: false,
                        message: `Langkah dengan casequestos_id ${casequestosId} tidak valid untuk soal ini.`,
                    })
                }

                // Cek apakah urutan sama dengan kunci
                const isCorrect = Number(userOrder) === Number(questOs.casequestos_order)
                const score = isCorrect ? Number(questOs.casequestos_score || 0) : 0
                totalScore += score

                await trx.insertQuery().table('trx_response_os').insert({
                    responseos_response_id: responseId,
                    responseos_casequest_id: casequestId,
                    responseos_casequestos_id: casequestosId,
                    responseos_order: userOrder,
                    responseos_score: score,
                    insert_timestamp: now,
                })

                insertedAnswers.push({
                    casequestos_id: casequestosId,
                    casequestos_name: questOs.casequestos_name,
                    correct_order: questOs.casequestos_order,
                    user_order: userOrder,
                    is_correct: isCorrect,
                    score: score,
                })
            }

            // Simpan data jawaban pos OS ke tabel trx_response_answer
            const rawDuration = post.responseanswer_duration ?? post.duration
            const submited = post.responseanswer_submited !== undefined
                ? parseInt(post.responseanswer_submited, 10)
                : 1

            const existingAnswer = await trx
                .from('trx_response_answer')
                .where('responseanswer_response_id', responseId)
                .where('responseanswer_casequest_id', casequestId)
                .first()

            const duration = rawDuration !== undefined && rawDuration !== null
                ? parseInt(rawDuration, 10) || 0
                : (existingAnswer ? parseInt(existingAnswer.responseanswer_duration, 10) || 0 : 0)

            const answerData: any = {
                responseanswer_response_id: responseId,
                responseanswer_casequest_id: casequestId,
                responseanswer_submited: submited,
                responseanswer_score: totalScore,
                responseanswer_duration: duration,
            }

            if (existingAnswer) {
                await trx
                    .from('trx_response_answer')
                    .where('responseanswer_response_id', responseId)
                    .where('responseanswer_casequest_id', casequestId)
                    .update(answerData)
            } else {
                await trx
                    .insertQuery()
                    .table('trx_response_answer')
                    .insert(answerData)
            }

            await this.syncTotalScore(responseId, trx)
            await trx.commit()

            return response.send({
                status: true,
                message: 'Jawaban Ordering Step berhasil disimpan.',
                data: {
                    response_id: responseId,
                    casequest_id: casequestId,
                    total_answers: insertedAnswers.length,
                    total_score: totalScore,
                    responseanswer_duration: duration,
                    duration: duration,
                    answers: insertedAnswers,
                },
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan jawaban OS.',
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/ci
    // Pos 4: Clinical Inquiry / Image Choice — peserta memilih opsi/gambar
    // Body: {
    //   response_id: "1",
    //   casequest_id: "4",
    //   casequestcioption_id: "2",
    //   responseanswer_duration: 120 (opsional, int),
    //   responseanswer_submited: 1 (opsional)
    // }
    // =====================================================================
    public async storeCi({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            casequestcioption_id: schema.string.optional(),
            answers: schema.array.optional().anyMembers(),
            responseanswer_submited: schema.number.optional(),
            responseanswer_duration: schema.number.optional(),
            duration: schema.number.optional(),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
            })
        }

        const post = request.all()
        const responseId = post.response_id
        const casequestId = post.casequest_id
        let optionId = post.casequestcioption_id || post.casequestci_id

        if (!optionId && Array.isArray(post.answers) && post.answers.length > 0) {
            optionId = typeof post.answers[0] === 'object'
                ? (post.answers[0].casequestcioption_id || post.answers[0].id)
                : post.answers[0]
        }

        if (!optionId) {
            return response.badRequest({
                status: false,
                message: 'casequestcioption_id wajib disertakan.',
            })
        }

        const trx = await Database.transaction()
        try {
            const option = await trx
                .query()
                .from('data_case_quest_ci_option')
                .where('casequestcioption_id', optionId)
                .where('casequestcioption_casequest_id', casequestId)
                .first()

            if (!option) {
                await trx.rollback()
                return response.badRequest({
                    status: false,
                    message: `Pilihan opsi dengan casequestcioption_id ${optionId} tidak valid untuk soal ini.`,
                })
            }

            // Hapus jawaban CI sebelumnya untuk pos ini
            await trx
                .from('trx_response_ci')
                .where('responseci_response_id', responseId)
                .where('responseci_casequest_id', casequestId)
                .delete()

            const score = Number(option.casequestcioption_score || 0)

            await trx.insertQuery().table('trx_response_ci').insert({
                responseci_response_id: responseId,
                responseci_casequest_id: casequestId,
                responseci_casequestcioption_id: optionId,
                responseci_is_submited: 1,
                responseci_score: score,
            })

            // Simpan data jawaban pos CI ke tabel trx_response_answer
            const rawDuration = post.responseanswer_duration ?? post.duration
            const submited = post.responseanswer_submited !== undefined
                ? parseInt(post.responseanswer_submited, 10)
                : 1

            const existingAnswer = await trx
                .from('trx_response_answer')
                .where('responseanswer_response_id', responseId)
                .where('responseanswer_casequest_id', casequestId)
                .first()

            const duration = rawDuration !== undefined && rawDuration !== null
                ? parseInt(rawDuration, 10) || 0
                : (existingAnswer ? parseInt(existingAnswer.responseanswer_duration, 10) || 0 : 0)

            const answerData: any = {
                responseanswer_response_id: responseId,
                responseanswer_casequest_id: casequestId,
                responseanswer_submited: submited,
                responseanswer_score: score,
                responseanswer_duration: duration,
            }

            if (existingAnswer) {
                await trx
                    .from('trx_response_answer')
                    .where('responseanswer_response_id', responseId)
                    .where('responseanswer_casequest_id', casequestId)
                    .update(answerData)
            } else {
                await trx
                    .insertQuery()
                    .table('trx_response_answer')
                    .insert(answerData)
            }

            await this.syncTotalScore(responseId, trx)
            await trx.commit()

            return response.send({
                status: true,
                message: 'Jawaban Clinical Inquiry / Image Choice berhasil disimpan.',
                data: {
                    response_id: responseId,
                    casequest_id: casequestId,
                    casequestcioption_id: optionId,
                    casequestcioption_name: option.casequestcioption_name,
                    score: score,
                    responseanswer_duration: duration,
                    duration: duration,
                },
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan jawaban CI.',
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/record
    // Pos 5: Record — Simpan rekaman audio konsultasi
    // =====================================================================
    public async storeRecord({ request, response }) {
        const post = request.all()
        const responseId = post.response_id
        const casequestId = post.casequest_id

        if (!responseId || !casequestId) {
            return response.badRequest({
                status: false,
                message: 'response_id dan casequest_id wajib disertakan.',
            })
        }

        let filePath = post.file || post.responserecord_file || null
        let size = Number(post.size || 0)
        let duration = Number(post.duration || 0)

        const recording = request.file('recording') || request.file('file')
        if (recording && recording.isValid) {
            const ext = recording.extname || 'webm'
            const fileName = `rec_${Date.now()}_${responseId}_${casequestId}.${ext}`
            await recording.move(Application.makePath('storage/recordings'), {
                name: fileName,
                overwrite: true,
            })
            filePath = `storage/recordings/${fileName}`
            size = recording.size || size
        }

        const trx = await Database.transaction()
        try {
            await trx
                .from('trx_response_record')
                .where('responserecord_response_id', responseId)
                .where('responserecord_casequest_id', casequestId)
                .delete()

            await trx.insertQuery().table('trx_response_record').insert({
                responserecord_response_id: responseId,
                responserecord_casequest_id: casequestId,
                responserecord_file: filePath,
                responserecord_size: size,
                responserecord_duration: duration,
            })

            // Simpan data jawaban pos Record ke tabel trx_response_answer
            const rawDuration = post.responseanswer_duration ?? post.duration
            const submited = post.responseanswer_submited !== undefined
                ? parseInt(post.responseanswer_submited, 10)
                : 1

            const existingAnswer = await trx
                .from('trx_response_answer')
                .where('responseanswer_response_id', responseId)
                .where('responseanswer_casequest_id', casequestId)
                .first()

            const parsedDuration = rawDuration !== undefined && rawDuration !== null
                ? parseInt(rawDuration, 10) || 0
                : (existingAnswer ? parseInt(existingAnswer.responseanswer_duration, 10) || 0 : duration)

            const answerData: any = {
                responseanswer_response_id: responseId,
                responseanswer_casequest_id: casequestId,
                responseanswer_submited: submited,
                responseanswer_score: 0,
                responseanswer_duration: parsedDuration,
            }

            if (existingAnswer) {
                await trx
                    .from('trx_response_answer')
                    .where('responseanswer_response_id', responseId)
                    .where('responseanswer_casequest_id', casequestId)
                    .update(answerData)
            } else {
                await trx
                    .insertQuery()
                    .table('trx_response_answer')
                    .insert(answerData)
            }

            await trx.commit()

            return response.send({
                status: true,
                message: 'Recording konsultasi berhasil disimpan.',
                data: {
                    response_id: responseId,
                    casequest_id: casequestId,
                    file: filePath,
                    size: size,
                    duration: parsedDuration,
                    responseanswer_duration: parsedDuration,
                },
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan data recording.',
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/submit
    // Submit final: tandai response sebagai submitted & hitung total skor
    // Body: { response_id: "1" }
    // =====================================================================
    public async submit({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
            })
        }

        const post = request.all()
        const responseId = post.response_id

        const trx = await Database.transaction()
        try {
            const totalScore = await this.calculateTotalScore(responseId, trx)

            await trx.from('trx_response')
                .where('response_id', responseId)
                .update({
                    response_total_score: totalScore,
                    response_is_submited: 1,
                })

            await trx.commit()

            return response.send({
                status: true,
                message: 'Response berhasil disubmit.',
                data: {
                    response_id: responseId,
                    total_score: totalScore,
                    response_is_submited: 1,
                },
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.message || 'Gagal submit response.',
            })
        }
    }

    // =====================================================================
    // Helper: Hitung & Sinkronisasi Total Skor ke tabel trx_response
    // =====================================================================
    private async calculateTotalScore(responseId: string | number, dbInstance: any = Database) {
        // 1. Skor IA Trigger
        const iaScore = await dbInstance
            .from('trx_response_ia_trigger')
            .where('responseiatrigger_response_id', responseId)
            .sum('responseiatrigger_score as total')
            .first()

        // 2. Skor MC
        const mcScore = await dbInstance
            .from('trx_response_mc')
            .where('responsemc_response_id', responseId)
            .sum('responsemc_score as total')
            .first()

        // 3. Skor OS
        const osScore = await dbInstance
            .from('trx_response_os')
            .where('responseos_response_id', responseId)
            .sum('responseos_score as total')
            .first()

        // 4. Skor CI
        const ciScore = await dbInstance
            .from('trx_response_ci')
            .where('responseci_response_id', responseId)
            .sum('responseci_score as total')
            .first()

        const total =
            Number(iaScore?.total || 0) +
            Number(mcScore?.total || 0) +
            Number(osScore?.total || 0) +
            Number(ciScore?.total || 0)

        return total
    }

    private async syncTotalScore(responseId: string | number, dbInstance: any = Database) {
        const total = await this.calculateTotalScore(responseId, dbInstance)
        await dbInstance
            .from('trx_response')
            .where('response_id', responseId)
            .update({
                response_total_score: total,
            })
        return total
    }

    /**
     * Helper: Mencari trigger terbaik dari data_case_quest_ia_trigger
     * berdasarkan kata kunci (key), kategori (name), dan kecocokan token.
     */
    public findMatchingTrigger(triggers: any[], text: string): any {
        if (!triggers || triggers.length === 0 || !text) {
            return null
        }

        const STOP_WORDS = new Set([
            'bu', 'ibu', 'pak', 'bapak', 'bidan', 'dokter', 'ada', 'dan', 'atau', 'yang', 'ini', 'itu',
            'saya', 'anda', 'kamu', 'apa', 'apakah', 'sudah', 'belum', 'mau', 'lagi', 'bisa', 'pada',
            'dari', 'ke', 'di', 'dengan', 'untuk', 'ya', 'saja', 'terkait', 'tentang'
        ])

        // Kata tanya atau kata umum yang tidak spesifik topik klinis
        const GENERIC_WORDS = new Set([
            'siapa', 'kapan', 'berapa', 'kenapa', 'mengapa', 'bagaimana', 'mana', 'hari', 'bulan', 'tahun', 'kali', 'merasa'
        ])

        const cleanText = text.toLowerCase().trim()
        // Jika hanya sapaan murni tanpa konteks klinis/medis, jangan cocokkan ke trigger medis
        if (/^(halo|hai|selamat\s+(pagi|siang|sore|malam)|assalamu['\w]*)\s*(bu|ibu|bidan)?\s*[.!?]?$/i.test(cleanText)) {
            return null
        }

        const textTokens = cleanText
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length > 1 && !STOP_WORDS.has(w))

        let bestTrigger: any = null
        let maxScore = 0

        for (const trg of triggers) {
            let score = 0
            const keyStr = trg.casequestiatrigger_key ? String(trg.casequestiatrigger_key).trim().toLowerCase() : ''
            const nameStr = trg.casequestiatrigger_name ? String(trg.casequestiatrigger_name).trim().toLowerCase() : ''

            if (!keyStr && !nameStr) continue

            // 1. Cek kecocokan frasa / kata kunci pada casequestiatrigger_key
            if (keyStr) {
                const keys = keyStr
                    .split(',')
                    .map((k) => k.trim())
                    .filter(Boolean)

                for (const k of keys) {
                    if (k.length < 2 || STOP_WORDS.has(k)) continue

                    const wordsInKey = k.split(/\s+/).filter(Boolean)
                    const isGenericSingle = wordsInKey.length === 1 && GENERIC_WORDS.has(wordsInKey[0])

                    // Jika frasa persis ada di teks
                    if (cleanText.includes(k)) {
                        if (isGenericSingle) {
                            score += 5
                        } else {
                            score += wordsInKey.length > 1 ? 30 * wordsInKey.length : 20
                        }
                    } else {
                        // Cek token kata individual dalam key
                        for (const kw of wordsInKey) {
                            if (kw.length < 3 || STOP_WORDS.has(kw)) continue

                            const isKwGeneric = GENERIC_WORDS.has(kw)
                            if (textTokens.includes(kw)) {
                                score += isKwGeneric ? 3 : 10
                            } else if (kw.length >= 4 && !isKwGeneric) {
                                // Substring / stem match hanya untuk kata >= 4 huruf (misal "darah" <-> "pendarahan")
                                if (textTokens.some((tw) => tw.length >= 4 && (tw.includes(kw) || kw.includes(tw)))) {
                                    score += 5
                                }
                            }
                        }
                    }
                }
            }

            // 2. Cek kecocokan dengan nama kategori trigger (casequestiatrigger_name)
            if (nameStr) {
                const nameWords = nameStr
                    .replace(/[^\w\s]/g, ' ')
                    .split(/\s+/)
                    .filter((w) => w.length > 3 && !['riwayat', 'pasien', 'pemeriksaan'].includes(w) && !STOP_WORDS.has(w) && !GENERIC_WORDS.has(w))

                for (const nw of nameWords) {
                    if (cleanText.includes(nw) || textTokens.includes(nw)) {
                        score += 15
                    }
                }
            }

            if (score > maxScore) {
                maxScore = score
                bestTrigger = trg
            }
        }

        return maxScore >= 15 ? bestTrigger : null
    }

    /**
     * Membersihkan teks keluaran Gemini agar murni bahasa lisan untuk respon chat
     */
    private cleanReplyForTts(text: string): string {
        let clean = (text || '').trim()
        clean = clean.replace(/^(pasien|ibu|ny\.|tuan|bidan)\s*:\s*/i, '')
        clean = clean.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim()
        return clean
    }

    /**
     * Menghasilkan respon percakapan pasien menggunakan Gemini AI
     * disesuaikan dengan data kasus, pasien, dan trigger dinamis dari database.
     */
    public async getResponseGemini({
        response_id,
        casequest_id,
        text,
        matchedTrigger,
        triggers,
        dbInstance = Database,
    }: {
        response_id: number | string
        casequest_id: number | string
        text: string
        matchedTrigger?: any
        triggers?: any[]
        dbInstance?: any
    }): Promise<any> {
        let systemPrompt = ''
        let contextPrompt = text
        let activeTriggers = triggers
        let initMsg = 'Selamat pagi Bu Bidan, saya mau berkonsultasi terkait keluhan saya.'
        let outOfScopeFallbackMessage = 'Aduh, maaf ya Bu Bidan... saya agak bingung, sepertinya hal itu tidak berhubungan dengan keluhan kesehatan saya saat ini.'

        try {
            // 1. Ambil data Kasus dan Pasien dari DB
            const trxResponse = await dbInstance
                .query()
                .select([
                    'a.response_id',
                    'a.response_case_id',
                    'a.response_patient_id',
                    'p.patient_name',
                    'p.patient_birthdate',
                    'p.patient_gender',
                    'c.case_name',
                    'c.case_desc',
                ])
                .from('trx_response as a')
                .leftJoin('data_patient as p', 'p.patient_id', 'a.response_patient_id')
                .leftJoin('data_case as c', 'c.case_id', 'a.response_case_id')
                .where('a.response_id', response_id)
                .first()

            let patientName = trxResponse?.patient_name || 'Pasien'
            let patientBirthdate = trxResponse?.patient_birthdate || null
            let patientGender = trxResponse?.patient_gender || null
            let caseDesc = trxResponse?.case_desc || trxResponse?.case_name || 'Pasien datang untuk berkonsultasi keluhan kesehatan ke Poli KIA.'

            // Fallback data pasien dari data_case_patient jika pada trx_response belum ada
            if (!trxResponse?.patient_name && trxResponse?.response_case_id) {
                const cp = await dbInstance
                    .query()
                    .from('data_case_patient as cp')
                    .join('data_patient as p', 'p.patient_id', 'cp.casepatient_patient_id')
                    .where('cp.casepatient_case_id', trxResponse.response_case_id)
                    .first()
                if (cp) {
                    patientName = cp.patient_name || patientName
                    patientBirthdate = cp.patient_birthdate || patientBirthdate
                    patientGender = cp.patient_gender || patientGender
                }
            }

            const patientAge = patientBirthdate ? moment().diff(moment(patientBirthdate), 'years') : 45
            const patientHonorific = patientGender === 'L' || patientGender === 'M' ? 'Tuan' : 'Ibu/Nyonya'
            const patientGenderStr = patientGender === 'L' || patientGender === 'M' ? 'Laki-laki' : 'Perempuan'

            // 2. Ambil data konfigurasi data_case_quest_ia (personality, initmsg, unknown)
            const iaConfig = await dbInstance
                .query()
                .from('data_case_quest_ia')
                .where('casequestia_casequest_id', casequest_id)
                .first()

            const personality = iaConfig?.casequestia_personality || 'Santun, kooperatif, dan berbicara secara singkat padat.'
            initMsg = iaConfig?.casequestia_initmsg || initMsg
            outOfScopeFallbackMessage = iaConfig?.casequestia_unknown || outOfScopeFallbackMessage

            // 3. Ambil data triggers jika belum disediakan & pastikan matchedTrigger terisi jika cocok
            if (!activeTriggers || activeTriggers.length === 0) {
                activeTriggers = await dbInstance
                    .query()
                    .from('data_case_quest_ia_trigger')
                    .where('casequestiatrigger_casequest_id', casequest_id)
            }

            if (!matchedTrigger) {
                matchedTrigger = this.findMatchingTrigger(activeTriggers, text)
            }

            const formattedTriggers = (activeTriggers || [])
                .map((trg: any, index: number) => {
                    return `${index + 1}. [${trg.casequestiatrigger_name || 'Kategori ' + (index + 1)}]
   - Kata Kunci / Pertanyaan: ${trg.casequestiatrigger_key || ''}
   - Fakta Medis / Jawaban Pasien: "${trg.casequestiatrigger_response || ''}"`
                })
                .join('\n')

            // 4. Susun System Prompt yang terstruktur
            systemPrompt = `Kamu berperan sebagai PASIEN ${patientGenderStr.toUpperCase()} bernama ${patientName} (usia ${patientAge} tahun, panggilan: ${patientHonorific}) yang sedang datang berkonsultasi dan diperiksa oleh seorang Mahasiswa Bidan / Tenaga Kesehatan di fasilitas pelayanan kesehatan.

DESKRIPSI KLINIS KASUS:
${caseDesc}

KELUHAN AWAL / PESAN PEMBUKA:
${initMsg}

KEPRIBADIAN PASIEN:
${personality}

DATA FAKTA JAWABAN & ANAMNESIS KASUS:
${formattedTriggers || '- Belum ada data anamnesis terdaftar.'}
`

            if (matchedTrigger && matchedTrigger.casequestiatrigger_response) {
                systemPrompt += `\nFAKTA JAWABAN YANG HARUS DISAMPAIKAN TERKAIT PERTANYAAN BIDAN SAAT INI:
"${matchedTrigger.casequestiatrigger_response}"
`
            }

            systemPrompt += `\nPANDUAN & ATURAN WAWANCARA:
1. Kamu adalah ${patientName} (pasien nyata). Berbicaralah SINGKAT dan PADAT dengan nada santun dalam 1-2 kalimat pendek bahasa Indonesia lisan (maksimal 25 kata).
2. Jawablah sesuai fakta medis pasien di atas. Jika pertanyaan sesuai dengan konteks/fakta yang tertera, sampaikan informasinya dengan jelas dan ramah.
3. JIKA BIDAN MENANYAKAN HAL DI LUAR KONTEKS, DI LUAR SCOPE KELUHAN, ATAU TOPIK YANG TIDAK BERHUBUNGAN: Jawablah dengan nada bingung dan sopan seperti: "${outOfScopeFallbackMessage}".
4. JANGAN keluar dari peran pasien. Jangan pernah menyebutkan bahwa kamu adalah AI atau model bahasa.
5. RESPONSE JANGAN LEBIH DARI 100 KATA`

            // 5. Ambil riwayat percakapan terkini untuk konteks dialog
            contextPrompt = text
            try {
                const recentChats = await dbInstance
                    .query()
                    .from('trx_response_ia')
                    .where('responseia_response_id', response_id)
                    .where('responseia_casequest_id', casequest_id)
                    .orderBy('responseia_id', 'desc')
                    .limit(6)

                if (recentChats && recentChats.length > 1) {
                    const sortedHistory = recentChats.reverse().slice(0, -1)
                    const formattedHistory = sortedHistory
                        .map((c: any) => (c.responseia_sender === 2 ? `Bidan: ${c.responseia_text}` : `Pasien: ${c.responseia_text}`))
                        .join('\n')

                    contextPrompt = `Riwayat percakapan sebelumnya:\n${formattedHistory}\n\nPertanyaan/pernyataan Bidan saat ini:\n${text}`
                }
            } catch (histErr: any) {
                console.warn('[TrxResponseAnswerController] Failed to fetch chat context:', histErr?.message)
            }

            // 6. Request jawaban ke Gemini AI
            const aiResult = await geminiService.generatePatientAnswer({
                prompt: contextPrompt,
                systemInstruction: systemPrompt,
                temperature: 0.6,
                maxOutputTokens: 250,
                topP: 0.9,
                timeout: 25000,
            })

            let cleaned = this.cleanReplyForTts(aiResult)
            if (!cleaned || cleaned.length < 5) {
                throw new Error(`Respons Gemini belum lengkap atau terpotong: "${cleaned}"`)
            }
            if (!/[.!?…'"]\s*$/.test(cleaned)) {
                cleaned += '.'
            }

            return {
                replyText: cleaned,
                fullPrompt: `SYSTEM INSTRUCTION:\n${systemPrompt}\n\nUSER PROMPT:\n${contextPrompt}`,
                matchedTrigger,
            }
        } catch (error: any) {
            console.warn('[TrxResponseAnswerController] Gemini fallback triggered:', error?.message)

            // Ambil response fallback lokal jika key dan kasus cocok, jika tidak cocok kembalikan fallback semula
            const fallbackResponse = (
                matchedTrigger?.casequestiatrigger_response ||
                'Maaf bu bidan, saya kurang paham dengan pertanyaan tersebut. Apakah ada yang ingin ditanyakan terkait keluhan saya?'
            )

            return {
                replyText: fallbackResponse,
                fullPrompt: `SYSTEM INSTRUCTION:\n${systemPrompt}\n\nUSER PROMPT:\n${contextPrompt}`,
            }
        }
    }

    /**
     * Helper: Menyusun representasi prompt lengkap yang akan dikirim ke Gemini
     */
    public async buildGeminiPromptOnly({
        response_id,
        casequest_id,
        text,
        matchedTrigger,
        triggers,
        dbInstance = Database,
    }: {
        response_id: string | number
        casequest_id: string | number
        text: string
        matchedTrigger?: any
        triggers?: any[]
        dbInstance?: any
    }): Promise<string> {
        try {
            const trxResponse = await dbInstance
                .query()
                .select([
                    'a.response_id',
                    'a.response_case_id',
                    'a.response_patient_id',
                    'p.patient_name',
                    'p.patient_birthdate',
                    'p.patient_gender',
                    'c.case_name',
                    'c.case_desc',
                ])
                .from('trx_response as a')
                .leftJoin('data_patient as p', 'p.patient_id', 'a.response_patient_id')
                .leftJoin('data_case as c', 'c.case_id', 'a.response_case_id')
                .where('a.response_id', response_id)
                .first()

            let patientName = trxResponse?.patient_name || 'Pasien'
            let patientBirthdate = trxResponse?.patient_birthdate || null
            let patientGender = trxResponse?.patient_gender || null
            let caseDesc = trxResponse?.case_desc || trxResponse?.case_name || 'Pasien datang untuk berkonsultasi keluhan kesehatan ke Poli KIA.'

            if (!trxResponse?.patient_name && trxResponse?.response_case_id) {
                const cp = await dbInstance
                    .query()
                    .from('data_case_patient as cp')
                    .join('data_patient as p', 'p.patient_id', 'cp.casepatient_patient_id')
                    .where('cp.casepatient_case_id', trxResponse.response_case_id)
                    .first()
                if (cp) {
                    patientName = cp.patient_name || patientName
                    patientBirthdate = cp.patient_birthdate || patientBirthdate
                    patientGender = cp.patient_gender || patientGender
                }
            }

            const patientAge = patientBirthdate ? moment().diff(moment(patientBirthdate), 'years') : 45
            const patientHonorific = patientGender === 'L' || patientGender === 'M' ? 'Tuan' : 'Ibu/Nyonya'
            const patientGenderStr = patientGender === 'L' || patientGender === 'M' ? 'Laki-laki' : 'Perempuan'

            const iaConfig = await dbInstance
                .query()
                .from('data_case_quest_ia')
                .where('casequestia_casequest_id', casequest_id)
                .first()

            const personality = iaConfig?.casequestia_personality || 'Santun, kooperatif, dan berbicara secara singkat padat.'
            const initMsg = iaConfig?.casequestia_initmsg || 'Selamat pagi Bu Bidan, saya mau berkonsultasi terkait keluhan saya.'
            const outOfScopeFallbackMessage =
                iaConfig?.casequestia_unknown ||
                'Aduh, maaf ya Bu Bidan... saya agak bingung, sepertinya hal itu tidak berhubungan dengan keluhan kesehatan saya saat ini.'

            let activeTriggers = triggers
            if (!activeTriggers || activeTriggers.length === 0) {
                activeTriggers = await dbInstance
                    .query()
                    .from('data_case_quest_ia_trigger')
                    .where('casequestiatrigger_casequest_id', casequest_id)
            }

            const formattedTriggers = (activeTriggers || [])
                .map((trg: any, index: number) => {
                    return `${index + 1}. [${trg.casequestiatrigger_name || 'Kategori ' + (index + 1)}]
   - Kata Kunci / Pertanyaan: ${trg.casequestiatrigger_key || ''}
   - Fakta Medis / Jawaban Pasien: "${trg.casequestiatrigger_response || ''}"`
                })
                .join('\n')

            let systemPrompt = `Kamu berperan sebagai PASIEN ${patientGenderStr.toUpperCase()} bernama ${patientName} (usia ${patientAge} tahun, panggilan: ${patientHonorific}) yang sedang datang berkonsultasi dan diperiksa oleh seorang Mahasiswa Bidan / Tenaga Kesehatan di fasilitas pelayanan kesehatan.

DESKRIPSI KLINIS KASUS:
${caseDesc}

KELUHAN AWAL / PESAN PEMBUKA:
${initMsg}

KEPRIBADIAN PASIEN:
${personality}

DATA FAKTA JAWABAN & ANAMNESIS KASUS:
${formattedTriggers || '- Belum ada data anamnesis terdaftar.'}
`

            if (matchedTrigger && matchedTrigger.casequestiatrigger_response) {
                systemPrompt += `\nFAKTA JAWABAN YANG HARUS DISAMPAIKAN TERKAIT PERTANYAAN BIDAN SAAT INI:
"${matchedTrigger.casequestiatrigger_response}"
`
            }

            systemPrompt += `\nPANDUAN & ATURAN WAWANCARA:
1. Kamu adalah ${patientName} (pasien nyata). Berbicaralah SINGKAT dan PADAT dengan nada santun dalam 1-2 kalimat pendek bahasa Indonesia lisan (maksimal 25 kata).
2. Jawablah sesuai fakta medis pasien di atas. Jika pertanyaan sesuai dengan konteks/fakta yang tertera, sampaikan informasinya dengan jelas dan ramah.
3. JIKA BIDAN MENANYAKAN HAL DI LUAR KONTEKS, DI LUAR SCOPE KELUHAN, ATAU TOPIK YANG TIDAK BERHUBUNGAN: Jawablah dengan nada bingung dan sopan seperti: "${outOfScopeFallbackMessage}".
4. JANGAN keluar dari peran pasien. Jangan pernah menyebutkan bahwa kamu adalah AI atau model bahasa.`

            let contextPrompt = text
            try {
                const recentChats = await dbInstance
                    .query()
                    .from('trx_response_ia')
                    .where('responseia_response_id', response_id)
                    .where('responseia_casequest_id', casequest_id)
                    .orderBy('responseia_id', 'desc')
                    .limit(6)

                if (recentChats && recentChats.length > 1) {
                    const sortedHistory = recentChats.reverse().slice(0, -1)
                    const formattedHistory = sortedHistory
                        .map((c: any) => (c.responseia_sender === 2 ? `Bidan: ${c.responseia_text}` : `Pasien: ${c.responseia_text}`))
                        .join('\n')

                    contextPrompt = `Riwayat percakapan sebelumnya:\n${formattedHistory}\n\nPertanyaan/pernyataan Bidan saat ini:\n${text}`
                }
            } catch (histErr: any) {
                console.warn('[TrxResponseAnswerController] Failed to fetch chat context:', histErr?.message)
            }

            return `SYSTEM INSTRUCTION:\n${systemPrompt}\n\nUSER PROMPT:\n${contextPrompt}`
        } catch (e: any) {
            return text
        }
    }

    /**
     * Simpan data request ke tabel trx_response_req sebelum/saat memanggil Gemini AI
     */
    private async saveResponseReq(data: {
        responsereq_responseia_id?: string | number | null
        responsereq_provide_id?: string | number | null
        responsereq_prompt: string
        responsereq_response?: string | null
        responsereq_confidence?: string | number | null
        responsereq_time?: number | null
    }, dbInstance: any = Database): Promise<number | string | null> {
        try {
            const result = await dbInstance
                .insertQuery()
                .table('trx_response_req')
                .insert({
                    responsereq_responseia_id: data.responsereq_responseia_id || null,
                    responsereq_provide_id: data.responsereq_provide_id || 1,
                    responsereq_prompt: data.responsereq_prompt,
                    responsereq_response: data.responsereq_response || null,
                    responsereq_confidence: data.responsereq_confidence || null,
                    responsereq_time: data.responsereq_time !== undefined ? data.responsereq_time : null,
                })
            const insertedId = Array.isArray(result) ? result[0] : result
            return insertedId || null
        } catch (err: any) {
            console.warn('[TrxResponseAnswerController] Failed to insert into trx_response_req:', err.message)
            return null
        }
    }

    /**
     * Update response pada tabel trx_response_req setelah respon didapatkan
     */
    private async updateResponseReq(
        responseReqId: number | string | null,
        data: {
            responsereq_response?: string | null
            responsereq_prompt?: string | null
            responsereq_confidence?: string | number | null
            responsereq_time?: number | null
        },
        dbInstance: any = Database
    ): Promise<void> {
        if (!responseReqId) return
        try {
            const updatePayload: any = {}
            if (data.responsereq_response !== undefined) updatePayload.responsereq_response = data.responsereq_response
            if (data.responsereq_prompt !== undefined) updatePayload.responsereq_prompt = data.responsereq_prompt
            if (data.responsereq_confidence !== undefined) updatePayload.responsereq_confidence = data.responsereq_confidence
            if (data.responsereq_time !== undefined) updatePayload.responsereq_time = data.responsereq_time

            await dbInstance
                .from('trx_response_req')
                .where('responsereq_id', responseReqId)
                .update(updatePayload)
        } catch (err: any) {
            console.warn('[TrxResponseAnswerController] Failed to update response in trx_response_req:', err.message)
        }
    }
}