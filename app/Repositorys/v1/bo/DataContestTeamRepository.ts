import Database from '@ioc:Adonis/Lucid/Database'

export default class DataContestTeamRepository {
    async getAll({request}) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_contest_team as a');

        if (typeof request.only(['contest_id']).contest_id !== 'undefined') {
            query.where('contestteam_contest_id', request.only(['contest_id']).contest_id)
        }

        if (typeof request.only(['search']).search !== 'undefined') {
            query.where((query) => {
                query
                    .where('contestteam_name', 'like', '%' + request.only(['search']).search + '%')
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
            'b.contest_name',
            'c.periode_id'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_contest_team as a')
                            .leftJoin('data_contest as b', 'b.contest_id', 'a.contestteam_contest_id')
                            .leftJoin('data_periode as c', 'c.periode_id', 'b.contest_periode_id')
                            .where('contestteam_id', id);

        return await query;
    }
    
    async getTeamMember(id) {
        let column = [
            'a.*',
            'b.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('data_contest_team_member as a')
                            .leftJoin('sys_user as b', 'b.user_id', 'a.contestteammember_user_id')
                            .where('contestteammember_contestteam_id', id);

        return await query;
    }
}