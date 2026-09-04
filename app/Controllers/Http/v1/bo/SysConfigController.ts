import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'

const General = new GeneralRepository()

export default class SysConfigController {
    public async index({ request, response }) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('sys_config', 'config_name', 'config_value', where);
        }

        if (typeof data.length != 'undefined' || data.data[0]) {
            result = {
                status: true,
                message: 'Success',
                data: data
            }
            response.send(result);
        } else {
            result = {
                status: false,
                message: 'Data not found !',
                data: data
            }
            response.status(404).send(result);
        }
    }

    public async detail({ request, params, response }) {
        let result: object = {};

        let where = { config_name: params.id };
        let data = await General.getWhereRowObject('sys_config', where);
        if (data) {
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