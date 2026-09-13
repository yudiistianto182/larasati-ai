import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataCaseQuestRepository from 'App/Repositorys/v1/bo/DataCaseQuestRepository'
import Database from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'
import fs from 'fs'
import path from 'path'

const General = new GeneralRepository()
const DataCaseQuest = new DataCaseQuestRepository()

export default class DataCaseController {
    public async detail({ request, params, response }) {
        let result: object = {};

        let where = { casequest_id: params.id };
        let data = await General.getWhereRowObject('data_case_quest', where);
        if (data) {
            data.rule = await General.getWhereObject('ref_method_rule', { methodrule_method_id: data.casequest_method_id });
            for (let index = 0; index < data.rule.length; index++) {
                data.rule[index].detail = await General.getWhereObject('ref_method_rule_detail', { methodruledetail_methodrule_id: data.rule[index].methodrule_id })
            }

            const questRecord = await General.getWhereRowObject('data_case_quest_record', { casequestrecord_casequest_id: params.id });
            data.record = questRecord ? questRecord.casequestrecord_is_active : 0;
            data.is_active_record = questRecord ? questRecord.casequestrecord_is_active : 0;
            data.casequestrecord_is_active = questRecord ? questRecord.casequestrecord_is_active : 0;

            switch (data.casequest_method_id) {
                case 1:
                    data.answer = await DataCaseQuest.getQuestIa(params.id);
                    break;

                case 2:
                    data.answer = await DataCaseQuest.getQuestMc(params.id);
                    break;

                case 3:
                    data.answer = await DataCaseQuest.getQuestOs(params.id);
                    break;

                case 4:
                    data.answer = await DataCaseQuest.getQuestCi(params.id);
                    break;

                case 5:
                    data.answer = await DataCaseQuest.getQuestRecord(params.id);
                    break;

                default:
                    break;
            }
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

    public async destroy({ request, params, response }) {
        let result: object = {};

        const trx = await Database.transaction();
        try {
            const questId = params.id;

            // 1. Hapus file fisik gambar CI dari folder storage jika ada
            const ciRecords = await trx
                .from('data_case_quest_ci')
                .where('casequestci_casequest_id', questId)
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

            // 2. Hapus data transaksi terkait yang memiliki foreign key ke data_case_quest
            await trx.from('trx_response_ia').where('responseia_casequest_id', questId).delete();
            await trx.from('trx_response_answer_mc').where('responseanswermc_casequest_id', questId).delete();
            await trx.from('trx_response_answer_os').where('responseansweros_casequest_id', questId).delete();
            await trx.from('trx_response_answer').where('responseanswer_casequest_id', questId).delete();

            // 3. Hapus sub-tabel data_case_quest & jawaban
            await trx.from('data_case_quest_answer').where('casequestanswer_casequest_id', questId).delete();
            await trx.from('data_case_quest_ia_trigger').where('casequestiatrigger_casequest_id', questId).delete();
            await trx.from('data_case_quest_ia').where('casequestia_casequest_id', questId).delete();
            await trx.from('data_case_quest_mc').where('casequestmc_casequest_id', questId).delete();
            await trx.from('data_case_quest_os').where('casequestos_casequest_id', questId).delete();
            await trx.from('data_case_quest_ci').where('casequestci_casequest_id', questId).delete();
            await trx.from('data_case_quest_record').where('casequestrecord_casequest_id', questId).delete();

            // 4. Hapus data_case_quest
            await trx
                .from('data_case_quest')
                .where('casequest_id', questId)
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
}