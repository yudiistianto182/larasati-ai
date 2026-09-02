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
    public async store ({request, response}) {
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
                    status : false,
                    message : error.sqlMessage
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

    public async detail ({request, params, response}) {
        let result: object = {};

        // let where = { response_id: params.id };
        // let data = await TrxResponse.getWhereRowObject('data_contest', where);
        let data = await TrxResponse.getDetail(params.id);
        if (data) {
            data.answer = await TrxResponseAnswer.getDetailByResponse(params.id);
            for (let index = 0; index < data.answer.length; index++) {
                const element = data.answer[index];
                
                switch (element.casequest_method_id) {
                    case 1:
                        return false;
                        
                        break;
                
                    default:
                        break;
                }
            }
            result = {
                'status' 	: true,
                'message'   : 'Success',
                'data'		: data
            }
            response.send(result);
        } else {
            result = {
                'status' 	: false,
                'message'   : 'Data not found !'
            }
            response.status(404).send(result);
        }
    }
}