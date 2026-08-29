import date from 'date-and-time'
import Hash from '@ioc:Adonis/Core/Hash';
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import RefMethodRepository from 'App/Repositorys/v1/bo/RefMethodRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const RefMethod = new RefMethodRepository()

export default class RefMethodController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('ref_method', 'method_id', 'method_name', where);
        } else {
            data = await RefMethod.getAll({request});
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

        let where = { method_id: params.id };
        let data = await General.getWhereRowObject('ref_method', where);
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
}