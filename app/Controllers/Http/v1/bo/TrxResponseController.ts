import date from 'date-and-time'
import moment from 'moment'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs'
import path from 'path'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import TrxResponseRepository from 'App/Repositorys/v1/bo/TrxResponseRepository'
import DataCaseController from './DataCaseController'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const TrxResponse = new TrxResponseRepository()
const DataCase = new DataCaseController()

export default class TrxResponseController {
    public async index({ request, response }) {
        let data: any = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_contest', 'contest_id', 'contest_name', where);
        } else {
            data = await TrxResponse.getAll({ request });
            const rows = Array.isArray(data) ? data : (data.rows || []);

            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < rows.length; index++) {
                    rows[index].numb = (parseInt(request.only(['limit']).limit) * (data.currentPage - 1)) + index + 1;
                }
            }

            // Tambahkan status pengerjaan pos dan skor masing-masing pos untuk setiap respons
            for (let index = 0; index < rows.length; index++) {
                const item = rows[index];
                const posInfo = await this.getPosStatusAndScores(item.response_id, item.response_case_id);
                item.pos = posInfo.pos;
                item.pos_completed = posInfo.pos_completed;
                item.pos_completed_orders = posInfo.pos_completed_orders;
                item.pos_completed_names = posInfo.pos_completed_names;
                item.pos_completed_count = posInfo.pos_completed_count;
                item.pos_total_count = posInfo.pos_total_count;
                item.pos_progress = posInfo.pos_progress;
                item.pos_progress_text = posInfo.pos_progress_text;
                item.calculated_total_score = posInfo.calculated_total_score;
                if (item.response_total_score === null || item.response_total_score === undefined) {
                    item.response_total_score = posInfo.calculated_total_score;
                }
            }
        }

        if (typeof data.length != 'undefined' || data.data?.[0] || data.rows?.[0]) {
            result = {
                status: true,
                message: 'Success',
                data: data
            }
            response.send(result);
        } else {
            result = {
                status: false,
                message: 'Data not found !',
                data: data
            }
            response.status(404).send(result);
        }
    }

    public async detail({ request, params, response }) {
        let result: object = {};

        let data = await TrxResponse.getDetail(params.id);
        if (data) {
            data.contest_datestart = data.contest_datestart ? date.format(data.contest_datestart, 'YYYY-MM-DD') : null;
            data.contest_dateend = data.contest_dateend ? date.format(data.contest_dateend, 'YYYY-MM-DD') : null;
            data.scenario = await this.calculateGender(data.patient_gender) + '. ' + await this.calculateAge(data.patient_birthdate) + ' thn - LARASATI JOURNEY - ' + data.case_name;
            data.patient_code = 'PSN-00' + data.patient_id;
            data.patient_gender_text = data.patient_gender == 'M' || data.patient_gender == 'L' ? 'Laki-laki' : 'Perempuan';
            data.quest = await General.getWhereObject('data_case_quest', { casequest_case_id: data.response_case_id });
            if (Array.isArray(data.quest)) {
                for (let index = 0; index < data.quest.length; index++) {
                    const q = data.quest[index];
                    q.instruction = await this.buildPosInstruction(data.response_id, q.casequest_id, q.casequest_order);
                }
            }
            params.id = data.response_case_id;
            data.case = await DataCase.getDetailCase(params);
            data.answer = await this.getAnswer(data.response_id);
            result = {
                'status': true,
                'message': 'Success',
                'data': data
            }
            response.send(result);
        } else {
            result = {
                'status': false,
                'message': 'Data not found !'
            }
            response.status(404).send(result);
        }
    }

    public async store({ request, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            contest_id: schema.string([
                rules.minLength(1)
            ]),
            contestteam_id: schema.string([
                rules.minLength(1)
            ]),
            case_id: schema.string([
                rules.minLength(1)
            ]),
            patient_id: schema.string([
                rules.minLength(1)
            ]),
            is_submited: schema.number.optional(),
            is_submitted: schema.number.optional(),
            total_score: schema.number.optional(),
            ia: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            ia_trigger: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            record: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            mc: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            os: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            ci: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            answer: schema.array.optional().members(
                schema.object().anyMembers()
            )
        });

        try {
            let post = this.parseNestedKeys(request.all());
            await validator.validate({ schema: validationSchema, data: post });

            const trx = await Database.transaction();
            try {
                const isSubmitedVal = post.is_submited ?? post.is_submitted ?? post.response_is_submited ?? post.response_is_submitted ?? 0;
                let totalScore = post.total_score ?? post.response_total_score;

                // Hitung total_score dari input child jika tidak diberikan secara spesifik
                if (totalScore === undefined) {
                    let calcScore = 0;
                    if (Array.isArray(post.ia_trigger)) {
                        calcScore += post.ia_trigger.reduce((acc, curr) => acc + Number(curr.score || curr.responseiatrigger_score || 0), 0);
                    }
                    if (Array.isArray(post.mc)) {
                        calcScore += post.mc.reduce((acc, curr) => acc + Number(curr.score || curr.responsemc_score || 0), 0);
                    }
                    if (Array.isArray(post.os)) {
                        calcScore += post.os.reduce((acc, curr) => acc + Number(curr.score || curr.responseos_score || 0), 0);
                    }
                    if (Array.isArray(post.ci)) {
                        calcScore += post.ci.reduce((acc, curr) => acc + Number(curr.score || curr.responseci_score || 0), 0);
                    }
                    totalScore = calcScore;
                }

                // 1. Insert ke trx_response
                let data_insert: any = {
                    response_contest_id: post.contest_id || post.response_contest_id,
                    response_contestteam_id: post.contestteam_id || post.response_contestteam_id,
                    response_case_id: post.case_id || post.response_case_id,
                    response_patient_id: post.patient_id || post.response_patient_id,
                    response_is_submited: isSubmitedVal,
                    response_total_score: totalScore
                };

                let response_ids = await trx
                    .insertQuery()
                    .table('trx_response')
                    .insert(data_insert);
                const response_id = response_ids[0];

                const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

                // 2. Insert ke trx_response_ia
                if (Array.isArray(post.ia) && post.ia.length > 0) {
                    for (let index = 0; index < post.ia.length; index++) {
                        const item = post.ia[index];
                        let data_ia = {
                            responseia_response_id: response_id,
                            responseia_casequest_id: item.casequest_id || item.responseia_casequest_id,
                            responseia_sender: item.sender || item.responseia_sender,
                            responseia_text: item.text || item.responseia_text,
                            insert_timestamp: item.insert_timestamp || now
                        };
                        await trx.insertQuery().table('trx_response_ia').insert(data_ia);
                    }
                }

                // 3. Insert ke trx_response_ia_trigger
                if (Array.isArray(post.ia_trigger) && post.ia_trigger.length > 0) {
                    for (let index = 0; index < post.ia_trigger.length; index++) {
                        const item = post.ia_trigger[index];
                        let data_trigger = {
                            responseiatrigger_response_id: response_id,
                            responseiatrigger_casequest_id: item.casequest_id || item.responseiatrigger_casequest_id,
                            responseiatrigger_trigger_id: item.trigger_id || item.responseiatrigger_trigger_id,
                            responseiatrigger_score: item.score ?? item.responseiatrigger_score ?? 0
                        };
                        await trx.insertQuery().table('trx_response_ia_trigger').insert(data_trigger);
                    }
                }

                // 4. Insert ke trx_response_record
                if (Array.isArray(post.record) && post.record.length > 0) {
                    for (let index = 0; index < post.record.length; index++) {
                        const item = post.record[index];
                        let filePath = item.file || item.responserecord_file || null;

                        // Handle upload file jika dikirim via multipart
                        const allFiles = request.allFiles() as any;
                        const fileFromRequest =
                            request.file(`record[${index}][file]`) ||
                            request.file(`record.${index}.file`) ||
                            allFiles?.record?.[index]?.file ||
                            allFiles?.[`record[${index}][file]`] ||
                            allFiles?.[`record.${index}.file`];

                        if (fileFromRequest && fileFromRequest.isValid) {
                            const ext = fileFromRequest.extname || 'webm';
                            const fileName = `rec_${Date.now()}_${response_id}_${index}.${ext}`;
                            await fileFromRequest.move(Application.makePath('storage/recordings'), {
                                name: fileName,
                                overwrite: true
                            });
                            filePath = `storage/recordings/${fileName}`;
                        }

                        let data_record = {
                            responserecord_response_id: response_id,
                            responserecord_casequest_id: item.casequest_id || item.responserecord_casequest_id,
                            responserecord_file: filePath,
                            responserecord_size: item.size || item.responserecord_size || 0,
                            responserecord_duration: item.duration || item.responserecord_duration || 0
                        };
                        await trx.insertQuery().table('trx_response_record').insert(data_record);
                    }
                }

                // 5. Insert ke trx_response_mc
                if (Array.isArray(post.mc) && post.mc.length > 0) {
                    for (let index = 0; index < post.mc.length; index++) {
                        const item = post.mc[index];
                        let data_mc = {
                            responsemc_response_id: response_id,
                            responsemc_casequest_id: item.casequest_id || item.responsemc_casequest_id,
                            responsemc_casequestmc_id: item.casequestmc_id || item.responsemc_casequestmc_id,
                            responsemc_score: item.score ?? item.responsemc_score ?? 0,
                            insert_timestamp: item.insert_timestamp || now
                        };
                        await trx.insertQuery().table('trx_response_mc').insert(data_mc);
                    }
                }

                // 6. Insert ke trx_response_os
                if (Array.isArray(post.os) && post.os.length > 0) {
                    for (let index = 0; index < post.os.length; index++) {
                        const item = post.os[index];
                        let data_os = {
                            responseos_response_id: response_id,
                            responseos_casequest_id: item.casequest_id || item.responseos_casequest_id,
                            responseos_casequestos_id: item.casequestos_id || item.responseos_casequestos_id,
                            responseos_order: item.order ?? item.responseos_order ?? (index + 1),
                            responseos_score: item.score ?? item.responseos_score ?? 0,
                            insert_timestamp: item.insert_timestamp || now
                        };
                        await trx.insertQuery().table('trx_response_os').insert(data_os);
                    }
                }

                // 7. Insert ke trx_response_ci
                if (Array.isArray(post.ci) && post.ci.length > 0) {
                    for (let index = 0; index < post.ci.length; index++) {
                        const item = post.ci[index];
                        let data_ci = {
                            responseci_response_id: response_id,
                            responseci_casequest_id: item.casequest_id || item.responseci_casequest_id,
                            responseci_casequestcioption_id: item.casequestcioption_id || item.responseci_casequestcioption_id,
                            responseci_is_submited: item.is_submited ?? item.is_submitted ?? item.responseci_is_submited ?? 0,
                            responseci_score: item.score ?? item.responseci_score ?? 0
                        };
                        await trx.insertQuery().table('trx_response_ci').insert(data_ci);
                    }
                }

                // 8. Insert ke trx_response_answer
                if (Array.isArray(post.answer) && post.answer.length > 0) {
                    for (let index = 0; index < post.answer.length; index++) {
                        const item = post.answer[index];
                        const duration = parseInt(item.responseanswer_duration ?? item.duration ?? 0, 10) || 0;
                        let data_answer = {
                            responseanswer_response_id: response_id,
                            responseanswer_casequest_id: item.casequest_id || item.responseanswer_casequest_id,
                            responseanswer_submited: item.responseanswer_submited ?? item.submited ?? 1,
                            responseanswer_score: item.score ?? item.responseanswer_score ?? 0,
                            responseanswer_duration: duration
                        };
                        await trx.insertQuery().table('trx_response_answer').insert(data_answer);
                    }
                }

                result = {
                    status: true,
                    message: 'Success !',
                    data: {
                        response_id: response_id
                    }
                }
                response.send(result);
                await trx.commit();
            } catch (error) {
                result = {
                    status: false,
                    message: error.sqlMessage || error.message
                }
                response.badRequest(result);
                await trx.rollback();
            }
        } catch (error) {
            result = {
                status: false,
                message: error.messages?.errors?.[0]
                    ? `${error.messages.errors[0].field} ${error.messages.errors[0].message}`
                    : error.message || 'Validation failed'
            }
            response.badRequest(result);
        }
    }

    public async update({ request, params, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            contest_id: schema.string([
                rules.minLength(1)
            ]),
            contestteam_id: schema.string([
                rules.minLength(1)
            ]),
            case_id: schema.string([
                rules.minLength(1)
            ]),
            patient_id: schema.string([
                rules.minLength(1)
            ]),
            is_submited: schema.number.optional(),
            is_submitted: schema.number.optional(),
            total_score: schema.number.optional(),
            ia: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            ia_trigger: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            record: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            mc: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            os: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            ci: schema.array.optional().members(
                schema.object().anyMembers()
            ),
            answer: schema.array.optional().members(
                schema.object().anyMembers()
            )
        });

        try {
            let post = this.parseNestedKeys(request.all());
            await validator.validate({ schema: validationSchema, data: post });

            const trx = await Database.transaction();
            try {
                const response_id = params.id;
                const isSubmitedVal = post.is_submited ?? post.is_submitted ?? post.response_is_submited ?? post.response_is_submitted ?? 0;
                let totalScore = post.total_score ?? post.response_total_score;

                // Hitung total_score dari input child jika tidak diberikan secara spesifik
                if (totalScore === undefined) {
                    let calcScore = 0;
                    if (Array.isArray(post.ia_trigger)) {
                        calcScore += post.ia_trigger.reduce((acc, curr) => acc + Number(curr.score || curr.responseiatrigger_score || 0), 0);
                    }
                    if (Array.isArray(post.mc)) {
                        calcScore += post.mc.reduce((acc, curr) => acc + Number(curr.score || curr.responsemc_score || 0), 0);
                    }
                    if (Array.isArray(post.os)) {
                        calcScore += post.os.reduce((acc, curr) => acc + Number(curr.score || curr.responseos_score || 0), 0);
                    }
                    if (Array.isArray(post.ci)) {
                        calcScore += post.ci.reduce((acc, curr) => acc + Number(curr.score || curr.responseci_score || 0), 0);
                    }
                    totalScore = calcScore;
                }

                // 1. Update data header trx_response
                let where_update = { response_id: response_id };
                let data_update: any = {
                    response_contest_id: post.contest_id || post.response_contest_id,
                    response_contestteam_id: post.contestteam_id || post.response_contestteam_id,
                    response_case_id: post.case_id || post.response_case_id,
                    response_patient_id: post.patient_id || post.response_patient_id,
                    response_is_submited: isSubmitedVal,
                    response_total_score: totalScore
                };
                await trx.from('trx_response').where(where_update).update(data_update);

                const now = date.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

                // 2. Update / Re-insert trx_response_ia
                if (post.ia !== undefined) {
                    await trx.from('trx_response_ia').where('responseia_response_id', response_id).delete();
                    if (Array.isArray(post.ia) && post.ia.length > 0) {
                        for (let index = 0; index < post.ia.length; index++) {
                            const item = post.ia[index];
                            let data_ia = {
                                responseia_response_id: response_id,
                                responseia_casequest_id: item.casequest_id || item.responseia_casequest_id,
                                responseia_sender: item.sender || item.responseia_sender,
                                responseia_text: item.text || item.responseia_text,
                                insert_timestamp: item.insert_timestamp || now
                            };
                            await trx.insertQuery().table('trx_response_ia').insert(data_ia);
                        }
                    }
                }

                // 3. Update / Re-insert trx_response_ia_trigger
                if (post.ia_trigger !== undefined) {
                    await trx.from('trx_response_ia_trigger').where('responseiatrigger_response_id', response_id).delete();
                    if (Array.isArray(post.ia_trigger) && post.ia_trigger.length > 0) {
                        for (let index = 0; index < post.ia_trigger.length; index++) {
                            const item = post.ia_trigger[index];
                            let data_trigger = {
                                responseiatrigger_response_id: response_id,
                                responseiatrigger_casequest_id: item.casequest_id || item.responseiatrigger_casequest_id,
                                responseiatrigger_trigger_id: item.trigger_id || item.responseiatrigger_trigger_id,
                                responseiatrigger_score: item.score ?? item.responseiatrigger_score ?? 0
                            };
                            await trx.insertQuery().table('trx_response_ia_trigger').insert(data_trigger);
                        }
                    }
                }

                // 4. Update / Re-insert trx_response_record
                if (post.record !== undefined) {
                    // Cek file lama sebelum hapus record jika ingin menghapus berkas fisiknya
                    const oldRecords = await trx.from('trx_response_record').where('responserecord_response_id', response_id).select('responserecord_file');
                    for (const rec of oldRecords) {
                        if (rec.responserecord_file && rec.responserecord_file.startsWith('storage/')) {
                            const fullPath = Application.makePath(rec.responserecord_file);
                            if (fs.existsSync(fullPath)) {
                                try {
                                    fs.unlinkSync(fullPath);
                                } catch (e) {
                                    console.error('Error unlinking old recording:', e);
                                }
                            }
                        }
                    }

                    await trx.from('trx_response_record').where('responserecord_response_id', response_id).delete();
                    if (Array.isArray(post.record) && post.record.length > 0) {
                        for (let index = 0; index < post.record.length; index++) {
                            const item = post.record[index];
                            let filePath = item.file || item.responserecord_file || null;

                            const allFiles = request.allFiles() as any;
                            const fileFromRequest =
                                request.file(`record[${index}][file]`) ||
                                request.file(`record.${index}.file`) ||
                                allFiles?.record?.[index]?.file ||
                                allFiles?.[`record[${index}][file]`] ||
                                allFiles?.[`record.${index}.file`];

                            if (fileFromRequest && fileFromRequest.isValid) {
                                const ext = fileFromRequest.extname || 'webm';
                                const fileName = `rec_${Date.now()}_${response_id}_${index}.${ext}`;
                                await fileFromRequest.move(Application.makePath('storage/recordings'), {
                                    name: fileName,
                                    overwrite: true
                                });
                                filePath = `storage/recordings/${fileName}`;
                            }

                            let data_record = {
                                responserecord_response_id: response_id,
                                responserecord_casequest_id: item.casequest_id || item.responserecord_casequest_id,
                                responserecord_file: filePath,
                                responserecord_size: item.size || item.responserecord_size || 0,
                                responserecord_duration: item.duration || item.responserecord_duration || 0
                            };
                            await trx.insertQuery().table('trx_response_record').insert(data_record);
                        }
                    }
                }

                // 5. Update / Re-insert trx_response_mc
                if (post.mc !== undefined) {
                    await trx.from('trx_response_mc').where('responsemc_response_id', response_id).delete();
                    if (Array.isArray(post.mc) && post.mc.length > 0) {
                        for (let index = 0; index < post.mc.length; index++) {
                            const item = post.mc[index];
                            let data_mc = {
                                responsemc_response_id: response_id,
                                responsemc_casequest_id: item.casequest_id || item.responsemc_casequest_id,
                                responsemc_casequestmc_id: item.casequestmc_id || item.responsemc_casequestmc_id,
                                responsemc_score: item.score ?? item.responsemc_score ?? 0,
                                insert_timestamp: item.insert_timestamp || now
                            };
                            await trx.insertQuery().table('trx_response_mc').insert(data_mc);
                        }
                    }
                }

                // 6. Update / Re-insert trx_response_os
                if (post.os !== undefined) {
                    await trx.from('trx_response_os').where('responseos_response_id', response_id).delete();
                    if (Array.isArray(post.os) && post.os.length > 0) {
                        for (let index = 0; index < post.os.length; index++) {
                            const item = post.os[index];
                            let data_os = {
                                responseos_response_id: response_id,
                                responseos_casequest_id: item.casequest_id || item.responseos_casequest_id,
                                responseos_casequestos_id: item.casequestos_id || item.responseos_casequestos_id,
                                responseos_order: item.order ?? item.responseos_order ?? (index + 1),
                                responseos_score: item.score ?? item.responseos_score ?? 0,
                                insert_timestamp: item.insert_timestamp || now
                            };
                            await trx.insertQuery().table('trx_response_os').insert(data_os);
                        }
                    }
                }

                // 7. Update / Re-insert trx_response_ci
                if (post.ci !== undefined) {
                    await trx.from('trx_response_ci').where('responseci_response_id', response_id).delete();
                    if (Array.isArray(post.ci) && post.ci.length > 0) {
                        for (let index = 0; index < post.ci.length; index++) {
                            const item = post.ci[index];
                            let data_ci = {
                                responseci_response_id: response_id,
                                responseci_casequest_id: item.casequest_id || item.responseci_casequest_id,
                                responseci_casequestcioption_id: item.casequestcioption_id || item.responseci_casequestcioption_id,
                                responseci_is_submited: item.is_submited ?? item.is_submitted ?? item.responseci_is_submited ?? 0,
                                responseci_score: item.score ?? item.responseci_score ?? 0
                            };
                            await trx.insertQuery().table('trx_response_ci').insert(data_ci);
                        }
                    }
                }

                // 8. Update / Re-insert trx_response_answer
                if (typeof post.answer !== 'undefined') {
                    await trx.from('trx_response_answer').where('responseanswer_response_id', response_id).delete();
                    if (Array.isArray(post.answer) && post.answer.length > 0) {
                        for (let index = 0; index < post.answer.length; index++) {
                            const item = post.answer[index];
                            const duration = parseInt(item.responseanswer_duration ?? item.duration ?? 0, 10) || 0;
                            let data_answer = {
                                responseanswer_response_id: response_id,
                                responseanswer_casequest_id: item.casequest_id || item.responseanswer_casequest_id,
                                responseanswer_submited: item.responseanswer_submited ?? item.submited ?? 1,
                                responseanswer_score: item.score ?? item.responseanswer_score ?? 0,
                                responseanswer_duration: duration
                            };
                            await trx.insertQuery().table('trx_response_answer').insert(data_answer);
                        }
                    }
                }

                result = {
                    status: true,
                    message: 'Success !'
                }
                response.send(result);
                await trx.commit();
            } catch (error) {
                result = {
                    status: false,
                    message: error.sqlMessage || error.message
                }
                response.badRequest(result);
                await trx.rollback();
            }
        } catch (error) {
            result = {
                status: false,
                message: error.messages?.errors?.[0]
                    ? `${error.messages.errors[0].field} ${error.messages.errors[0].message}`
                    : error.message || 'Validation failed'
            }
            response.badRequest(result);
        }
    }

    public async destroy({ request, params, response }) {
        let result: object = {};

        const trx = await Database.transaction();
        try {
            const response_id = params.id;

            // 1. Hapus berkas fisik recording dari storage jika ada
            const records = await trx
                .from('trx_response_record')
                .where('responserecord_response_id', response_id)
                .select('responserecord_file');

            for (const rec of records) {
                if (rec.responserecord_file && rec.responserecord_file.startsWith('storage/')) {
                    const fullPath = Application.makePath(rec.responserecord_file);
                    if (fs.existsSync(fullPath)) {
                        try {
                            fs.unlinkSync(fullPath);
                        } catch (e) {
                            console.error('Error unlinking recording file:', e);
                        }
                    }
                }
            }

            // 2. Hapus semua child tables terkait response_id
            const iaRecords = await trx
                .from('trx_response_ia')
                .where('responseia_response_id', response_id)
                .select('responseia_id');

            if (iaRecords && iaRecords.length > 0) {
                const iaIds = iaRecords.map((r: any) => r.responseia_id);
                await trx.from('trx_response_req').whereIn('responsereq_responseia_id', iaIds).delete();
            }

            await trx.from('trx_response_ia').where('responseia_response_id', response_id).delete();
            await trx.from('trx_response_ia_trigger').where('responseiatrigger_response_id', response_id).delete();
            await trx.from('trx_response_record').where('responserecord_response_id', response_id).delete();
            await trx.from('trx_response_mc').where('responsemc_response_id', response_id).delete();
            await trx.from('trx_response_os').where('responseos_response_id', response_id).delete();
            await trx.from('trx_response_ci').where('responseci_response_id', response_id).delete();
            await trx.from('trx_response_answer').where('responseanswer_response_id', response_id).delete();

            // 3. Hapus data utama trx_response
            await trx
                .from('trx_response')
                .where('response_id', response_id)
                .delete();

            result = {
                status: true,
                message: 'Success !'
            }
            response.send(result);
            await trx.commit();
        } catch (error) {
            result = {
                status: false,
                message: error.sqlMessage || error.message || error.detail
            }
            response.badRequest(result);
            await trx.rollback();
        }
    }

    private async getAnswer(id) {
        // Ambil semua jawaban per pos/kategori berdasarkan response_id
        const ia = await Database.query()
            .from('trx_response_ia')
            .where('responseia_response_id', id)
            .orderBy('responseia_id', 'asc');

        const ia_trigger = await Database.query()
            .from('trx_response_ia_trigger as a')
            .leftJoin('data_case_quest_ia_trigger as b', 'b.casequestiatrigger_id', 'a.responseiatrigger_trigger_id')
            .where('a.responseiatrigger_response_id', id)
            .select('a.*', 'b.casequestiatrigger_name', 'b.casequestiatrigger_key', 'b.casequestiatrigger_response');

        const record = await Database.query()
            .from('trx_response_record')
            .where('responserecord_response_id', id);

        const mc = await Database.query()
            .from('trx_response_mc as a')
            .leftJoin('data_case_quest_mc as b', 'b.casequestmc_id', 'a.responsemc_casequestmc_id')
            .where('a.responsemc_response_id', id)
            .select('a.*', 'b.casequestmc_name', 'b.casequestmc_score as option_score');

        const os = await Database.query()
            .from('trx_response_os as a')
            .leftJoin('data_case_quest_os as b', 'b.casequestos_id', 'a.responseos_casequestos_id')
            .where('a.responseos_response_id', id)
            .orderBy('a.responseos_order', 'asc')
            .select('a.*', 'b.casequestos_name', 'b.casequestos_order as correct_order', 'b.casequestos_score as option_score');

        const ci = await Database.query()
            .from('trx_response_ci as a')
            .leftJoin('data_case_quest_ci_option as b', 'b.casequestcioption_id', 'a.responseci_casequestcioption_id')
            .where('a.responseci_response_id', id)
            .select('a.*', 'b.casequestcioption_code', 'b.casequestcioption_name', 'b.casequestcioption_score as option_score');

        const answer = await Database.query()
            .from('trx_response_answer')
            .where('responseanswer_response_id', id);

        return {
            ia,
            ia_trigger,
            record,
            mc,
            os,
            ci,
            answer
        };
    }

    private parseNestedKeys(obj: Record<string, any>) {
        const result: any = {};
        for (const key of Object.keys(obj)) {
            if (key.includes('[') && key.includes(']')) {
                const parts = key.replace(/\]/g, '').split(/\[|\./);
                let current = result;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    const isLast = i === parts.length - 1;
                    const nextPart = parts[i + 1];
                    const isNextNumber = !isNaN(Number(nextPart));

                    if (isLast) {
                        current[part] = obj[key];
                    } else {
                        if (current[part] === undefined) {
                            current[part] = isNextNumber ? [] : {};
                        }
                        current = current[part];
                    }
                }
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    }

    private async calculateAge(dateString: string): Promise<number> {
        const today = moment();
        const birthDate = moment(dateString);
        return today.diff(birthDate, 'years');
    }

    private async calculateGender(gender: string): Promise<string> {
        return gender == 'L' || gender == 'M' ? 'Tuan' : 'Ny';
    }

    private async secToMin(sec: number): Promise<string> {
        return (sec / 60).toFixed(0) + ' Menit';
    }



    /**
     * GET /v1/trx_response/:id/instruction
     * GET /v1/trx_response/:id/rule
     * Menampilkan data aturan dan instruksi pos yang sudah dirender sesuai skenario dan pasien
     */
    public async instruction({ request, params, response }) {
        const responseId = params.id || request.input('response_id') || request.input('id');
        const casequestId = request.input('casequest_id') || request.input('quest_id');
        const posOrder = request.input('pos') || request.input('order');

        if (!responseId) {
            return response.badRequest({
                status: false,
                message: 'Parameter response_id wajib disertakan.'
            });
        }

        const data = await this.buildPosInstruction(responseId, casequestId, posOrder ? Number(posOrder) : undefined);
        if (data) {
            return response.send({
                status: true,
                message: 'Success',
                data: data
            });
        } else {
            return response.status(404).send({
                status: false,
                message: 'Data instruksi pos tidak ditemukan.'
            });
        }
    }

    /**
     * Helper: Membangun struktur instruksi pos terpadu (Header, Skeleton, Langkah, Skenario Klinis, Footer)
     */
    public async buildPosInstruction(responseId: string | number, casequestId?: string | number, posOrder?: number) {
        // 1. Ambil data response
        const trxResponse = await General.getWhereRowObject('trx_response', { response_id: responseId });
        if (!trxResponse) return null;

        // 2. Ambil data case
        const caseData = await General.getWhereRowObject('data_case', { case_id: trxResponse.response_case_id });

        // 3. Ambil data patient
        let patient: any = null;
        if (trxResponse.response_patient_id) {
            patient = await General.getWhereRowObject('data_patient', { patient_id: trxResponse.response_patient_id });
        }
        if (!patient) {
            const cp = await Database.query()
                .from('data_case_patient as cp')
                .join('data_patient as p', 'p.patient_id', 'cp.casepatient_patient_id')
                .where('cp.casepatient_case_id', trxResponse.response_case_id)
                .first();
            if (cp) patient = cp;
        }

        // 4. Cari quest
        let questQuery = Database.query()
            .from('data_case_quest')
            .where('casequest_case_id', trxResponse.response_case_id);

        if (casequestId) {
            questQuery = questQuery.where('casequest_id', casequestId);
        } else if (posOrder) {
            questQuery = questQuery.where('casequest_order', posOrder);
        } else {
            questQuery = questQuery.orderBy('casequest_order', 'asc');
        }

        const quest = await questQuery.first();
        if (!quest) return null;

        // 5. Method info & rules
        const method = await General.getWhereRowObject('ref_method', { method_id: quest.casequest_method_id });
        const rawRules = await Database.query()
            .from('ref_method_rule')
            .where('methodrule_method_id', quest.casequest_method_id)
            .orderBy('methodrule_order', 'asc');

        for (let r of rawRules) {
            r.detail = await Database.query()
                .from('ref_method_rule_detail')
                .where('methodruledetail_methodrule_id', r.methodrule_id)
                .orderBy('methodruledetail_order', 'asc');
        }

        // 6. Siapkan variabel interpolasi
        const patientName = patient ? patient.patient_name : 'Pasien';
        const patientAge = patient?.patient_birthdate ? `${await this.calculateAge(patient.patient_birthdate)} Tahun` : '';
        const patientTitle = patient?.patient_gender ? await this.calculateGender(patient.patient_gender) : 'Ny';
        const patientDisplay = patientAge ? `${patientName} (${patientAge})` : patientName;
        const durationMin = quest.casequest_limit_time ? Math.round(quest.casequest_limit_time / 60) : 3;
        const durationText = `${durationMin} Menit`;
        const posOrderNum = quest.casequest_order || 1;

        const templateVars: Record<string, string> = {
            '{{patient_name}}': patientName,
            '{{patient_age}}': patientAge,
            '{{patient_title}}': patientTitle,
            '{{patient_name_age}}': patientDisplay,
            '{{limit_time}}': durationText,
            '{{case_name}}': caseData?.case_name || '',
            '{{case_desc}}': caseData?.case_desc || '',
        };

        const renderText = (text: string) => {
            if (!text) return text;
            let res = text;
            for (const [k, v] of Object.entries(templateVars)) {
                res = res.split(k).join(v);
            }
            return res;
        };

        // Render rules
        const renderedRules = rawRules.map((r: any) => ({
            ...r,
            methodrule_text: renderText(r.methodrule_text),
            detail: (r.detail || []).map((d: any) => ({
                ...d,
                methodruledetail_text: renderText(d.methodruledetail_text),
            }))
        }));

        // IA / method specific preview
        let iaData: any = null;
        if (Number(quest.casequest_method_id) === 1) {
            iaData = await General.getWhereRowObject('data_case_quest_ia', { casequestia_casequest_id: quest.casequest_id });
        }

        // 7. Bangun struktur section sesuai UI
        const sections: any[] = [];

        // Section 1: Simulasi Visual & Target Aksi (Skeleton)
        let samplePatientMsg = iaData?.casequestia_initmsg || "Saya sering keputihan berbau dan keluar flek setelah senggama...";
        let sampleBidanMsg = "Kapan HPHT terakhir dan apakah siklus haid teratur?";
        let inputAction = "[Bicara via Mikrofon]";

        if (Number(quest.casequest_method_id) === 2) {
            inputAction = "[Pilih Satu atau Beberapa Jawaban]";
        } else if (Number(quest.casequest_method_id) === 3) {
            inputAction = "[Urutkan Langkah Sesuai Prosedur]";
        } else if (Number(quest.casequest_method_id) === 4) {
            inputAction = "[Pilih Gambar & Temuan Klinis]";
        } else if (Number(quest.casequest_method_id) === 5) {
            inputAction = "[Rekam Suara Konsultasi]";
        }

        const skeletonRule = renderedRules.find((r: any) => r.methodrule_order === 1 || r.methodrule_text?.toLowerCase().includes('simulasi')) || renderedRules[0];
        const skeletonSubtitle = skeletonRule?.methodrule_text || (method?.method_name ? `Simulasi ${method.method_name}` : "Simulasi Wawancara Pasien");

        sections.push({
            order: 1,
            title: "1. SIMULASI VISUAL & TARGET AKSI (SKELETON):",
            type: "skeleton",
            skeleton: {
                title: skeletonSubtitle,
                badge: Number(quest.casequest_method_id) === 1 ? "Siklus Respons Lisan" : "Target Aksi Pos",
                patient: {
                    name: patientName,
                    age: patientAge,
                    display: patientDisplay,
                    action: Number(quest.casequest_method_id) === 1 ? "Wawancara" : "Pemeriksaan",
                    gender: patient?.patient_gender === 'M' || patient?.patient_gender === 'L' ? 'Laki-laki' : 'Perempuan',
                    photo: patient?.patient_photo || null,
                    photo_path: patient?.patient_photo_path || null
                },
                preview_dialog: {
                    patient: samplePatientMsg,
                    bidan: sampleBidanMsg,
                    input_action: inputAction
                }
            }
        });

        // Section 2: Langkah-langkah Pengerjaan Pos
        const stepRule = renderedRules.find((r: any) => r.methodrule_order === 2 || r.methodrule_text?.toLowerCase().includes('langkah')) || renderedRules[1];
        const stepDetails = stepRule?.detail || [];

        const defaultSteps = [
            "Pastikan mikrofon aktif dan bicaralah secara jelas menghadap layar.",
            "Gali keluhan utama keputihan, siklus HPHT, paritas, dan riwayat perdarahan kontak.",
            `Simak respons lisan dan pantau teks transkrip dari pasien virtual ${patientName}.`
        ];

        const steps = stepDetails.length > 0
            ? stepDetails.map((d: any, idx: number) => ({
                number: d.methodruledetail_order || (idx + 1),
                text: d.methodruledetail_text
            }))
            : defaultSteps.map((txt, idx) => ({ number: idx + 1, text: txt }));

        sections.push({
            order: 2,
            title: "2. LANGKAH-LANGKAH PENGERJAAN POS:",
            type: "steps",
            steps: steps,
            instruction_note: {
                label: "Petunjuk Penggunaan:",
                text: Number(quest.casequest_method_id) === 1
                    ? "Bicaralah secara langsung melalui mikrofon atau ketik pesan. Pasien akan menjawab setiap pertanyaan Anda secara berurutan."
                    : "Pilihlah jawaban dan selesaikan seluruh instruksi pada pos ini sebelum batas waktu berakhir."
            }
        });

        // Section 3: Instruksi Skenario Kasus Klinis
        const scenarioRule = renderedRules.find((r: any) => r.methodrule_order === 3 || r.methodrule_text?.toLowerCase().includes('skenario')) || renderedRules[2];
        const scenarioText = scenarioRule?.detail?.[0]?.methodruledetail_text || scenarioRule?.methodrule_text || `Gali data anamnesis ${patientName} secara lengkap dan komunikatif melalui percakapan bertahap seputar kesehatan reproduksi pasien.`;

        sections.push({
            order: 3,
            title: "3. INSTRUKSI SKENARIO KASUS KLINIS:",
            type: "scenario",
            content: scenarioText
        });

        return {
            header: {
                pos_badge: `INSTRUKSI POS ${posOrderNum}`,
                pos_order: posOrderNum,
                code: `AMP-ANM-A${posOrderNum}`,
                duration_seconds: quest.casequest_limit_time || (durationMin * 60),
                duration_text: durationText,
                title: quest.casequest_name || `Pos ${posOrderNum}: ${method?.method_name || 'Anamnesis Pasien'}`,
                subtitle: "Pelajari 3 instruksi terpadu (animasi simulasi, tata cara langkah, dan petunjuk kasus) sebelum memulai."
            },
            case: {
                case_id: caseData?.case_id,
                case_name: caseData?.case_name,
                case_desc: caseData?.case_desc
            },
            patient: {
                patient_id: patient?.patient_id,
                patient_name: patientName,
                patient_age: patientAge,
                patient_display: patientDisplay,
                patient_gender: patient?.patient_gender,
                patient_photo: patient?.patient_photo,
                patient_photo_path: patient?.patient_photo_path
            },
            quest: {
                casequest_id: quest.casequest_id,
                casequest_name: quest.casequest_name,
                casequest_method_id: quest.casequest_method_id,
                method_name: method?.method_name,
                casequest_order: quest.casequest_order,
                casequest_limit_time: quest.casequest_limit_time
            },
            sections: sections,
            rules: renderedRules,
            footer: {
                notice: "Timer stase berjalan setelah tombol ditekan.",
                button_text: "MULAI PENGERJAAN POS"
            }
        };
    }

    /**
     * Helper: Mendapatkan status pengerjaan pos (selesai / belum) dan skor masing-masing pos
     */
    public async getPosStatusAndScores(responseId: number | string, caseId?: number | string) {
        if (!responseId) {
            return {
                pos: [],
                pos_completed: [],
                pos_completed_orders: [],
                pos_completed_names: [],
                pos_completed_count: 0,
                pos_total_count: 0,
                pos_progress: '0/0',
                pos_progress_text: '0 dari 0 Pos Selesai',
                calculated_total_score: 0,
            };
        }

        // Jika caseId belum diberikan, ambil dari tabel trx_response
        if (!caseId) {
            const resp = await Database.query().from('trx_response').where('response_id', responseId).select('response_case_id').first();
            caseId = resp?.response_case_id;
        }

        if (!caseId) {
            return {
                pos: [],
                pos_completed: [],
                pos_completed_orders: [],
                pos_completed_names: [],
                pos_completed_count: 0,
                pos_total_count: 0,
                pos_progress: '0/0',
                pos_progress_text: '0 dari 0 Pos Selesai',
                calculated_total_score: 0,
            };
        }

        // 1. Ambil daftar pos/quest untuk kasus ini
        const quests = await Database.query()
            .from('data_case_quest as a')
            .leftJoin('ref_method as b', 'b.method_id', 'a.casequest_method_id')
            .where('a.casequest_case_id', caseId)
            .orderBy('a.casequest_order', 'asc')
            .select([
                'a.casequest_id',
                'a.casequest_case_id',
                'a.casequest_name',
                'a.casequest_method_id',
                'a.casequest_order',
                'a.casequest_limit_time',
                'b.method_name'
            ]);

        if (!quests || quests.length === 0) {
            return {
                pos: [],
                pos_completed: [],
                pos_completed_orders: [],
                pos_completed_names: [],
                pos_completed_count: 0,
                pos_total_count: 0,
                pos_progress: '0/0',
                pos_progress_text: '0 dari 0 Pos Selesai',
                calculated_total_score: 0,
            };
        }

        // 2. Ambil seluruh data jawaban per metode secara paralel untuk response_id ini
        const [iaTriggers, iaChats, mcList, osList, ciList, recordList] = await Promise.all([
            Database.query()
                .from('trx_response_ia_trigger')
                .where('responseiatrigger_response_id', responseId)
                .select('responseiatrigger_casequest_id', 'responseiatrigger_score'),
            Database.query()
                .from('trx_response_ia')
                .where('responseia_response_id', responseId)
                .select('responseia_casequest_id', 'responseia_sender'),
            Database.query()
                .from('trx_response_mc')
                .where('responsemc_response_id', responseId)
                .select('responsemc_casequest_id', 'responsemc_score'),
            Database.query()
                .from('trx_response_os')
                .where('responseos_response_id', responseId)
                .select('responseos_casequest_id', 'responseos_score'),
            Database.query()
                .from('trx_response_ci')
                .where('responseci_response_id', responseId)
                .select('responseci_casequest_id', 'responseci_score', 'responseci_is_submited'),
            Database.query()
                .from('trx_response_record')
                .where('responserecord_response_id', responseId)
                .select('responserecord_casequest_id')
        ]);

        const posResults: any[] = [];

        for (const quest of quests) {
            const questId = quest.casequest_id;
            const methodId = Number(quest.casequest_method_id);
            let isCompleted = false;
            let posScore = 0;

            switch (methodId) {
                case 1: { // Pos 1: IA (Wawancara Pasien / Chat)
                    const triggers = iaTriggers.filter((t: any) => t.responseiatrigger_casequest_id == questId);
                    const chats = iaChats.filter((c: any) => c.responseia_casequest_id == questId);
                    posScore = triggers.reduce((acc: number, curr: any) => acc + Number(curr.responseiatrigger_score || 0), 0);
                    const participantChats = chats.filter((c: any) => Number(c.responseia_sender) === 2);
                    isCompleted = participantChats.length > 0 || triggers.length > 0 || chats.length > 0;
                    break;
                }

                case 2: { // Pos 2: MC (Multiple Choice)
                    const answers = mcList.filter((m: any) => m.responsemc_casequest_id == questId);
                    posScore = answers.reduce((acc: number, curr: any) => acc + Number(curr.responsemc_score || 0), 0);
                    isCompleted = answers.length > 0;
                    break;
                }

                case 3: { // Pos 3: OS (Ordering Step)
                    const answers = osList.filter((o: any) => o.responseos_casequest_id == questId);
                    posScore = answers.reduce((acc: number, curr: any) => acc + Number(curr.responseos_score || 0), 0);
                    isCompleted = answers.length > 0;
                    break;
                }

                case 4: { // Pos 4: CI (Clinical Inquiry / Image Choice)
                    const answers = ciList.filter((c: any) => c.responseci_casequest_id == questId);
                    posScore = answers.reduce((acc: number, curr: any) => acc + Number(curr.responseci_score || 0), 0);
                    isCompleted = answers.length > 0;
                    break;
                }

                case 5: { // Pos 5: Record
                    const answers = recordList.filter((r: any) => r.responserecord_casequest_id == questId);
                    posScore = 0;
                    isCompleted = answers.length > 0;
                    break;
                }

                default: {
                    break;
                }
            }

            posResults.push({
                casequest_id: quest.casequest_id,
                casequest_order: quest.casequest_order,
                pos_order: quest.casequest_order,
                casequest_name: quest.casequest_name,
                pos_name: quest.casequest_name || `Pos ${quest.casequest_order}: ${quest.method_name || ''}`,
                casequest_method_id: quest.casequest_method_id,
                method_name: quest.method_name || null,
                is_completed: isCompleted,
                status_text: isCompleted ? 'Selesai' : 'Belum Selesai',
                score: posScore,
            });
        }

        const completedPos = posResults.filter((p) => p.is_completed);
        const completedOrders = completedPos.map((p) => p.pos_order);
        const completedNames = completedPos.map((p) => p.pos_name);
        const totalScore = posResults.reduce((sum, p) => sum + Number(p.score || 0), 0);

        return {
            pos: posResults,
            pos_completed: completedPos,
            pos_completed_orders: completedOrders,
            pos_completed_names: completedNames,
            pos_completed_count: completedPos.length,
            pos_total_count: posResults.length,
            pos_progress: `${completedPos.length}/${posResults.length}`,
            pos_progress_text: `${completedPos.length} dari ${posResults.length} Pos Selesai`,
            calculated_total_score: totalScore,
        };
    }
}