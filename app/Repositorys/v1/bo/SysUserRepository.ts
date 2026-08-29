import Database from '@ioc:Adonis/Lucid/Database'

export default class SysUserRepository {
    async getAll({request}) {
        let column = [
            'a.*',
            'role_name',
        ];

        let query = Database.query()
                            .select(column)
                            .from('sys_user as a')
                            .leftJoin('sys_role as b', 'b.role_id', 'a.user_role_id');

        if (typeof request.only(['role_id']).role_id !== 'undefined') {
            query.where('user_role_id', request.only(['role_id']).role_id)
        }

        if (typeof request.only(['search']).search !== 'undefined') {
            query.where((query) => {
                query
                    .where('user_name', 'like', '%' + request.only(['search']).search + '%')
                    .orWhere('role_name', 'like', '%' + request.only(['search']).search + '%');
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
}