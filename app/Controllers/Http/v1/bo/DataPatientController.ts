import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataPatientRepository from 'App/Repositorys/v1/bo/DataPatientRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const DataPatient = new DataPatientRepository()

export default class DataPatientController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_patient', 'patient_id', 'patient_name', where);
        } else {
            data = await DataPatient.getAll({request});
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * ( data.currentPage - 1 )) + index + 1;
                    // data.rows[index].patient_birthdate_text = date.format(new Date(data.rows[index].patient_birthdate), 'YYYY-MM-DD');
                }
            } else {
                for (let index = 0; index < data.length; index++) {
                    // data[index].patient_birthdate_text = date.format(new Date(data[index].patient_birthdate), 'YYYY-MM-DD');
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

        let where = { patient_id: params.id };
        let data = await General.getWhereRowObject('data_patient', where);
        if (data) {
            data.patient_birthdate_text = date.format(new Date(data.patient_birthdate), 'YYYY-MM-DD');
            let where_patient_attribute = { patientattribute_patient_id: params.id };
            data.attribute = await General.getWhereObject('data_patient_attribute', where_patient_attribute);
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
            birthdate: schema.string([
                rules.minLength(1)
            ]),
            gender: schema.string([
                rules.minLength(1)
            ]),
            attribute: schema.array().members(
                schema.object().members({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    value: schema.string([
                        rules.minLength(1)
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
                    patient_name: post.name,
                    patient_birthdate: post.birthdate,
                    patient_gender: post.gender,
                    patient_birthdate: post.birthdate
                }
                let contest_id = await trx
                                    .insertQuery()
                                    .table('data_patient')
                                    .insert(data_insert);

                for (let index = 0; index < post.attribute.length; index++) {
                    let data_insert_attribute = {
                        patientattribute_patient_id: contest_id[0],
                        patientattribute_name: post.attribute[index].name,
                        patientattribute_value: post.attribute[index].value
                    }
                    await trx
                        .insertQuery()
                        .table('data_patient_attribute')
                        .insert(data_insert_attribute);
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
            birthdate: schema.string([
                rules.minLength(1)
            ]),
            gender: schema.string([
                rules.minLength(1)
            ]),
            attribute: schema.array().members(
                schema.object().members({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    value: schema.string([
                        rules.minLength(1)
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
                   
            const trx = await Database.transaction();
            try {
                let where_update = { patient_id: params.id }
                let data_update = {
                    patient_name: post.name,
                    patient_birthdate: post.birthdate,
                    patient_gender: post.gender
                }
                await trx
                    .from('data_patient')
                    .where(where_update)
                    .update(data_update);

                let where_attribute = { patientattribute_patient_id: params.id };
                await trx
                    .from('data_patient_attribute')
                    .where(where_attribute)
                    .delete();

                for (let index = 0; index < post.attribute.length; index++) {
                    let data_insert_attribute = {
                        patientattribute_patient_id: params.id,
                        patientattribute_name: post.attribute[index].name,
                        patientattribute_value: post.attribute[index].value
                    }
                    await trx
                        .insertQuery()
                        .table('data_patient_attribute')
                        .insert(data_insert_attribute);
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
            let where_update = { patient_id: params.id }
            let data_update = { patient_is_deleted: 1 }
            await trx
                .from('data_patient')
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
    }
}