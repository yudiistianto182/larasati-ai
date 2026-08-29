import Database from '@ioc:Adonis/Lucid/Database'

export default class DataContestRepository {
    async getAll({request}) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_contest as a');

        if (typeof request.only(['periode_id']).periode_id !== 'undefined') {
            query.where('contest_periode_id', request.only(['periode_id']).periode_id)
        }

        if (typeof request.only(['search']).search !== 'undefined') {
            query.where((query) => {
                query
                    .where('contest_name', 'like', '%' + request.only(['search']).search + '%')
                    .orWhere('contest_desc', 'like', '%' + request.only(['search']).search + '%');
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
            'a.*',
            'b.periode_name'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_contest as a')
                            .leftJoin('data_periode as b', 'b.periode_id', 'a.contest_periode_id')
                            .where('contest_id', id);

        return await query;
    }

    async getContestScorer(id) {
        let column = [
            'a.contestscorer_id',
            'b.user_fullname'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_contest_scorer as a')
                            .leftJoin('sys_user as b', 'b.user_id', 'a.contestscorer_user_id')
                            .where('contestscorer_contest_id', id);

        return await query;
    }
}