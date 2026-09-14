import Application from '@ioc:Adonis/Core/Application'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import Database from '@ioc:Adonis/Lucid/Database'
import date from 'date-and-time'
import moment from 'moment'

const General = new GeneralRepository()

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
                    'c.case_name',
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

            // Ambil semua quest untuk case ini
            const quests = await Database.query()
                .from('data_case_quest')
                .where('casequest_case_id', trxResponse.response_case_id)
                .orderBy('casequest_order', 'asc')

            // Susun hasil per pos / quest
            const posResults: any[] = []
            for (const quest of quests) {
                let method = await General.getWhereRowObject('ref_method', { method_id: quest.casequest_method_id })

                const posData: any = {
                    casequest_id: quest.casequest_id,
                    casequest_name: quest.casequest_name,
                    casequest_method_id: quest.casequest_method_id,
                    method_name: method ? method.method_name : null,
                    casequest_order: quest.casequest_order,
                    answers: [],
                    total_score: 0,
                }

                switch (Number(quest.casequest_method_id)) {
                    case 1: { // Pos 1: IA (Intelligent Assistant)
                        let chats = await Database.query()
                            .select('responseia_text')
                            .from('trx_response_ia')
                            .where('responseia_response_id', responseId)
                            .where('responseia_casequest_id', quest.casequest_id)
                            .orderBy('responseia_id', 'asc')

                        // Selalu pastikan chat pertama merupakan pesan pembuka dari casequestia_initmsg
                        const iaConfig = await General.getWhereRowObject('data_case_quest_ia', { casequestia_casequest_id: quest.casequest_id })
                        if (iaConfig && iaConfig.casequestia_initmsg) {
                            const initMsgObj = { responseia_text: iaConfig.casequestia_initmsg }
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

                        posData.chats = chats
                        posData.triggers = triggers
                        posData.answers = { chats, triggers }
                        posData.total_score = triggers.reduce((sum: number, t: any) => sum + Number(t.responseiatrigger_score || 0), 0)
                        break
                    }

                    case 2: { // Pos 2: MC (Multiple Choice)
                        const mcAnswers = await Database.query()
                            .from('trx_response_mc as a')
                            .leftJoin('data_case_quest_mc as b', 'b.casequestmc_id', 'a.responsemc_casequestmc_id')
                            .where('a.responsemc_response_id', responseId)
                            .where('a.responsemc_casequest_id', quest.casequest_id)
                            .select('a.*', 'b.casequestmc_name')

                        posData.answers = mcAnswers
                        posData.total_score = mcAnswers.reduce((sum: number, a: any) => sum + Number(a.responsemc_score || 0), 0)
                        break
                    }

                    case 3: { // Pos 3: OS (Ordering Step)
                        const osAnswers = await Database.query()
                            .from('trx_response_os as a')
                            .leftJoin('data_case_quest_os as b', 'b.casequestos_id', 'a.responseos_casequestos_id')
                            .where('a.responseos_response_id', responseId)
                            .where('a.responseos_casequest_id', quest.casequest_id)
                            .orderBy('a.responseos_order', 'asc')
                            .select('a.*', 'b.casequestos_name', 'b.casequestos_order as correct_order')

                        posData.answers = osAnswers
                        posData.total_score = osAnswers.reduce((sum: number, a: any) => sum + Number(a.responseos_score || 0), 0)
                        break
                    }

                    case 4: { // Pos 4: CI (Clinical Inquiry / Image Choice)
                        const ciAnswers = await Database.query()
                            .from('trx_response_ci as a')
                            .leftJoin('data_case_quest_ci_option as b', 'b.casequestcioption_id', 'a.responseci_casequestcioption_id')
                            .where('a.responseci_response_id', responseId)
                            .where('a.responseci_casequest_id', quest.casequest_id)
                            .select('a.*', 'b.casequestcioption_code', 'b.casequestcioption_name')

                        posData.answers = ciAnswers
                        posData.total_score = ciAnswers.reduce((sum: number, a: any) => sum + Number(a.responseci_score || 0), 0)
                        break
                    }

                    case 5: { // Pos 5: Record
                        const recordAnswers = await Database.query()
                            .from('trx_response_record')
                            .where('responserecord_response_id', responseId)
                            .where('responserecord_casequest_id', quest.casequest_id)

                        posData.answers = recordAnswers
                        posData.total_score = 0
                        break
                    }

                    default:
                        break
                }

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
        const post = request.all()

        if (!post.response_id || !post.casequest_id) {
            return response.badRequest({
                status: false,
                message: 'response_id dan casequest_id wajib diisi.',
            })
        }

        const data_case_quest = await General.getWhereRowObject('data_case_quest', {
            casequest_id: post.casequest_id,
        })

        if (!data_case_quest) {
            return response.status(404).send({
                status: false,
                message: `Data quest dengan casequest_id ${post.casequest_id} tidak ditemukan.`,
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

            // B. Cek apakah post.text mengandung keyword pada tabel data_case_quest_ia_trigger
            const triggers = await dbInstance
                .query()
                .from('data_case_quest_ia_trigger')
                .where('casequestiatrigger_casequest_id', casequest_id)

            const lowerText = text.toLowerCase()
            let matchedTrigger: any = null

            if (triggers && triggers.length > 0) {
                for (const trg of triggers) {
                    if (trg.casequestiatrigger_key) {
                        const keys = String(trg.casequestiatrigger_key)
                            .split(',')
                            .map((k) => k.trim().toLowerCase())
                            .filter(Boolean)

                        const hasMatch = keys.some((k) => lowerText.includes(k)) || lowerText.includes(String(trg.casequestiatrigger_key).trim().toLowerCase())
                        if (hasMatch) {
                            matchedTrigger = trg
                            break
                        }
                    }
                }
            }

            let aiText = ''
            let savedTrigger: any = null

            if (matchedTrigger) {
                // Simpan ke tabel trx_response_ia_trigger
                const triggerInsert = {
                    responseiatrigger_response_id: response_id,
                    responseiatrigger_casequest_id: casequest_id,
                    responseiatrigger_trigger_id: matchedTrigger.casequestiatrigger_id,
                    responseiatrigger_score: matchedTrigger.casequestiatrigger_score ?? 0,
                }
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

                aiText = matchedTrigger.casequestiatrigger_response || 'Maaf bu bidan, saya kurang paham dengan pertanyaan tersebut. Apakah ada yang ingin ditanyakan terkait keluhan saya?'
            } else {
                // Default fallback jika tidak ditemukan keyword yang cocok
                aiText = 'Maaf bu bidan, saya kurang paham dengan pertanyaan tersebut. Apakah ada yang ingin ditanyakan terkait keluhan saya?'
            }

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
                is_trigger_matched: !!matchedTrigger
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
    // Pos 1: IA (Intelligent Assistant) — Simpan percakapan & keyword triggers
    // Body: {
    //   response_id: "1",
    //   casequest_id: "1",
    //   sender: 2,
    //   text: "Halo pasien",
    //   triggers: [ { trigger_id: 1, score: 10 } ]
    // }
    // =====================================================================
    public async storeIa({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            sender: schema.number.optional(),
            text: schema.string.optional(),
            triggers: schema.array.optional().members(
                schema.object().anyMembers()
            )
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

        const trx = await Database.transaction()
        try {
            let savedChat: any = null
            if (post.text) {
                savedChat = await this.saveChat({
                    response_id: responseId,
                    casequest_id: casequestId,
                    sender: post.sender || 2,
                    text: post.text,
                }, trx)
            }

            if (Array.isArray(post.triggers)) {
                for (const trg of post.triggers) {
                    await trx.insertQuery().table('trx_response_ia_trigger').insert({
                        responseiatrigger_response_id: responseId,
                        responseiatrigger_casequest_id: casequestId,
                        responseiatrigger_trigger_id: trg.trigger_id || trg.casequestiatrigger_id,
                        responseiatrigger_score: trg.score ?? trg.casequestiatrigger_score ?? 0,
                    })
                }
            }

            await this.syncTotalScore(responseId, trx)
            await trx.commit()

            return response.send({
                status: true,
                message: 'Data respon IA berhasil disimpan.',
                data: {
                    chat: savedChat,
                    triggers: post.triggers || [],
                },
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan jawaban IA.',
            })
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/mc
    // Pos 2: Multiple Choice — peserta memilih satu atau lebih opsi jawaban
    // Body: {
    //   response_id: "1",
    //   casequest_id: "2",
    //   answers: [casequestmc_id, casequestmc_id, ...] atau casequestmc_id
    // }
    // =====================================================================
    public async storeMc({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            answers: schema.array.optional().members(schema.any()),
            casequestmc_id: schema.string.optional(),
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

        let mcList: any[] = []
        if (Array.isArray(post.answers)) {
            mcList = post.answers
        } else if (post.casequestmc_id) {
            mcList = [post.casequestmc_id]
        } else if (post.answers) {
            mcList = [post.answers]
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

                const questMc = await trx
                    .query()
                    .from('data_case_quest_mc')
                    .where('casequestmc_id', casequestmcId)
                    .where('casequestmc_casequest_id', casequestId)
                    .first()

                if (!questMc) {
                    await trx.rollback()
                    return response.badRequest({
                        status: false,
                        message: `Pilihan jawaban dengan casequestmc_id ${casequestmcId} tidak valid untuk soal ini.`,
                    })
                }

                const score = Number(questMc.casequestmc_score || 0)
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
                    answers: insertedAnswers,
                },
            })
        } catch (error: any) {
            await trx.rollback()
            return response.badRequest({
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menyimpan jawaban MC.',
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
    //   ]
    // }
    // =====================================================================
    public async storeOs({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            answers: schema.array().members(
                schema.object().anyMembers()
            ),
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
    //   casequestcioption_id: "2"
    // }
    // =====================================================================
    public async storeCi({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            casequestcioption_id: schema.string.optional(),
            answers: schema.array.optional().members(schema.any()),
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

            await trx.commit()

            return response.send({
                status: true,
                message: 'Recording konsultasi berhasil disimpan.',
                data: {
                    response_id: responseId,
                    casequest_id: casequestId,
                    file: filePath,
                    size: size,
                    duration: duration,
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
}