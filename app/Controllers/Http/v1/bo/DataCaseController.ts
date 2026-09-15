import date from 'date-and-time'
import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataCaseRepository from 'App/Repositorys/v1/bo/DataCaseRepository'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs'
import path from 'path'

const General = new GeneralRepository()
const DataCase = new DataCaseRepository()

export default class DataCaseController {
    public async index({ request, response }) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_case', 'case_id', 'case_name', where);
        } else {
            data = await DataCase.getAll({ request });
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * (data.currentPage - 1)) + index + 1;
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
        let data = await this.getDetailCase(params);
        if (data) {
            result = {
                status: true,
                message: 'Success',
                data: data
            }
            response.send(result);
        } else {
            result = {
                status: false,
                message: 'Data not found !'
            }
            response.status(404).send(result);
        }
    }

    public async store({ request, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            name: schema.string([
                rules.minLength(1)
            ]),
            desc: schema.string([
                rules.minLength(1)
            ]),
            introduction: schema.string([
                rules.minLength(1)
            ]),
            attribute: schema.array.optional().members(
                schema.object().anyMembers({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    value: schema.string([
                        rules.minLength(1)
                    ])
                })
            ),
            quest: schema.array.optional().members(
                schema.object().anyMembers({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    method_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'ref_method', column: 'method_id' })
                    ]),
                    limit_time: schema.number([
                        rules.unsigned()
                    ]),
                    order: schema.number([
                        rules.unsigned()
                    ])
                })
            ),
            patient: schema.array.optional().members(
                schema.object().anyMembers({
                    patient_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_patient', column: 'patient_id' })
                    ])
                })
            )
        });

        try {
            let post = this.parseNestedKeys(request.all());
            await validator.validate({ schema: validationSchema, data: post });

            const trx = await Database.transaction();
            try {
                let data_insert = {
                    case_name: post.name,
                    case_desc: post.desc,
                    case_introduction: post.introduction,
                    insert_user_id: await request.auth.user_id,
                    insert_timestamp: date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
                }
                let case_id = await trx
                    .insertQuery()
                    .table('data_case')
                    .insert(data_insert);

                if (post.attribute && Array.isArray(post.attribute)) {
                    for (let index = 0; index < post.attribute.length; index++) {
                        let data_insert_attribute = {
                            caseattribute_case_id: case_id[0],
                            caseattribute_name: post.attribute[index].name,
                            caseattribute_value: post.attribute[index].value
                        }
                        await trx
                            .insertQuery()
                            .table('data_case_attribute')
                            .insert(data_insert_attribute);
                    }
                }

                if (post.quest && Array.isArray(post.quest)) {
                    for (let index = 0; index < post.quest.length; index++) {
                        let data_insert_quest = {
                            casequest_case_id: case_id[0],
                            casequest_name: post.quest[index].name,
                            casequest_method_id: post.quest[index].method_id,
                            casequest_limit_time: post.quest[index].limit_time,
                            casequest_order: post.quest[index].order
                        }
                        let casequest_id = await trx
                            .insertQuery()
                            .table('data_case_quest')
                            .insert(data_insert_quest);

                        switch (String(post.quest[index].method_id)) {
                            case '1':
                                let data_insert_ia = {
                                    casequestia_casequest_id: casequest_id[0],
                                    casequestia_personality: post.quest[index].personality,
                                    casequestia_initmsg: post.quest[index].initmsg ?? post.quest[index].casequestia_initmsg ?? null
                                }
                                await trx
                                    .insertQuery()
                                    .table('data_case_quest_ia')
                                    .insert(data_insert_ia);

                                if (post.quest[index].trigger && Array.isArray(post.quest[index].trigger)) {
                                    for (let index2 = 0; index2 < post.quest[index].trigger.length; index2++) {
                                        const element2 = post.quest[index].trigger[index2];
                                        let data_insert_trigger = {
                                            casequestiatrigger_casequest_id: casequest_id[0],
                                            casequestiatrigger_name: element2.name,
                                            casequestiatrigger_key: element2.key,
                                            casequestiatrigger_response: element2.response,
                                            casequestiatrigger_score: element2.score
                                        }
                                        await trx
                                            .insertQuery()
                                            .table('data_case_quest_ia_trigger')
                                            .insert(data_insert_trigger);
                                    }
                                }
                                break;

                            default:
                                break;
                        }
                    }
                }

                if (post.patient && Array.isArray(post.patient)) {
                    for (let index = 0; index < post.patient.length; index++) {
                        let data_insert_patient = {
                            casepatient_case_id: case_id[0],
                            casepatient_patient_id: post.patient[index].patient_id
                        }
                        await trx
                            .insertQuery()
                            .table('data_case_patient')
                            .insert(data_insert_patient);
                    }
                }

                result = {
                    status: true,
                    message: 'Success !'
                }
                response.send(result);
                await trx.commit();
            } catch (error: any) {
                console.error('[DataCase.store] Database/Runtime Error:', error);
                result = {
                    status: false,
                    message: error.sqlMessage || error.message || 'Gagal menyimpan data kasus.',
                    error_detail: error.toString()
                }
                response.badRequest(result);
                await trx.rollback();
            }
        } catch (error: any) {
            console.error('[DataCase.store] Validation Error:', error);
            const errMsg = error.messages?.errors?.[0]
                ? `${error.messages.errors[0].field} ${error.messages.errors[0].message}`
                : (error.message || 'Validation error');
            result = {
                status: false,
                message: errMsg,
                validation_errors: error.messages?.errors
            }
            response.badRequest(result);
        }
    }

    public async update({ request, params, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            name: schema.string([
                rules.minLength(1)
            ]),
            desc: schema.string([
                rules.minLength(1)
            ]),
            introduction: schema.string([
                rules.minLength(1)
            ]),
            attribute: schema.array().members(
                schema.object().anyMembers({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    value: schema.string([
                        rules.minLength(1)
                    ])
                })
            ),
            quest: schema.array().members(
                schema.object().anyMembers({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    method_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'ref_method', column: 'method_id' })
                    ]),
                    limit_time: schema.number([
                        rules.unsigned()
                    ]),
                    order: schema.number([
                        rules.unsigned()
                    ])
                })
            ),
            patient: schema.array().members(
                schema.object().anyMembers({
                    patient_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_patient', column: 'patient_id' })
                    ])
                })
            )
        });

        try {
            let post = this.parseNestedKeys(request.all());
            await validator.validate({ schema: validationSchema, data: post });

            const trx = await Database.transaction();
            try {
                let where_update = { case_id: params.id }
                let data_update = {
                    case_name: post.name,
                    case_desc: post.desc,
                    case_introduction: post.introduction
                }
                await trx
                    .from('data_case')
                    .where(where_update)
                    .update(data_update);

                let where_attribute = { caseattribute_case_id: params.id };
                await trx
                    .from('data_case_attribute')
                    .where(where_attribute)
                    .delete();

                // Hapus sub-tabel dari data_case_quest sebelum menghapus quest
                const existingQuests = await trx
                    .from('data_case_quest')
                    .where('casequest_case_id', params.id)
                    .select('casequest_id');
                const questIds = existingQuests.map((q) => q.casequest_id);

                if (questIds.length > 0) {
                    // Hapus file fisik gambar CI dari folder storage jika ada
                    const oldCiRecords = await trx
                        .from('data_case_quest_ci')
                        .whereIn('casequestci_casequest_id', questIds)
                        .select('casequestci_image');

                    for (const ci of oldCiRecords) {
                        if (ci.casequestci_image && ci.casequestci_image.startsWith('storage/')) {
                            const relativePath = ci.casequestci_image.replace(/^storage\//, '');
                            const fullPath = path.join(Application.makePath('storage'), relativePath);
                            if (fs.existsSync(fullPath)) {
                                try {
                                    fs.unlinkSync(fullPath);
                                } catch (e) {
                                    console.error('Error deleting file:', e);
                                }
                            }
                        }
                    }

                    // Hapus data transaksi terkait yang memiliki foreign key ke data_case_quest
                    // await trx.from('trx_response_ia').whereIn('responseia_casequest_id', questIds).delete();
                    // await trx.from('trx_response_answer_mc').whereIn('responseanswermc_casequest_id', questIds).delete();
                    // await trx.from('trx_response_answer_os').whereIn('responseansweros_casequest_id', questIds).delete();
                    // await trx.from('trx_response_answer').whereIn('responseanswer_casequest_id', questIds).delete();

                    // Hapus sub-tabel data_case_quest & jawaban
                    await trx.from('data_case_quest_ia_trigger').whereIn('casequestiatrigger_casequest_id', questIds).delete();
                    await trx.from('data_case_quest_ia').whereIn('casequestia_casequest_id', questIds).delete();
                    await trx.from('data_case_quest_mc').whereIn('casequestmc_casequest_id', questIds).delete();
                    await trx.from('data_case_quest_os').whereIn('casequestos_casequest_id', questIds).delete();
                    await trx.from('data_case_quest_ci_option').whereIn('casequestcioption_casequest_id', questIds).delete();
                    await trx.from('data_case_quest_ci').whereIn('casequestci_casequest_id', questIds).delete();
                    await trx.from('data_case_quest_record').whereIn('casequestrecord_casequest_id', questIds).delete();
                }

                let where_quest = { casequest_case_id: params.id };
                await trx
                    .from('data_case_quest')
                    .where(where_quest)
                    .delete();

                let where_patient = { casepatient_case_id: params.id };
                await trx
                    .from('data_case_patient')
                    .where(where_patient)
                    .delete();

                for (let index = 0; index < post.attribute.length; index++) {
                    let data_insert_attribute = {
                        caseattribute_case_id: params.id,
                        caseattribute_name: post.attribute[index].name,
                        caseattribute_value: post.attribute[index].value
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_attribute')
                        .insert(data_insert_attribute);
                }

                for (let index = 0; index < post.quest.length; index++) {
                    let data_insert_quest = {
                        casequest_case_id: params.id,
                        casequest_name: post.quest[index].name,
                        casequest_method_id: post.quest[index].method_id,
                        casequest_limit_time: post.quest[index].limit_time,
                        casequest_order: post.quest[index].order
                    }
                    let casequest_id = await trx
                        .insertQuery()
                        .table('data_case_quest')
                        .insert(data_insert_quest);

                    switch (String(post.quest[index].method_id)) {
                        case '1':
                            let data_insert_ia = {
                                casequestia_casequest_id: casequest_id[0],
                                casequestia_personality: post.quest[index].personality,
                                casequestia_initmsg: post.quest[index].initmsg ?? post.quest[index].casequestia_initmsg ?? null
                            }
                            await trx
                                .insertQuery()
                                .table('data_case_quest_ia')
                                .insert(data_insert_ia);

                            if (post.quest[index].trigger) {
                                for (let index2 = 0; index2 < post.quest[index].trigger.length; index2++) {
                                    const element2 = post.quest[index].trigger[index2];
                                    let data_insert_trigger = {
                                        casequestiatrigger_casequest_id: casequest_id[0],
                                        casequestiatrigger_name: element2.name,
                                        casequestiatrigger_key: element2.key,
                                        casequestiatrigger_response: element2.response,
                                        casequestiatrigger_score: element2.score
                                    }
                                    await trx
                                        .insertQuery()
                                        .table('data_case_quest_ia_trigger')
                                        .insert(data_insert_trigger);
                                }
                            }
                            break;

                        case '2':
                            if (post.quest[index].mc) {
                                for (let index2 = 0; index2 < post.quest[index].mc.length; index2++) {
                                    const element2 = post.quest[index].mc[index2];
                                    let data_insert_mc = {
                                        casequestmc_casequest_id: casequest_id[0],
                                        casequestmc_name: element2.name,
                                        casequestmc_score: element2.score,
                                        casequestmc_required_id: element2.required_id
                                    }
                                    await trx
                                        .insertQuery()
                                        .table('data_case_quest_mc')
                                        .insert(data_insert_mc);
                                }
                            }
                            break;

                        case '3':
                            if (post.quest[index].os) {
                                for (let index2 = 0; index2 < post.quest[index].os.length; index2++) {
                                    const element2 = post.quest[index].os[index2];
                                    let data_insert_os = {
                                        casequestos_casequest_id: casequest_id[0],
                                        casequestos_name: element2.name,
                                        casequestos_order: element2.order,
                                        casequestos_score: element2.score
                                    }
                                    await trx
                                        .insertQuery()
                                        .table('data_case_quest_os')
                                        .insert(data_insert_os);
                                }
                            }
                            break;

                        case '4':
                            if (post.quest[index].ci) {
                                for (let index2 = 0; index2 < post.quest[index].ci.length; index2++) {
                                    const element2 = post.quest[index].ci[index2];
                                    let image: string | null = element2.image || null;

                                    // Upload / simpan gambar ke folder storage/
                                    const allFiles = request.allFiles() as any;
                                    const fileFromRequest =
                                        request.file(`quest[${index}][ci][${index2}][image]`) ||
                                        request.file(`quest.${index}.ci.${index2}.image`) ||
                                        allFiles?.quest?.[index]?.ci?.[index2]?.image ||
                                        allFiles?.[`quest[${index}][ci][${index2}][image]`] ||
                                        allFiles?.[`quest.${index}.ci.${index2}.image`] ||
                                        (element2 && typeof element2.image === 'object' && element2.image?.move ? element2.image : null);

                                    if (fileFromRequest) {
                                        const ext = fileFromRequest.extname || (fileFromRequest.clientName ? path.extname(fileFromRequest.clientName).replace('.', '') : 'jpg') || 'jpg';
                                        const fileName = `ci_${Date.now()}_${index}_${index2}.${ext}`;
                                        await fileFromRequest.move(Application.makePath('storage'), {
                                            name: fileName,
                                            overwrite: true
                                        });
                                        image = `storage/${fileName}`;
                                    } else if (typeof element2.image === 'string' && element2.image.startsWith('data:image/')) {
                                        // Handle base64 data URL
                                        const matches = element2.image.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
                                        if (matches) {
                                            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                                            const base64Data = matches[2];
                                            const fileName = `ci_${Date.now()}_${index}_${index2}.${ext}`;
                                            const storageDir = Application.makePath('storage');
                                            if (!fs.existsSync(storageDir)) {
                                                fs.mkdirSync(storageDir, { recursive: true });
                                            }
                                            const filePath = path.join(storageDir, fileName);
                                            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                                            image = `storage/${fileName}`;
                                        }
                                    } else if (typeof element2.image === 'string' && /^[A-Za-z0-9+/=]+$/.test(element2.image) && element2.image.length > 100) {
                                        // Handle raw base64 string
                                        const fileName = `ci_${Date.now()}_${index}_${index2}.jpg`;
                                        const storageDir = Application.makePath('storage');
                                        if (!fs.existsSync(storageDir)) {
                                            fs.mkdirSync(storageDir, { recursive: true });
                                        }
                                        const filePath = path.join(storageDir, fileName);
                                        fs.writeFileSync(filePath, Buffer.from(element2.image, 'base64'));
                                        image = `storage/${fileName}`;
                                    }

                                    let data_insert_ci = {
                                        casequestci_casequest_id: casequest_id[0],
                                        casequestci_name: element2.name,
                                        casequestci_desc: element2.desc,
                                        casequestci_image: image
                                    }
                                    await trx
                                        .insertQuery()
                                        .table('data_case_quest_ci')
                                        .insert(data_insert_ci);
                                }
                            }

                            if (post.quest[index].ci_option) {
                                for (let index2 = 0; index2 < post.quest[index].ci_option.length; index2++) {
                                    const element2 = post.quest[index].ci_option[index2];
                                    let data_insert_ci_option = {
                                        casequestcioption_casequest_id: casequest_id[0],
                                        casequestcioption_code: element2.code,
                                        casequestcioption_name: element2.name,
                                        casequestcioption_score: element2.score
                                    }

                                    await trx
                                        .insertQuery()
                                        .table('data_case_quest_ci_option')
                                        .insert(data_insert_ci_option);
                                }
                            }
                            break;

                        case '5':
                            let isActiveRecordUpdate = 0;
                            if (post.quest[index].record !== undefined) {
                                if (typeof post.quest[index].record === 'object' && post.quest[index].record !== null) {
                                    isActiveRecordUpdate = post.quest[index].record.is_active ?? post.quest[index].record.casequestrecord_is_active ?? 0;
                                } else {
                                    isActiveRecordUpdate = Number(post.quest[index].record) ? 1 : 0;
                                }
                            } else if (post.quest[index].is_active !== undefined) {
                                isActiveRecordUpdate = Number(post.quest[index].is_active) ? 1 : 0;
                            } else if (post.quest[index].is_active_record !== undefined) {
                                isActiveRecordUpdate = Number(post.quest[index].is_active_record) ? 1 : 0;
                            } else if (post.quest[index].casequestrecord_is_active !== undefined) {
                                isActiveRecordUpdate = Number(post.quest[index].casequestrecord_is_active) ? 1 : 0;
                            } else if (post.quest[index].record_is_active !== undefined) {
                                isActiveRecordUpdate = Number(post.quest[index].record_is_active) ? 1 : 0;
                            }

                            let data_insert_record_update = {
                                casequestrecord_casequest_id: casequest_id[0],
                                casequestrecord_is_active: isActiveRecordUpdate
                            };
                            await trx
                                .insertQuery()
                                .table('data_case_quest_record')
                                .insert(data_insert_record_update);
                            break;
                        default:
                            break;
                    }
                }

                for (let index = 0; index < post.patient.length; index++) {
                    let data_insert_patient = {
                        casepatient_case_id: params.id,
                        casepatient_patient_id: post.patient[index].patient_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_patient')
                        .insert(data_insert_patient);
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
                    message: error.sqlMessage
                }
                response.badRequest(result);
                await trx.rollback();
            }
        } catch (error) {
            result = {
                status: false,
                message: error.messages.errors[0].field + ' ' + error.messages.errors[0].message
            }
            response.badRequest(result);
        }
    }

    public async destroy({ request, params, response }) {
        let result: object = {};

        const trx = await Database.transaction();
        try {
            // 1. Hapus relasi attribute
            await trx
                .from('data_case_attribute')
                .where('caseattribute_case_id', params.id)
                .delete();

            // 2. Ambil semua respon (trx_response) terkait case ini dan hapus anak-anaknya terlebih dahulu
            const responses = await trx
                .from('trx_response')
                .where('response_case_id', params.id)
                .select('response_id');
            const responseIds = responses.map((r) => r.response_id);

            if (responseIds.length > 0) {
                // await trx.from('trx_response_ia').whereIn('responseia_response_id', responseIds).delete();
                // await trx.from('trx_response_req').whereIn('responsereq_response_id', responseIds).delete();
                // // await trx.from('trx_response_interview').whereIn('responsinterview_response_id', responseIds).delete();
                // await trx.from('trx_response_answer_mc').whereIn('responseanswermc_response_id', responseIds).delete();
                // await trx.from('trx_response_answer_os').whereIn('responseansweros_response_id', responseIds).delete();
                // await trx.from('trx_response_answer').whereIn('responseanswer_response_id', responseIds).delete();
                await trx.from('trx_response').whereIn('response_id', responseIds).delete();
            }

            // 3. Ambil semua tim kontes terkait case ini dan hapus member tim
            const teams = await trx
                .from('data_contest_team')
                .where('contestteam_case_id', params.id)
                .select('contestteam_id');
            const teamIds = teams.map((t) => t.contestteam_id);

            if (teamIds.length > 0) {
                await trx.from('data_contest_team_member').whereIn('contestteammember_contestteam_id', teamIds).delete();
                await trx.from('data_contest_team').whereIn('contestteam_id', teamIds).delete();
            }

            // 4. Ambil semua quest dari case ini
            const existingQuests = await trx
                .from('data_case_quest')
                .where('casequest_case_id', params.id)
                .select('casequest_id');
            const questIds = existingQuests.map((q) => q.casequest_id);

            if (questIds.length > 0) {
                // Hapus file fisik gambar CI dari folder storage jika ada
                const ciRecords = await trx
                    .from('data_case_quest_ci')
                    .whereIn('casequestci_casequest_id', questIds)
                    .select('casequestci_image');

                for (const ci of ciRecords) {
                    if (ci.casequestci_image && ci.casequestci_image.startsWith('storage/')) {
                        const relativePath = ci.casequestci_image.replace(/^storage\//, '');
                        const fullPath = path.join(Application.makePath('storage'), relativePath);
                        if (fs.existsSync(fullPath)) {
                            try {
                                fs.unlinkSync(fullPath);
                            } catch (e) {
                                console.error('Error deleting file:', e);
                            }
                        }
                    }
                }

                // Hapus sisa-sisa transaksi yang mereferensikan questIds jika ada
                // await trx.from('trx_response_ia').whereIn('responseia_casequest_id', questIds).delete();
                // await trx.from('trx_response_answer_mc').whereIn('responseanswermc_casequest_id', questIds).delete();
                // await trx.from('trx_response_answer_os').whereIn('responseansweros_casequest_id', questIds).delete();
                // await trx.from('trx_response_answer').whereIn('responseanswer_casequest_id', questIds).delete();

                // Hapus sub-tabel data_case_quest & jawaban
                await trx.from('data_case_quest_ia_trigger').whereIn('casequestiatrigger_casequest_id', questIds).delete();
                await trx.from('data_case_quest_ia').whereIn('casequestia_casequest_id', questIds).delete();
                await trx.from('data_case_quest_mc').whereIn('casequestmc_casequest_id', questIds).delete();
                await trx.from('data_case_quest_os').whereIn('casequestos_casequest_id', questIds).delete();
                await trx.from('data_case_quest_ci_option').whereIn('casequestcioption_casequest_id', questIds).delete();
                await trx.from('data_case_quest_ci').whereIn('casequestci_casequest_id', questIds).delete();
                await trx.from('data_case_quest_record').whereIn('casequestrecord_casequest_id', questIds).delete();
            }

            // 5. Hapus data_case_quest
            await trx
                .from('data_case_quest')
                .where('casequest_case_id', params.id)
                .delete();

            // 6. Hapus data_case_patient
            await trx
                .from('data_case_patient')
                .where('casepatient_case_id', params.id)
                .delete();

            // 7. Hapus data_case
            await trx
                .from('data_case')
                .where('case_id', params.id)
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
                message: error.sqlMessage || error.message
            }
            response.badRequest(result);
            await trx.rollback();
        }
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

    private async calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();

        const hasNotHadBirthday =
            today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() &&
                today.getDate() < birth.getDate());

        if (hasNotHadBirthday) {
            age--;
        }

        return age;
    }

    public async getDetailCase(params) {
        let where = { case_id: params.id };
        let data = await General.getWhereRowObject('data_case', where);

        if (data.insert_timestamp) {
            try {
                data.insert_timestamp_text = date.format(new Date(data.insert_timestamp), 'YYYY-MM-DD HH:mm:ss');
            } catch (e) {
                data.insert_timestamp_text = data.insert_timestamp;
            }
        }

        // 1. Data Attribute Kasus
        data.attribute = await General.getWhereObject('data_case_attribute', { caseattribute_case_id: params.id });

        // 2. Data Quest (Pos-pos Soal) beserta detail sub-tabelnya
        let quests = await Database.query()
            .from('data_case_quest')
            .where('casequest_case_id', params.id)
            .orderBy('casequest_order', 'asc');

        for (let index = 0; index < quests.length; index++) {
            const quest = quests[index];
            let where_method = { method_id: quest.casequest_method_id };
            let method = await General.getWhereRowObject('ref_method', where_method);
            quest.method_name = method ? method.method_name : null;

            switch (String(quest.casequest_method_id)) {
                case '1': { // Pos 1: IA (Intelligent Assistant)
                    const ia = await General.getWhereRowObject('data_case_quest_ia', { casequestia_casequest_id: quest.casequest_id });
                    quest.personality = ia ? ia.casequestia_personality : null;
                    quest.casequestia_initmsg = ia ? ia.casequestia_initmsg : null;
                    quest.trigger = await General.getWhereObject('data_case_quest_ia_trigger', { casequestiatrigger_casequest_id: quest.casequest_id });
                    break;
                }
                case '2': { // Pos 2: MC (Multiple Choice)
                    quest.mc = await General.getWhereObject('data_case_quest_mc', { casequestmc_casequest_id: quest.casequest_id });
                    break;
                }
                case '3': { // Pos 3: OS (Ordering Step)
                    quest.os = await Database.query()
                        .from('data_case_quest_os')
                        .where('casequestos_casequest_id', quest.casequest_id)
                        .orderBy('casequestos_order', 'asc');
                    break;
                }
                case '4': { // Pos 4: CI (Clinical Inquiry / Image Choice)
                    quest.ci = await General.getWhereObject('data_case_quest_ci', { casequestci_casequest_id: quest.casequest_id });
                    quest.ci_option = await General.getWhereObject('data_case_quest_ci_option', { casequestcioption_casequest_id: quest.casequest_id });
                    break;
                }
                case '5': { // Pos 5: Record
                    const record = await General.getWhereRowObject('data_case_quest_record', { casequestrecord_casequest_id: quest.casequest_id });
                    quest.record = record ? (record.casequestrecord_is_active ?? 0) : 0;
                    quest.is_active = record ? (record.casequestrecord_is_active ?? 0) : 0;
                    quest.is_active_record = record ? (record.casequestrecord_is_active ?? 0) : 0;
                    quest.casequestrecord_is_active = record ? (record.casequestrecord_is_active ?? 0) : 0;
                    quest.record_detail = record || null;
                    break;
                }
                default:
                    break;
            }
        }
        data.quest = quests;

        // 3. Data Pasien beserta atribut & format umur
        data.patient = await General.getWhereObject('data_case_patient', { casepatient_case_id: params.id });
        for (let index = 0; index < data.patient.length; index++) {
            let where_patient = { patient_id: data.patient[index].casepatient_patient_id };
            let patientData = await General.getWhereRowObject('data_patient', where_patient);
            if (patientData) {
                if (patientData.patient_birthdate) {
                    try {
                        patientData.patient_birthdate_text = date.format(new Date(patientData.patient_birthdate), 'YYYY-MM-DD');
                    } catch (e) {
                        patientData.patient_birthdate_text = patientData.patient_birthdate;
                    }
                    patientData.patient_age = await this.calculateAge(patientData.patient_birthdate);
                }
                patientData.patient_gender_text = patientData.patient_gender === 'M' ? 'Laki-laki' : 'Perempuan';
                patientData.attribute = await General.getWhereObject('data_patient_attribute', { patientattribute_patient_id: patientData.patient_id });
                data.patient[index].patient = patientData;
            }
        }

        return data;
    }
}