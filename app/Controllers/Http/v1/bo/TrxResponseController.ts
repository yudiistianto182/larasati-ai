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
const DataCase = new DataCaseController();

export default class TrxResponseController {
    public async index({ request, response }) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_contest', 'contest_id', 'contest_name', where);
        } else {
            data = await TrxResponse.getAll({ request });
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * (data.currentPage - 1)) + index + 1;
                }
            } else {
                for (let index = 0; index < data.length; index++) {
                }
            }
        }

        if (typeof data.length != 'undefined' || data.data[0]) {
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
            await trx.from('trx_response_ia').where('responseia_response_id', response_id).delete();
            await trx.from('trx_response_ia_trigger').where('responseiatrigger_response_id', response_id).delete();
            await trx.from('trx_response_record').where('responserecord_response_id', response_id).delete();
            await trx.from('trx_response_mc').where('responsemc_response_id', response_id).delete();
            await trx.from('trx_response_os').where('responseos_response_id', response_id).delete();
            await trx.from('trx_response_ci').where('responseci_response_id', response_id).delete();

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

        return {
            ia,
            ia_trigger,
            record,
            mc,
            os,
            ci
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
     * Service / Helper: Simpan chat method_id 1 (IA) dan proses trigger otomatis
     * @param sender: 1 (AI / Pasien) | 2 (Peserta Lomba, default: 2)
     */
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

        if (senderNum === 2) {
            // A. Simpan chat peserta ke trx_response_ia
            const participantChatInsert = {
                responseia_response_id: response_id,
                responseia_casequest_id: casequest_id,
                responseia_sender: 2,
                responseia_text: text,
                insert_timestamp: now,
            }
            const partResult = await dbInstance
                .insertQuery()
                .table('trx_response_ia')
                .insert(participantChatInsert)
            const participantChatId = Array.isArray(partResult) ? partResult[0] : partResult

            // B. Cek apakah post.text mengandung keyword pada data_case_quest_ia_trigger
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
                aiText = 'Maaf bu bidan, saya kurang paham dengan pertanyaan tersebut. Apakah ada yang ingin ditanyakan terkait keluhan saya?'
            }

            // C. Simpan balasan AI ke trx_response_ia
            const aiChatInsert = {
                responseia_response_id: response_id,
                responseia_casequest_id: casequest_id,
                responseia_sender: 1,
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
            }
        } else {
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
}