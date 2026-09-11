import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import TrxResponseAnswerRepository from 'App/Repositorys/v1/bo/TrxResponseAnswerRepository'
import Database from '@ioc:Adonis/Lucid/Database'
import moment from 'moment'

const General = new GeneralRepository()
const TrxResponseAnswer = new TrxResponseAnswerRepository()

export default class TrxResponseAnswerController {

    // =====================================================================
    // GET /v1/trx_response_answer/:response_id
    // Menampilkan semua jawaban per response_id (semua pos)
    // =====================================================================
    public async detail({ params, response }) {
        const responseId = params.id

        try {
            // Ambil info trx_response (header)
            const trxResponse = await Database.query()
                .select([
                    'a.response_id',
                    'a.response_case_id',
                    'a.response_patient_id',
                    'a.response_contestteam_id',
                    'a.response_total_score',
                    // 'a.response_is_submitted',
                    'p.patient_name',
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

            // Ambil semua quest untuk case ini
            const quests = await General.getWhereObject(
                'data_case_quest',
                { casequest_case_id: trxResponse.response_case_id },
            )

            // Susun hasil per pos / quest
            const posResults: any[] = []
            for (const quest of quests) {
                const posData: any = {
                    casequest_id: quest.casequest_id,
                    casequest_name: quest.casequest_name,
                    casequest_method_id: quest.casequest_method_id,
                    casequest_order: quest.casequest_order,
                    answers: [],
                    total_score: 0,
                }

                switch (quest.casequest_method_id) {
                    case 1: // IA - ambil dari trx_response_ia
                        posData.answers = await Database.query()
                            .select(['responseia_id', 'responseia_sender', 'responseia_text', 'insert_timestamp'])
                            .from('trx_response_ia')
                            .where('responseia_response_id', responseId)
                            .where('responseia_casequest_id', quest.casequest_id)
                            .orderBy('responseia_id', 'asc')
                        break

                    case 2: // MC - ambil dari trx_response_answer_mc
                        posData.answers = await TrxResponseAnswer.getAnswerMc(responseId, quest.casequest_id)
                        posData.total_score = posData.answers.reduce(
                            (sum: number, a: any) => sum + Number(a.responseanswermс_score || 0),
                            0
                        )
                        break

                    case 3: // OS - ambil dari trx_response_answer_os
                        posData.answers = await TrxResponseAnswer.getAnswerOs(responseId, quest.casequest_id)
                        posData.total_score = posData.answers.reduce(
                            (sum: number, a: any) => sum + Number(a.responseansweros_score || 0),
                            0
                        )
                        break

                    case 4: // CI - ambil dari trx_response_answer
                        posData.answers = await TrxResponseAnswer.getAnswerCi(responseId, quest.casequest_id)
                        posData.total_score = posData.answers.reduce(
                            (sum: number, a: any) => sum + Number(a.responseanswer_score || 0),
                            0
                        )
                        break

                    default:
                        posData.answers = await TrxResponseAnswer.getAnswerGeneral(responseId, quest.casequest_id)
                        break
                }

                posResults.push(posData)
            }

            // Hitung total keseluruhan skor
            const scoreBreakdown = await TrxResponseAnswer.getTotalScore(responseId)

            return response.send({
                status: true,
                message: 'Success',
                data: {
                    response_id: trxResponse.response_id,
                    patient_name: trxResponse.patient_name,
                    case_name: trxResponse.case_name,
                    // response_is_submitted: trxResponse.response_is_submitted,
                    response_total_score: trxResponse.response_total_score,
                    score_breakdown: scoreBreakdown,
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

    public async store({ request, response }) {
        let post = request.body();
        let where = { casequest_id: post.casequest_id };
        let data_case_quest = await General.getWhereRowObject('data_case_quest', where);
        switch (data_case_quest.casequest_method_id) {
            case '1':
                return false;
                break;

            case 2:
                return await this.storeMc({ request, response });
                break;

            case 3:
                return await this.storeOs({ request, response });
                break;

            case 4:
                return await this.storeCi({ request, response });
                break;

            default:
                break;
        }
    }

    // =====================================================================
    // POST /v1/trx_response_answer/mc
    // Pos 2: Multiple Choice — peserta memilih satu atau lebih jawaban
    //
    // Body: {
    //   response_id: "1",
    //   casequest_id: "2",
    //   answers: [casequestmc_id, casequestmc_id, ...]
    // }
    // =====================================================================
    public async storeMc({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            answers: schema.array().members(schema.string()),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
            })
        }

        const post = request.body()
        const responseId = post.response_id
        const casequestId = post.casequest_id
        const answers: string[] = post.answers

        const trx = await Database.transaction()
        try {
            // 1. Validasi response_id ada
            const trxResponse = await trx
                .query()
                .from('trx_response')
                .where('response_id', responseId)
                .first()

            if (!trxResponse) {
                await trx.rollback()
                return response.status(404).send({
                    status: false,
                    message: `response_id ${responseId} tidak ditemukan.`,
                })
            }

            // 2. Hapus jawaban MC lama untuk response_id + casequest_id ini (replace mode)
            await trx
                .from('trx_response_answer_mc')
                .where('responseanswermc_response_id', responseId)
                .where('responseanswermc_casequest_id', casequestId)
                .delete()

            // 3. Simpan setiap pilihan jawaban MC
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            let totalScore = 0
            const insertedAnswers: any[] = []

            for (const casequestmcId of answers) {
                // Ambil data soal MC untuk mendapatkan skor
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

                const score = Number(questMc.casequestmc_score_correct || 0)
                totalScore += score

                await trx.insertQuery().table('trx_response_answer_mc').insert({
                    responseanswermc_response_id: responseId,
                    responseanswermc_casequest_id: casequestId,
                    responseanswermc_casequestmc_id: casequestmcId,
                    responseanswermс_score: score,
                    insert_timestamp: now,
                })

                insertedAnswers.push({
                    casequestmc_id: casequestmcId,
                    casequestmc_name: questMc.casequestmc_name,
                    score: score,
                })
            }

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
    // Pos 3: Ordering — peserta mengurutkan jawaban
    //
    // Body: {
    //   response_id: "1",
    //   casequest_id: "3",
    //   answers: [
    //     { casequestos_id: "1", user_order: 1 },
    //     { casequestos_id: "2", user_order: 3 },
    //     { casequestos_id: "3", user_order: 2 },
    //   ]
    // }
    // =====================================================================
    public async storeOs({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            answers: schema.array().members(
                schema.object().members({
                    casequestos_id: schema.string([rules.minLength(1)]),
                    user_order: schema.number(),
                })
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

        const post = request.body()
        const responseId = post.response_id
        const casequestId = post.casequest_id
        const answers: { casequestos_id: string; user_order: number }[] = post.answers

        const trx = await Database.transaction()
        try {
            // 1. Validasi response_id ada
            const trxResponse = await trx
                .query()
                .from('trx_response')
                .where('response_id', responseId)
                .first()

            if (!trxResponse) {
                await trx.rollback()
                return response.status(404).send({
                    status: false,
                    message: `response_id ${responseId} tidak ditemukan.`,
                })
            }

            // 2. Hapus jawaban OS lama (replace mode)
            await trx
                .from('trx_response_answer_os')
                .where('responseansweros_response_id', responseId)
                .where('responseansweros_casequest_id', casequestId)
                .delete()

            // 3. Simpan setiap jawaban OS dengan perbandingan urutan
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            let totalScore = 0
            const insertedAnswers: any[] = []

            for (const answer of answers) {
                // Ambil data soal OS untuk mendapatkan urutan yang benar dan skor
                const questOs = await trx
                    .query()
                    .from('data_case_quest_os')
                    .where('casequestos_id', answer.casequestos_id)
                    .where('casequestos_casequest_id', casequestId)
                    .first()

                if (!questOs) {
                    await trx.rollback()
                    return response.badRequest({
                        status: false,
                        message: `Jawaban dengan casequestos_id ${answer.casequestos_id} tidak valid untuk soal ini.`,
                    })
                }

                // Bandingkan urutan user dengan urutan yang benar
                const isCorrectOrder = Number(answer.user_order) === Number(questOs.casequestos_order)
                const score = isCorrectOrder
                    ? Number(questOs.casequestos_score_correct || 0)
                    : Number(questOs.casequestos_score_incorrect || 0) // bisa minus

                totalScore += score

                await trx.insertQuery().table('trx_response_answer_os').insert({
                    responseansweros_response_id: responseId,
                    responseansweros_casequest_id: casequestId,
                    responseansweros_casequestos_id: answer.casequestos_id,
                    responseansweros_order: answer.user_order,
                    responseansweros_score: score,
                    insert_timestamp: now,
                })

                insertedAnswers.push({
                    casequestos_id: answer.casequestos_id,
                    casequestos_name: questOs.casequestos_name,
                    correct_order: questOs.casequestos_order,
                    user_order: answer.user_order,
                    is_correct: isCorrectOrder,
                    score: score,
                })
            }

            await trx.commit()

            return response.send({
                status: true,
                message: 'Jawaban Ordering berhasil disimpan.',
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
    // Pos 4: Image Choice — peserta memilih satu gambar sebagai jawaban
    //
    // Body: {
    //   response_id: "1",
    //   casequest_id: "4",
    //   casequestci_id: "2"
    // }
    // =====================================================================
    public async storeCi({ request, response }) {
        const validationSchema = schema.create({
            response_id: schema.string([rules.minLength(1)]),
            casequest_id: schema.string([rules.minLength(1)]),
            casequestci_id: schema.string([rules.minLength(1)]),
        })

        try {
            await request.validate({ schema: validationSchema })
        } catch (validationError: any) {
            return response.badRequest({
                status: false,
                message: validationError.messages?.errors?.[0]?.field + ' ' + validationError.messages?.errors?.[0]?.message,
            })
        }

        const post = request.body()
        const responseId = post.response_id
        const casequestId = post.casequest_id
        const casequestciId = post.casequestci_id

        const trx = await Database.transaction()
        try {
            // 1. Validasi response_id ada
            const trxResponse = await trx
                .query()
                .from('trx_response')
                .where('response_id', responseId)
                .first()

            if (!trxResponse) {
                await trx.rollback()
                return response.status(404).send({
                    status: false,
                    message: `response_id ${responseId} tidak ditemukan.`,
                })
            }

            // 2. Validasi pilihan gambar valid
            const questCi = await trx
                .query()
                .from('data_case_quest_ci')
                .where('casequestci_id', casequestciId)
                .where('casequestci_casequest_id', casequestId)
                .first()

            if (!questCi) {
                await trx.rollback()
                return response.badRequest({
                    status: false,
                    message: `Pilihan gambar dengan casequestci_id ${casequestciId} tidak valid untuk soal ini.`,
                })
            }

            // 3. Hapus jawaban CI lama untuk soal ini (hanya boleh 1 pilihan, replace mode)
            await trx
                .from('trx_response_answer')
                .where('responseanswer_response_id', responseId)
                .where('responseanswer_casequest_id', casequestId)
                .delete()

            // 4. Simpan jawaban CI ke trx_response_answer
            const score = Number(questCi.casequestci_score_correct || 0)
            const now = moment().format('YYYY-MM-DD HH:mm:ss')

            await trx.insertQuery().table('trx_response_answer').insert({
                responseanswer_response_id: responseId,
                responseanswer_casequest_id: casequestId,
                responseanswer_is_submited: 1,
                responseanswer_score: score,
                insert_timestamp: now,
            })

            await trx.commit()

            return response.send({
                status: true,
                message: 'Jawaban Image Choice berhasil disimpan.',
                data: {
                    response_id: responseId,
                    casequest_id: casequestId,
                    casequestci_id: casequestciId,
                    casequestci_name: questCi.casequestci_name,
                    casequestci_image: questCi.casequestci_image,
                    score: score,
                    hint: questCi.casequestci_desc || null,
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
    // POST /v1/trx_response_answer/submit
    // Submit final: tandai response sebagai submitted & hitung total skor
    //
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

        const post = request.body()
        const responseId = post.response_id

        try {
            // Hitung total skor dari semua pos
            const scoreBreakdown = await TrxResponseAnswer.getTotalScore(responseId)

            // Update trx_response: set is_submitted = 1, total_score
            await Database.from('trx_response')
                .where('response_id', responseId)
                .update({
                    response_total_score: scoreBreakdown.total,
                    response_is_submitted: 1,
                    update_timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
                })

            return response.send({
                status: true,
                message: 'Response berhasil disubmit.',
                data: {
                    response_id: responseId,
                    score_breakdown: scoreBreakdown,
                    total_score: scoreBreakdown.total,
                },
            })
        } catch (error: any) {
            return response.badRequest({
                status: false,
                message: error.message || 'Gagal submit response.',
            })
        }
    }
}