import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataCaseQuestRepository from 'App/Repositorys/v1/bo/DataCaseQuestRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const DataCaseQuest= new DataCaseQuestRepository()

export default class DataCaseController {
    public async detail ({request, params, response}) {
        let result: object = {};

        let where = { casequest_id: params.id };
        let data = await General.getWhereRowObject('data_case_quest', where);
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
            casequest_id: schema.string([
                rules.minLength(1)
            ]),
            answer: schema.array().members(
                schema.object().members({
                    name: schema.string([
                        rules.minLength(1)
                    ]), 
                    value:schema.string([
                        rules.minLength(1)
                    ]),
                    step: schema.string([
                        rules.minLength(1)
                    ])
                })
            )
        });
        
        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
            let where_casequest = { casequest_id: post.casequest_id };
            let detail_casequest = await General.getWhereRowObject('data_case_quest', where_casequest);
            if (!detail_casequest) {
                result = {
                    status: false,
                    message: 'Data quest not found !'
                }
                response.status(404).send(result);
            }


            const trx = await Database.transaction();
            try {

                for (let index = 0; index < post.step.length; index++) {
                    let data_insert_quest_answer = {
                        casequestanswer_casequest_id: post.casequest_id,
                        casequestanswer_name: post.quest[index].name,
                        casequestanswer_value: post.quest[index].value, // image url 
                        casequestanswer_step: post.quest[index].step 
                    }
                    await trx
                        .insertQuery()
                        .table('data_case_quest_answer')
                        .insert(data_insert_quest_answer);

                }
                
                switch (detail_casequest.casequest_method_id) {
                    case '1': 
                        for (let index = 0; index < post.quest.length; index++) {
                            let data_insert = {
                                casequestia_casequest_id: post.casequest_id,
                                casequestia_key: post.quest[index].key,
                                casequestia_check: post.quest[index].check,
                                casequestia_keyword: post.quest[index].keyword,
                                casequestia_unknown: post.quest[index].casequestia_unknown
                            }
                            await trx
                                .insertQuery()
                                .table('data_case_quest_ia')
                                .insert(data_insert);
                        }
                        break;
                    
                    case '2': 
                        for (let index = 0; index < post.quest.length; index++) {
                            let data_insert = {
                                casequestmc_casequest_id: post.casequest_id,
                                casequestmc_name: post.quest[index].name,
                                casequestmc_value: post.quest[index].value
                            }
                            await trx
                                .insertQuery()
                                .table('data_case_quest_mc')
                                .insert(data_insert);
                        }
                        break;
                    
                    case '3': 
                        for (let index = 0; index < post.quest.length; index++) {
                            let data_insert = {
                                casequestos_casequest_id: post.casequest_id,
                                casequestos_name: post.quest[index].key,
                                casequestmc_value: post.quest[index].check,
                                casequestos_step: post.quest[index].step
                            }
                            await trx
                                .insertQuery()
                                .table('data_case_quest_os')
                                .insert(data_insert);
                        }
                        break;

                    case '4': 
                        const quest_image = request.allFiles().quest_image || [];
                        for (const item of quest_image) {
                            const file = item.file;
                            await file.move('storage/recordings');
                            const filePath = file.filePath;
                            
                            let data_insert = {
                                casequestci_casequest_id: post.casequest_id,
                                casequestci_name: post.quest[index].name,
                                casequestci_image: filePath,

                            }
                            await trx
                                .insertQuery()
                                .table('data_case_quest_os')
                                .insert(data_insert);
                            
                        }

                        break;
                
                    default:
                        break;
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
}