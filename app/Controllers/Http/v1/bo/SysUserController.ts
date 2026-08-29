import date from 'date-and-time'
import Hash from '@ioc:Adonis/Core/Hash';
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import SysUserRepository from 'App/Repositorys/v1/bo/SysUserRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const SysUser = new SysUserRepository()

export default class SysUserController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('sys_user', 'user_id', 'user_name', where);
        } else {
            data = await SysUser.getAll({request});
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * ( data.currentPage - 1 )) + index + 1;
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

        let where = { user_id: params.id };
        let data = await General.getWhereRowObject('sys_user', where);
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

        if (await request.auth.user_role_id == 1) {
            const validationSchema = schema.create({
                user_name: schema.string([
                    rules.minLength(4)
                ]),
                user_fullname: schema.string([
                    rules.minLength(4)
                ]),
                user_email: schema.string([
                    rules.email()
                ]),
                user_password: schema.string([
                    rules.minLength(4)
                ]),
                user_role_id: schema.string([
                    rules.minLength(1),
                    rules.maxLength(1)
                ])
            });
            
            try {
                await request.validate({ schema: validationSchema });
    
                let post = request.body();
                
                let where_user = { user_name: post.user_name }
                let user_detail = await General.getWhereRowObject('sys_user', where_user);
                if (!user_detail) {        
                    const trx = await Database.transaction();
                    try {
                        let data_insert = {
                            user_name: post.user_name,
                            user_fullname: post.user_fullname,
                            user_email: post.user_email,
                            user_role_id: post.user_role_id,
                            user_is_banned: post.user_is_banned,
                            user_password: await Hash.make(post.user_password),
                            // insert_user_id: await request.auth.user_id,
                            // insert_timestamp: date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
                        }
                        await trx
                            .insertQuery()
                            .table('sys_user')
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
                            message : 'Error transaction database !'
                        }
                        response.badRequest(result);
                        await trx.rollback();
                    }
                } else {
                    result = {
                        status : false,
                        message : 'Error, user name has registered !'
                    }
                    response.badRequest(result);
                }
            } catch (error) {
                result = {
                    status: false,
                    message: error.messages.errors[0].field + ' ' + error.messages.errors[0].message
                }
                response.badRequest(result);
            }
        } else {
            result = {
                status : false,
                message : 'User level cant access'
            }
            response.status(404).send(result);
        }     
    }

    public async update ({request, params, response}) {
        let result: object = {};

        const validationSchema = schema.create({
            user_name: schema.string([
                rules.minLength(4)
            ]),
            user_fullname: schema.string([
                rules.minLength(4)
            ]),
            user_email: schema.string([
                rules.email()
            ]),
            user_password: schema.string([
                rules.minLength(4)
            ]),
            user_role_id: schema.string([
                rules.minLength(1),
                rules.maxLength(1)
            ])
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
                   
            const trx = await Database.transaction();
            try {
                let where_update = { user_id: params.id }
                let data_update = {
                    user_name: post.user_name,
                    user_fullname: post.user_fullname,
                    user_email: post.user_email,
                    user_role_id: post.user_role_id,
                    user_is_banned: post.user_is_banned,
                    user_password: await Hash.make(post.user_password),
                    // update_user_id: await request.auth.user_id,
                    // update_timestamp: date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
                }
                await trx
                    .from('sys_user')
                    .where(where_update)
                    .update(data_update);
        
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
                    message : 'Error transaction database !'
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
            let where = { user_id: params.id };
            await trx
                .from('sys_user')
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
                message : error.detail
            }
            response.badRequest(result);
            await trx.rollback();
        } 
    }
}