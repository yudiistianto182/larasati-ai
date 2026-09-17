import Database from '@ioc:Adonis/Lucid/Database'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'

const General = new GeneralRepository()

export default class RefMethodRepository {
    async getAll({ request }) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
            .select(column)
            .from('ref_method as a');

        if (typeof request.only(['search']).search !== 'undefined' && request.only(['search']).search) {
            query.where((subquery) => {
                subquery
                    .where('method_name', 'like', '%' + request.only(['search']).search + '%');
            });
        }

        if (typeof request.only(['order']).order !== 'undefined' && request.only(['order_by']).order_by !== 'null') {
            query.orderBy(request.only(['order_by']).order_by, request.only(['order']).order);
        } else {
            query.orderBy('a.method_id', 'asc');
        }

        if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
            if (request.only(['limit']).limit != -1) {
                query = query.paginate(request.only(['page']).page, request.only(['limit']).limit);
            } else {
                query = query.paginate(request.only(['page']).page, 10000);
            }
        }

        return await query;
    }

    async getDetail(id: number | string) {
        let where = { method_id: id };
        let data = await General.getWhereRowObject('ref_method', where);
        if (!data) return null;

        // Ambil data ref_method_rule
        let rules = await Database.query()
            .from('ref_method_rule')
            .where('methodrule_method_id', id)
            .orderBy('methodrule_order', 'asc');

        // Ambil data ref_method_rule_detail untuk tiap rule
        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];
            rule.detail = await Database.query()
                .from('ref_method_rule_detail')
                .where('methodruledetail_methodrule_id', rule.methodrule_id)
                .orderBy('methodruledetail_order', 'asc');
        }

        data.rule = rules;
        return data;
    }
}