import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataCaseRepository from 'App/Repositorys/v1/bo/DataCaseRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const DataCase = new DataCaseRepository()

export default class DataCaseController {
    public async index({request, response}) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_case', 'case_id', 'case_name', where);
        } else {
            data = await DataCase.getAll({request});
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

        let where = { case_id: params.id };
        let data = await General.getWhereRowObject('data_case', where);
        if (data) {
            data.attribute = await General.getWhereObject('data_case_attribute', { caseattribute_case_id: params.id });
            data.quest = await General.getWhereObject('data_case_quest', { casequest_case_id: params.id });
            data.patient = await General.getWhereObject('data_case_patient', { casepatient_case_id: params.id });
            for (let index = 0; index < data.quest.length; index++) {
                let where_method = { method_id: data.quest[index].casequest_method_id };
                let method = await General.getWhereRowObject('ref_method', where_method);
                data.quest[index].method_name = method.method_name;
            }
            for (let index = 0; index < data.patient.length; index++) {
                let where_patient = { patient_id: data.patient[index].casepatient_patient_id };
                data.patient[index].patient = await General.getWhereRowObject('data_patient', where_patient);
                data.patient[index].patient.patient_age = await this.calculateAge(data.patient[index].patient.patient_birthdate);
                data.patient[index].patient.attribute = await General.getWhereObject('data_patient_attribute', { patientattribute_patient_id: data.patient[index].casepatient_patient_id });
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
            name: schema.string([
                rules.minLength(1)
            ]),
            desc: schema.string([
                rules.minLength(1)
            ]),
            introduction: schema.string([
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
            ),
            quest: schema.array().members(
                schema.object().members({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    method_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'ref_method', column: 'method_id' })
                    ]),
                    limit_time: schema.string([
                        rules.minLength(1)
                    ]),
                    order: schema.string([
                        rules.minLength(1)
                    ])
                })
            ),
            patient: schema.array().members(
                schema.object().members({
                    patient_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_patient', column: 'patient_id' })
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
                    case_name: post.name,
                    case_desc: post.desc,
                    case_introduction: post.introduction
                }
                let case_id = await trx
                                    .insertQuery()
                                    .table('data_case')
                                    .insert(data_insert);

                for (let index = 0; index < post.attribute.length; index++) {
                    let data_insert_attribute = {
                        caseattribute_case_id: case_id[0],
                        caseattribute_name: post.attribute[index].name,
                        caseattribute_value: post.attribute[index].value
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_attribute')
                        .insert(data_insert_attribute);
                }  

                for (let index = 0; index < post.quest.length; index++) {
                    let data_insert_quest = {
                        casequest_case_id: case_id[0],
                        casequest_name: post.quest[index].name,
                        casequest_method_id: post.quest[index].method_id,
                        casequest_limit_time: post.quest[index].limit_time,
                        casequest_order: post.quest[index].order
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_quest')
                        .insert(data_insert_quest);
                }  

                for (let index = 0; index < post.patient.length; index++) {
                    let data_insert_patient = {
                        casepatient_case_id: case_id[0],
                        casepatient_patient_id: post.patient[index].patient_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_patient')
                        .insert(data_insert_patient);
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
            desc: schema.string([
                rules.minLength(1)
            ]),
            introduction: schema.string([
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
            ),
            quest: schema.array().members(
                schema.object().members({
                    name: schema.string([
                        rules.minLength(1)
                    ]),
                    method_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'ref_method', column: 'method_id' })
                    ]),
                    limit_time: schema.string([
                        rules.minLength(1)
                    ]),
                    order: schema.string([
                        rules.minLength(1)
                    ])
                })
            ),
            patient: schema.array().members(
                schema.object().members({
                    patient_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_patient', column: 'patient_id' })
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
                   
            const trx = await Database.transaction();
            try {
                let where_update = { case_id: params.id }
                let data_update = {
                    case_name: post.name,
                    case_desc: post.desc,
                    case_introduction: post.introduction
                }
                await trx
                    .from('data_case')
                    .where(where_update)
                    .update(data_update);

                let where_attribute = { caseattribute_id: params.id };
                await trx
                    .from('data_case_attribute')
                    .where(where_attribute)
                    .delete();

                let where_quest = { casequest_id: params.id };
                await trx
                    .from('data_case_quest')
                    .where(where_quest)
                    .delete();

                let where_patient = { casepatient_case_id: params.id };
                await trx
                    .from('data_case_patient')
                    .where(where_patient)
                    .delete();

                for (let index = 0; index < post.attribute.length; index++) {
                    let data_insert_attribute = {
                        caseattribute_case_id: params.id,
                        caseattribute_name: post.attribute[index].name,
                        caseattribute_value: post.attribute[index].value
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_attribute')
                        .insert(data_insert_attribute);
                }  

                for (let index = 0; index < post.quest.length; index++) {
                    let data_insert_quest = {
                        casequest_case_id: params.id,
                        casequest_name: post.quest[index].name,
                        casequest_method_id: post.quest[index].method_id,
                        casequest_limit_time: post.quest[index].limit_time,
                        casequest_order: post.quest[index].order
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_quest')
                        .insert(data_insert_quest);
                }

                for (let index = 0; index < post.patient.length; index++) {
                    let data_insert_patient = {
                        casepatient_case_id: params.id,
                        casepatient_patient_id: post.patient[index].patient_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_patient')
                        .insert(data_insert_patient);
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
            let where_attribute = { caseattribute_case_id: params.id };
            await trx
                .from('data_case_attribute')
                .where(where_attribute)
                .delete();

            let where_quest = { casequest_case_id: params.id };
            await trx
                .from('data_case_quest')
                .where(where_quest)
                .delete();

            let where_case = { case_id: params.id };
            await trx
                .from('data_case')
                .where(where_case)
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

    private async calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();

        let age = today.getFullYear() - birth.getFullYear();

        const hasNotHadBirthday =
            today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() &&
            today.getDate() < birth.getDate());

        if (hasNotHadBirthday) {
            age--;
        }

        return age;
    }

}