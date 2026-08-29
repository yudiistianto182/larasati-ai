import Database from '@ioc:Adonis/Lucid/Database'

export default class DataCaseRepository {
    async getAll({request}) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_case as a');

        if (typeof request.only(['search']).search !== 'undefined') {
            query.where((query) => {
                query
                    .where('case_name', 'like', '%' + request.only(['search']).search + '%')
                    .orWhere('case_desc', 'like', '%' + request.only(['search']).search + '%');
            })
        }

        if (typeof request.only(['order']).order !== 'undefined' && request.only(['order_by']).order_by !== 'null') {
            query.orderBy(request.only(['order_by']).order_by, request.only(['order']).order);
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

    async getDetail(id) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_case as a')
                            .where('case_id', id);

        return await query;
    }
}