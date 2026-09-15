import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataPatientRepository from 'App/Repositorys/v1/bo/DataPatientRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const DataPatient = new DataPatientRepository()

export default class DataPatientController {
    public async index({ request, response }) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_patient', 'patient_id', 'patient_name', where);
        } else {
            data = await DataPatient.getAll({ request });
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * (data.currentPage - 1)) + index + 1;
                    // data.rows[index].patient_birthdate_text = date.format(new Date(data.rows[index].patient_birthdate), 'YYYY-MM-DD');
                }
            } else {
                for (let index = 0; index < data.length; index++) {
                    // data[index].patient_birthdate_text = date.format(new Date(data[index].patient_birthdate), 'YYYY-MM-DD');
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

        let where = { case_id: params.id };
        let data = await General.getWhereRowObject('data_case', where);
        if (data) {
            if (data.insert_timestamp) {
                try {
                    data.insert_timestamp_text = date.format(new Date(data.insert_timestamp), 'YYYY-MM-DD HH:mm:ss');
                } catch (e) {
                    data.insert_timestamp_text = data.insert_timestamp;
                }
            }

            // 1. Data Attribute Kasus
            data.attribute = await General.getWhereObject('data_case_attribute', { caseattribute_case_id: params.id });

            // 2. Data Quest (Pos Soal 1 s/d 4) beserta detail sub-tabelnya
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
                        quest.initmsg = ia ? ia.casequestia_initmsg : null;
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
            birthdate: schema.string([
                rules.minLength(1)
            ]),
            gender: schema.string([
                rules.minLength(1)
            ]),
            avatar_id: schema.string([
                rules.minLength(1)
            ]),
            attribute: schema.array().members(
                schema.object().members({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    value: schema.string([
                        rules.minLength(1)
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
            const trx = await Database.transaction();
            try {
                let data_insert = {
                    patient_name: post.name,
                    patient_birthdate: post.birthdate,
                    patient_gender: post.gender,
                    patient_avatar_id: post.avatar_id
                }
                let contest_id = await trx
                    .insertQuery()
                    .table('data_patient')
                    .insert(data_insert);

                for (let index = 0; index < post.attribute.length; index++) {
                    let data_insert_attribute = {
                        patientattribute_patient_id: contest_id[0],
                        patientattribute_name: post.attribute[index].name,
                        patientattribute_value: post.attribute[index].value
                    }
                    await trx
                        .insertQuery()
                        .table('data_patient_attribute')
                        .insert(data_insert_attribute);
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

    public async update({ request, params, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            name: schema.string([
                rules.minLength(1)
            ]),
            birthdate: schema.string([
                rules.minLength(1)
            ]),
            gender: schema.string([
                rules.minLength(1)
            ]),
            avatar_id: schema.string([
                rules.minLength(1)
            ]),
            attribute: schema.array().members(
                schema.object().members({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    value: schema.string([
                        rules.minLength(1)
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();

            const trx = await Database.transaction();
            try {
                let where_update = { patient_id: params.id }
                let data_update: Record<string, any> = {
                    patient_name: post.name,
                    patient_birthdate: post.birthdate,
                    patient_gender: post.gender,
                    patient_avatar_id: post.avatar_id
                }
                await trx
                    .from('data_patient')
                    .where(where_update)
                    .update(data_update);

                let where_attribute = { patientattribute_patient_id: params.id };
                await trx
                    .from('data_patient_attribute')
                    .where(where_attribute)
                    .delete();

                for (let index = 0; index < post.attribute.length; index++) {
                    let data_insert_attribute = {
                        patientattribute_patient_id: params.id,
                        patientattribute_name: post.attribute[index].name,
                        patientattribute_value: post.attribute[index].value
                    }
                    await trx
                        .insertQuery()
                        .table('data_patient_attribute')
                        .insert(data_insert_attribute);
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
            let where_update = { patient_id: params.id }
            let data_update = { patient_is_deleted: 1 }
            await trx
                .from('data_patient')
                .where(where_update)
                .update(data_update);

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
    }
}