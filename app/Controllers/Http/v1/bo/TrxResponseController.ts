import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
// import TrxResponseRepository from 'App/Repositorys/v1/bo/TrxResponseRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const TrxResponse = new TrxResponseRepository()

export default class TrxResponseController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_contest', 'contest_id', 'contest_name', where);
        } else {
            data = await TrxResponse.getAll({request});
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * ( data.currentPage - 1 )) + index + 1;
                }
            } else {
                for (let index = 0; index < data.length; index++) {
                }   
            }
        }

        if (typeof data.length != 'undefined' || data.data[0]) {
            result = {
                status : true,
                message : 'Success',
                data : data
            }
            response.send(result);
        } else {
            result = {
                status : false,
                message : 'Data not found !',
                data : data
            }
            response.status(404).send(result);
        }
    }

    public async detail ({request, params, response}) {
        let result: object = {};

        let where = { contest_id: params.id };
        let data = await TrxResponse.getWhereRowObject('data_contest', where);
        if (data) {
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

    public async store ({request, response}) {
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

    public async update ({request, params, response}) {
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
            ])
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
                   
            const trx = await Database.transaction();
            try {
                let where_update = { response_id: params.id }
                let data_update = {
                    response_contest_id: post.contest_id,
                    response_contestteam_id: post.contestteam_id,
                    response_case_id: post.case_id,
                    response_patient_id: post.patient_id
                }
                await trx
                    .from('trx_response')
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
}