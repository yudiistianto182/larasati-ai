import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataContestRepository from 'App/Repositorys/v1/bo/DataContestRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const DataContest = new DataContestRepository()

export default class DataContestController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_contest', 'contest_id', 'contest_name', where);
        } else {
            data = await DataContest.getAll({request});
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * ( data.currentPage - 1 )) + index + 1;
                    data.rows[index].contest_datestart_text = date.format(new Date(data.rows[index].contest_datestart), 'YYYY-MM-DD');
                    data.rows[index].contest_dateend_text = date.format(new Date(data.rows[index].contest_dateend), 'YYYY-MM-DD');
                }
            } else {
                for (let index = 0; index < data.length; index++) {
                    data[index].contest_datestart_text = date.format(new Date(data[index].contest_datestart), 'YYYY-MM-DD');
                    data[index].contest_dateend_text = date.format(new Date(data[index].contest_dateend), 'YYYY-MM-DD');
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
        let data = await General.getWhereRowObject('data_contest', where);
        if (data) {
            data.contest_datestart_text = date.format(new Date(data.contest_datestart), 'YYYY-MM-DD');
            data.contest_dateend_text = date.format(new Date(data.contest_dateend), 'YYYY-MM-DD');
            data.scorer = await DataContest.getContestScorer(params.id);
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
            name: schema.string([
                rules.minLength(1)
            ]),
            periode_id: schema.string([
                rules.minLength(1)
            ]),
            datestart: schema.string([
                rules.minLength(1)
            ]),
            dateend: schema.string([
                rules.minLength(1)
            ]),
            desc: schema.string([
                rules.minLength(1)
            ]),
            scorer: schema.array().members(
                schema.object().members({
                    user_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'sys_user', column: 'user_id' })
                    ])
                })
            ),
            case: schema.array().members(
                schema.object().members({
                    case_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_case', column: 'case_id' })
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
                    contest_name: post.name,
                    contest_periode_id: post.periode_id,
                    contest_datestart: post.datestart,
                    contest_dateend: post.dateend,
                    contest_desc: post.desc
                }
                let contest_id = await trx
                                    .insertQuery()
                                    .table('data_contest')
                                    .insert(data_insert);

                for (let index = 0; index < post.scorer.length; index++) {
                    let data_insert_scorer = {
                        contestscorer_contest_id: contest_id[0],
                        contestscorer_user_id: post.scorer[index].user_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_scorer')
                        .insert(data_insert_scorer);
                }  

                for (let index = 0; index < post.case.length; index++) {
                    let data_insert_case = {
                        contestcase_contest_id: contest_id[0],
                        contestcase_case_id: post.case[index].case_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_case')
                        .insert(data_insert_case);
                }  
        
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
            name: schema.string([
                rules.minLength(1)
            ]),
            periode_id: schema.string([
                rules.minLength(1)
            ]),
            datestart: schema.string([
                rules.minLength(1)
            ]),
            dateend: schema.string([
                rules.minLength(1)
            ]),
            desc: schema.string([
                rules.minLength(1)
            ]),
            scorer: schema.array().members(
                schema.object().members({
                    user_id: schema.string([
                        rules.minLength(1),
                        rules.maxLength(1),
                        rules.exists({ table: 'sys_user', column: 'user_id' })
                    ])
                })
            ),
            case: schema.array().members(
                schema.object().members({
                    case_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_case', column: 'case_id' })
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
                   
            const trx = await Database.transaction();
            try {
                let where_update = { contest_id: params.id }
                let data_update = {
                    contest_name: post.name,
                    contest_periode_id: post.periode_id,
                    contest_datestart: post.datestart,
                    contest_dateend: post.dateend,
                    contest_desc: post.desc
                }
                await trx
                    .from('data_contest')
                    .where(where_update)
                    .update(data_update);

                let where_case = { contestcase_contest_id: params.id };
                await trx
                    .from('data_contest_case')
                    .where(where_case)
                    .delete();

                for (let index = 0; index < post.scorer.length; index++) {
                    let data_insert_case = {
                        contestscorer_contest_id: params.id,
                        contestscorer_scorer_id: post.scorer[index].scorer_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_scorer')
                        .insert(data_insert_case);
                }  

                for (let index = 0; index < post.case.length; index++) {
                    let data_insert_case = {
                        contestcase_contest_id: params.id,
                        contestcase_case_id: post.case[index].case_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_case')
                        .insert(data_insert_case);
                }  
        
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

    public async destroy ({request, params, response}) {
        let result: object = {};
                 
        const trx = await Database.transaction();
        try {
            let where_contest_team = { contestteam_contest_id: params.id };
            let data_contest_team = await General.getWhereObject('data_contest_team', where_contest_team);
            if (data_contest_team.length > 0) {
                for (let index = 0; index < data_contest_team.length; index++) {
                    let where_member = { contestteammember_contestteam_id: data_contest_team[index].contestteam_id };
                    await trx
                        .from('data_contest_team_member')
                        .where(where_member)
                        .delete();
                }

                await trx
                    .from('data_contest_team')
                    .where(where_contest_team)
                    .delete();
            }

            let where_contest_scorer = { contestscorer_contest_id: params.id };
            await trx
                .from('data_contest_scorer')
                .where(where_contest_scorer)
                .delete();

            let where = { contest_id: params.id };
            await trx
                .from('data_contest')
                .where(where)
                .delete();
    
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
    }
}