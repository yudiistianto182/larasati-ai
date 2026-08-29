import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataContestTeamRepository from 'App/Repositorys/v1/bo/DataContestTeamRepository';
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const DataContestTeam = new DataContestTeamRepository()

export default class DataContestTeamController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_contest_team', 'contestteam_id', 'contestteam_name', where);
        } else {
            data = await DataContestTeam.getAll({request});
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

        let where = { contestteam_id: params.id };
        let data = await General.getWhereRowObject('data_contest_team', where);
        if (data) {
            data.member = await DataContestTeam.getTeamMember(params.id);
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
            contest_id: schema.string([
                rules.minLength(1)
            ]),
            member: schema.array().members(
                schema.object().members({
                    user_id: schema.string([
                        rules.minLength(1),
                        rules.maxLength(1),
                        rules.exists({ table: 'sys_user', column: 'user_id' })
                    ]),
                    is_leader: schema.string([
                        rules.minLength(1),
                        rules.maxLength(1)
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
                    contestteam_name: post.name,
                    contestteam_contest_id: post.contest_id
                }
                let contestteam_id = await trx
                    .insertQuery()
                    .table('data_contest_team')
                    .insert(data_insert)
                    .returning(['contestteam_id']);

                for (let index = 0; index < post.member.length; index++) {
                    let data_insert_member = {
                        contestteammember_contestteam_id: contestteam_id[0],
                        contestteammember_user_id: post.member[index].user_id,
                        contestteammember_is_leader: post.member[index].is_leader
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_team_member')
                        .insert(data_insert_member);
                }   
        
                result = {
                    status: true,
                    message: 'Success !'
                }
                response.send(result);
                await trx.commit();
            } catch (error) {
                console.log(error);
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
            contest_id: schema.string([
                rules.minLength(1)
            ]),
            member: schema.array().members(
                schema.object().members({
                    user_id: schema.string([
                        rules.minLength(1),
                        rules.maxLength(1),
                        rules.exists({ table: 'sys_user', column: 'user_id' })
                    ]),
                    is_leader: schema.string([
                        rules.minLength(1),
                        rules.maxLength(1)
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
                   
            const trx = await Database.transaction();
            try {
                let where_update = { contestteam_id: params.id }
                let data_update = {
                    contestteam_name: post.name,
                    contestteam_contest_id: post.contest_id
                }
                await trx
                    .from('data_contest_team')
                    .where(where_update)
                    .update(data_update);

                let where_member = { contestteammember_contestteam_id: params.id };
                await trx
                    .from('data_contest_team_member')
                    .where(where_member)
                    .delete();
                    
                for (let index = 0; index < post.member.length; index++) {
                    let data_insert_member = {
                        contestteammember_contestteam_id: params.id,
                        contestteammember_user_id: post.member[index].user_id,
                        contestteammember_is_leader: post.member[index].is_leader
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_team_member')
                        .insert(data_insert_member);
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
            let where_member = { contestteammember_contestteam_id: params.id };
            await trx
                .from('data_contest_team_member')
                .where(where_member)
                .delete();

            let where_delete = { contestteam_id: params.id }
            await trx
                .from('data_contest_team')
                .where(where_delete)
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