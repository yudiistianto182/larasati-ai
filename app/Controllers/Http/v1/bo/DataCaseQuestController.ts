import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataCaseQuestRepository from 'App/Repositorys/v1/bo/DataCaseQuestRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const DataCaseQuest = new DataCaseQuestRepository()

export default class DataCaseController {
    public async detail({ request, params, response }) {
        let result: object = {};

        let where = { casequest_id: params.id };
        let data = await General.getWhereRowObject('data_case_quest', where);
        if (data) {
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
                    data.answer = await DataCaseQuest.getQuestMo(params.id);
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
}