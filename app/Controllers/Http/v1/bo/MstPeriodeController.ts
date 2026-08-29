import date from 'date-and-time'
import Hash from '@ioc:Adonis/Core/Hash';
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import MstPeriodeRepository from 'App/Repositorys/v1/bo/MstPeriodeRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const MstPeriode = new MstPeriodeRepository()

export default class MstPeriodeController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('mst_periode', 'periode_id', 'periode_name', where);
        } else {
            data = await MstPeriode.getAll({request});
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * ( data.currentPage - 1 )) + index + 1;
                    const contest = await General.getWhereObject('data_contest', { contest_periode_id: data.rows[index].periode_id });
                    data.rows[index].contest = await this.getPeriodeDate(contest);
                    if (data.rows[index].contest.periode_start && data.rows[index].contest.periode_end) {
                        data.rows[index].contest.periode_start_text = date.format(new Date(data.rows[index].contest.periode_start), 'YYYY-MM-DD');
                        data.rows[index].contest.periode_end_text = date.format(new Date(data.rows[index].contest.periode_end), 'YYYY-MM-DD');
                    }
                }
            } else {
                for (let index = 0; index < data.length; index++) { 
                    const contest = await General.getWhereObject('data_contest', { contest_periode_id: data[index].periode_id });
                    data[index].contest = await this.getPeriodeDate(contest);
                    if (data[index].contest.periode_start && data[index].contest.periode_end) {
                        data[index].contest.periode_start_text = date.format(new Date(data[index].contest.periode_start), 'YYYY-MM-DD');
                        data[index].contest.periode_end_text = date.format(new Date(data[index].contest.periode_end), 'YYYY-MM-DD');
                    }
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

        let where = { periode_id: params.id };
        let data = await General.getWhereRowObject('mst_periode', where);
        if (data) {
            const contest = await General.getWhereObject('data_contest', { contest_periode_id: data.periode_id });
            data.contest = await this.getPeriodeDate(contest);
            if (data.contest.periode_start && data.contest.periode_end) {
                data.contest.periode_start_text = date.format(new Date(data.contest.periode_start), 'YYYY-MM-DD');
                data.contest.periode_end_text = date.format(new Date(data.contest.periode_end), 'YYYY-MM-DD');
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

    public async store ({request, response}) {
        let result: object = {};

        const validationSchema = schema.create({
            periode_name: schema.string([
                rules.minLength(1)
            ])
        });
        
        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
            const trx = await Database.transaction();
            try {
                let data_insert = {
                    periode_name: post.periode_name
                }
                await trx
                    .insertQuery()
                    .table('mst_periode')
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
            periode_name: schema.string([
                rules.minLength(1)
            ])
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
                   
            const trx = await Database.transaction();
            try {
                let where_update = { periode_id: params.id }
                let data_update = {
                    periode_name: post.periode_name,
                    // update_user_id: await request.auth.user_id,
                    // update_timestamp: date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
                }
                await trx
                    .from('mst_periode')
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
            let where = { periode_id: params.id };
            await trx
                .from('mst_periode')
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

    private async getPeriodeDate(contest) {
    if (!contest || contest.length === 0) {
        return {
            periode_start: null,
            periode_end: null
        };
    }

    const starts = contest
        .map(item => new Date(item.contest_datestart))
        .filter(date => !isNaN(date));

    const ends = contest
        .map(item => new Date(item.contest_dateend))
        .filter(date => !isNaN(date));

    return {
        periode_start: starts.length
            ? new Date(Math.min(...starts)).toISOString()
            : null,

        periode_end: ends.length
            ? new Date(Math.max(...ends)).toISOString()
            : null
    };
}
}