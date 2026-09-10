import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import TrxResponseRepository from 'App/Repositorys/v1/bo/TrxResponseRepository'
import TrxResponseAnswerRepository from 'App/Repositorys/v1/bo/TrxResponseAnswerRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const TrxResponse = new TrxResponseRepository()
const TrxResponseAnswer = new TrxResponseAnswerRepository()

export default class TrxResponseAnswerController {
    public async store({ request, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            response_id: schema.string([
                rules.minLength(1)
            ]),
            casequest_id: schema.string([
                rules.minLength(1)
            ])
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
            const trx = await Database.transaction();
            try {
                let data_insert = {
                    response_contest_id: post.response_contest_id,
                    response_contestteam_id: post.response_contestteam_id,
                    response_case_id: post.case_id,
                    response_patient_id: post.patient_id
                }
                await trx
                    .insertQuery()
                    .table('trx_response')
                    .insert(data_insert);

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

    public async detail({ request, params, response }) {
        let result: object = {};

        let data = await TrxResponseAnswer.getDetail(params.id);
        if (data) {
            data.quest_pos = 'POS: ' + data.casequest_order + ': ' + data.casequest_name;
            data.answer = await General.getWhereObject('trx_response_answer', { responseanswer_response_id: data.response_id });
            // for (let index = 0; index < data.answer.length; index++) {
            //     const element = data.answer[index];

            //     switch (element.casequest_method_id) {
            //         case 1:
            //             return false;
            //             break;

            //         case 2:
            //             break;

            //         default:
            //             break;
            //     }
            // }
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
            response_id: schema.string([
                rules.minLength(1)
            ]),
            casequest_id: schema.string([
                rules.minLength(1)
            ])
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
            const trx = await Database.transaction();
            try {
                let data_case_quest = await General.getWhereRowObject('data_case_quest', { casequest_id: post.casequest_id })
                let data_insert_response_answer = {};

                switch (data_case_quest.casequest_method_id) {
                    case 1:
                        return false;
                        break;

                    case 2:
                        for (let index = 0; index < post.answer.length; index++) {
                            const element = post.answer[index];
                            let data_quest_mc = await General.getWhereRowObject('data_case_quest_mc', { casequestmc_id: element.casequestanswer_id });
                            if (!data_quest_mc) {
                                return false;
                            }
                            data_insert_response_answer = {
                                responseanswer_response_id: post.response_id,
                                responseanswer_casequest_id: post.casequest_id,
                                responseanswer_is_submited: 1,
                                responseanswer_score: data_quest_mc.casequestmc_score_correct
                            };
                            await trx.insertQuery().table('trx_response_answer').insert(data_insert_response_answer);
                        }
                        break;

                    case 3:
                        for (let index = 0; index < post.answer.length; index++) {
                            const element = post.answer[index];
                            let data_quest_os = await General.getWhereRowObject('data_case_quest_os', { casequestos_id: element.casequestanswer_id });
                            if (!data_quest_os) {
                                return false;
                            }
                            data_insert_response_answer = {
                                responseanswer_response_id: post.response_id,
                                responseanswer_casequest_id: post.casequest_id,
                                responseanswer_is_submited: 1,
                                responseanswer_score: data_quest_os.casequestos_score_correct
                            };
                            await trx.insertQuery().table('trx_response_answer').insert(data_insert_response_answer);
                        }
                        break;

                    case 4:
                        for (let index = 0; index < post.answer.length; index++) {
                            const element = post.answer[index];
                            let data_quest_ci = await General.getWhereRowObject('data_case_quest_ci', { casequestci_id: element.casequestanswer_id });
                            if (!data_quest_ci) {
                                return false;
                            }
                            data_insert_response_answer = {
                                responseanswer_response_id: post.response_id,
                                responseanswer_casequest_id: post.casequest_id,
                                responseanswer_is_submited: 1,
                                responseanswer_score: data_quest_ci.casequestci_score_correct
                            };
                            await trx.insertQuery().table('trx_response_answer').insert(data_insert_response_answer);
                        }
                        break;

                    default:
                        break;
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
}