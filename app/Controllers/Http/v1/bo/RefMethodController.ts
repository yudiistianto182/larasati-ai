import { schema, rules, validator } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import RefMethodRepository from 'App/Repositorys/v1/bo/RefMethodRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
const RefMethod = new RefMethodRepository()

export default class RefMethodController {
    public async index({ request, response }) {
        let data: any = [];
        let result: object = {};
        let where: object = {};

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('ref_method', 'method_id', 'method_name', where);
        } else {
            data = await RefMethod.getAll({ request });
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * (data.currentPage - 1)) + index + 1;
                }
            }
        }

        if (typeof data.length != 'undefined' || data.data?.[0] || data.rows?.[0]) {
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
        let data = await RefMethod.getDetail(params.id);

        if (data) {
            result = {
                status: true,
                message: 'Success',
                data: data
            }
            response.send(result);
        } else {
            result = {
                status: false,
                message: 'Data not found !'
            }
            response.status(404).send(result);
        }
    }

    public async store({ request, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            method_name: schema.string.optional([rules.minLength(1)]),
            name: schema.string.optional([rules.minLength(1)]),
            rule: schema.array.optional().members(
                schema.object().anyMembers({
                    methodrule_text: schema.string.optional([rules.minLength(1)]),
                    text: schema.string.optional([rules.minLength(1)]),
                    methodrule_order: schema.number.optional(),
                    order: schema.number.optional(),
                    detail: schema.array.optional().members(
                        schema.object().anyMembers({
                            methodruledetail_text: schema.string.optional([rules.minLength(1)]),
                            text: schema.string.optional([rules.minLength(1)]),
                            methodruledetail_order: schema.number.optional(),
                            order: schema.number.optional()
                        })
                    )
                })
            )
        });

        try {
            let post = this.parseNestedKeys(request.all());
            await validator.validate({ schema: validationSchema, data: post });

            const methodName = post.method_name ?? post.name;
            if (!methodName) {
                return response.badRequest({
                    status: false,
                    message: 'Nama method (method_name atau name) wajib diisi.'
                });
            }

            const trx = await Database.transaction();
            try {
                let data_insert_method = {
                    method_name: methodName
                };

                let method_id = await trx
                    .insertQuery()
                    .table('ref_method')
                    .insert(data_insert_method);

                // Insert Rules
                if (post.rule && Array.isArray(post.rule)) {
                    for (let rIndex = 0; rIndex < post.rule.length; rIndex++) {
                        const ruleItem = post.rule[rIndex];
                        let data_insert_rule = {
                            methodrule_method_id: method_id[0],
                            methodrule_text: ruleItem.methodrule_text ?? ruleItem.text ?? '',
                            methodrule_order: ruleItem.methodrule_order ?? ruleItem.order ?? (rIndex + 1)
                        };

                        let rule_id = await trx
                            .insertQuery()
                            .table('ref_method_rule')
                            .insert(data_insert_rule);

                        // Insert Rule Details
                        if (ruleItem.detail && Array.isArray(ruleItem.detail)) {
                            for (let dIndex = 0; dIndex < ruleItem.detail.length; dIndex++) {
                                const detailItem = ruleItem.detail[dIndex];
                                let data_insert_detail = {
                                    methodruledetail_methodrule_id: rule_id[0],
                                    methodruledetail_text: detailItem.methodruledetail_text ?? detailItem.text ?? '',
                                    methodruledetail_order: detailItem.methodruledetail_order ?? detailItem.order ?? (dIndex + 1)
                                };

                                await trx
                                    .insertQuery()
                                    .table('ref_method_rule_detail')
                                    .insert(data_insert_detail);
                            }
                        }
                    }
                }

                await trx.commit();
                result = {
                    status: true,
                    message: 'Success !',
                    data: {
                        method_id: method_id[0]
                    }
                };
                response.send(result);
            } catch (error: any) {
                await trx.rollback();
                console.error('[RefMethod.store] Error:', error);
                result = {
                    status: false,
                    message: error.sqlMessage || error.message || 'Gagal menyimpan data ref_method.'
                };
                response.badRequest(result);
            }
        } catch (error: any) {
            console.error('[RefMethod.store] Validation Error:', error);
            const errMsg = error.messages?.errors?.[0]
                ? `${error.messages.errors[0].field} ${error.messages.errors[0].message}`
                : (error.message || 'Validation error');
            result = {
                status: false,
                message: errMsg,
                validation_errors: error.messages?.errors
            };
            response.badRequest(result);
        }
    }

    public async update({ request, params, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            method_name: schema.string.optional([rules.minLength(1)]),
            name: schema.string.optional([rules.minLength(1)]),
            rule: schema.array.optional().members(
                schema.object().anyMembers({
                    methodrule_text: schema.string.optional([rules.minLength(1)]),
                    text: schema.string.optional([rules.minLength(1)]),
                    methodrule_order: schema.number.optional(),
                    order: schema.number.optional(),
                    detail: schema.array.optional().members(
                        schema.object().anyMembers({
                            methodruledetail_text: schema.string.optional([rules.minLength(1)]),
                            text: schema.string.optional([rules.minLength(1)]),
                            methodruledetail_order: schema.number.optional(),
                            order: schema.number.optional()
                        })
                    )
                })
            )
        });

        try {
            let post = this.parseNestedKeys(request.all());
            await validator.validate({ schema: validationSchema, data: post });

            const methodName = post.method_name ?? post.name;
            const trx = await Database.transaction();

            try {
                let data_update_method: any = {};
                if (methodName !== undefined) data_update_method.method_name = methodName;

                if (Object.keys(data_update_method).length > 0) {
                    await trx
                        .from('ref_method')
                        .where('method_id', params.id)
                        .update(data_update_method);
                }

                // Jika rule dikirim (meskipun array kosong), perbarui data rule & detail
                if (post.rule !== undefined && Array.isArray(post.rule)) {
                    // Ambil ID rules lama untuk hapus detailnya
                    const oldRules = await trx
                        .from('ref_method_rule')
                        .where('methodrule_method_id', params.id)
                        .select('methodrule_id');

                    const oldRuleIds = oldRules.map((r: any) => r.methodrule_id);
                    if (oldRuleIds.length > 0) {
                        await trx
                            .from('ref_method_rule_detail')
                            .whereIn('methodruledetail_methodrule_id', oldRuleIds)
                            .delete();
                    }

                    await trx
                        .from('ref_method_rule')
                        .where('methodrule_method_id', params.id)
                        .delete();

                    // Insert ulang Rules baru
                    for (let rIndex = 0; rIndex < post.rule.length; rIndex++) {
                        const ruleItem = post.rule[rIndex];
                        let data_insert_rule = {
                            methodrule_method_id: params.id,
                            methodrule_text: ruleItem.methodrule_text ?? ruleItem.text ?? '',
                            methodrule_order: ruleItem.methodrule_order ?? ruleItem.order ?? (rIndex + 1)
                        };

                        let rule_id = await trx
                            .insertQuery()
                            .table('ref_method_rule')
                            .insert(data_insert_rule);

                        // Insert Rule Details
                        if (ruleItem.detail && Array.isArray(ruleItem.detail)) {
                            for (let dIndex = 0; dIndex < ruleItem.detail.length; dIndex++) {
                                const detailItem = ruleItem.detail[dIndex];
                                let data_insert_detail = {
                                    methodruledetail_methodrule_id: rule_id[0],
                                    methodruledetail_text: detailItem.methodruledetail_text ?? detailItem.text ?? '',
                                    methodruledetail_order: detailItem.methodruledetail_order ?? detailItem.order ?? (dIndex + 1)
                                };

                                await trx
                                    .insertQuery()
                                    .table('ref_method_rule_detail')
                                    .insert(data_insert_detail);
                            }
                        }
                    }
                }

                await trx.commit();
                result = {
                    status: true,
                    message: 'Success !'
                };
                response.send(result);
            } catch (error: any) {
                await trx.rollback();
                console.error('[RefMethod.update] Error:', error);
                result = {
                    status: false,
                    message: error.sqlMessage || error.message || 'Gagal memperbarui data ref_method.'
                };
                response.badRequest(result);
            }
        } catch (error: any) {
            console.error('[RefMethod.update] Validation Error:', error);
            const errMsg = error.messages?.errors?.[0]
                ? `${error.messages.errors[0].field} ${error.messages.errors[0].message}`
                : (error.message || 'Validation error');
            result = {
                status: false,
                message: errMsg,
                validation_errors: error.messages?.errors
            };
            response.badRequest(result);
        }
    }

    public async destroy({ request, params, response }) {
        let result: object = {};
        const trx = await Database.transaction();

        try {
            // Ambil ID rules lama untuk hapus detailnya
            const oldRules = await trx
                .from('ref_method_rule')
                .where('methodrule_method_id', params.id)
                .select('methodrule_id');

            const oldRuleIds = oldRules.map((r: any) => r.methodrule_id);
            if (oldRuleIds.length > 0) {
                await trx
                    .from('ref_method_rule_detail')
                    .whereIn('methodruledetail_methodrule_id', oldRuleIds)
                    .delete();
            }

            await trx
                .from('ref_method_rule')
                .where('methodrule_method_id', params.id)
                .delete();

            await trx
                .from('ref_method')
                .where('method_id', params.id)
                .delete();

            await trx.commit();
            result = {
                status: true,
                message: 'Success !'
            };
            response.send(result);
        } catch (error: any) {
            await trx.rollback();
            console.error('[RefMethod.destroy] Error:', error);
            result = {
                status: false,
                message: error.sqlMessage || error.message || 'Gagal menghapus data ref_method.'
            };
            response.badRequest(result);
        }
    }

    private parseNestedKeys(obj: Record<string, any>) {
        const result: any = {};
        for (const key of Object.keys(obj)) {
            if (key.includes('[') && key.includes(']')) {
                const parts = key.replace(/\]/g, '').split(/\[|\./);
                let current = result;
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];
                    const isLast = i === parts.length - 1;
                    const nextPart = parts[i + 1];
                    const isNextNumber = !isNaN(Number(nextPart));

                    if (isLast) {
                        current[part] = obj[key];
                    } else {
                        if (current[part] === undefined) {
                            current[part] = isNextNumber ? [] : {};
                        }
                        current = current[part];
                    }
                }
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    }
}