import Database from '@ioc:Adonis/Lucid/Database'

export default class GeneralRepository {
    public async getWhereObject(table, where = [], orderBy = 1, order = 'asc') {
        return await Database.query().select('*').from(table).where(where).orderBy(orderBy, order);
    }

    public async getWhereRowObject(table, where = []) {
        return await Database.query().select('*').from(table).where(where).first();
    }

    public async insertData(table, data_insert) {
        return await Database.insertQuery().table(table).insert(data_insert);
    }

    public async updateData(table, data_update, where) {
        return await Database.from(table).where(where).update(data_update);
    }

    public async deleteData(table, where) {
        return await Database.query().table(table).where(where).delete();
    }

    public async dropdownData(table, id, name, where = []) {
        let column = [
            id + ' as id',
            name + ' as text'
        ];
        return await Database.query().select(column).from(table).where(where);
    }
     
    async canAccess(role_id, module_name, method_name) {
        let where = {
            apiaccess_role_id: role_id,
            api_name: module_name,
            apiaccess_method: method_name
        };
        
        let result = await Database.query()
                                    .select()
                                    .from('sys_api_access as a')
                                    .leftJoin('sys_api as b', 'b.api_id', 'a.apiaccess_api_id')
                                    .where(where)
                                    .first();
        return result;
    }

    async getMenuParent(user_role_id) {
        let column = [
            'b.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('sys_menu_access as a')
                            .leftJoin('sys_menu as b', 'b.menu_id', 'a.menuaccess_menu_id')
                            .where('b.menu_parent_id', 0)
                            .where('a.menuaccess_role_id', user_role_id)
                            .orderBy('b.menu_order', 'asc');

        return await query;
    }

    async getMenuChild(user_role_id, menu_id) {
        let column = [
            'b.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('sys_menu_access as a')
                            .leftJoin('sys_menu as b', 'b.menu_id', 'a.menuaccess_menu_id')
                            .where('b.menu_parent_id', menu_id)
                            .where('a.menuaccess_role_id', user_role_id)
                            .orderBy('b.menu_order', 'asc');

        return await query;
    }

    async getMenuAction(user_role_id, menu_id) {
        let column = [
            'action_id', 
            'action_name'
        ];

        let query = Database.query()
                            .select(column)
                            .from('sys_menu_action as a')
                            .leftJoin('sys_action as b', 'b.action_id', 'a.menuaction_action_id')
                            .where('a.menuaction_role_id', user_role_id)
                            .where('a.menuaction_menu_id', menu_id)
                            .orderBy('b.action_id', 'asc');

        return await query;
    }

    async getLastId($table, $id) {
        let query = Database.query()
                            .select($id)
                            .from($table)
                            .orderBy($id, 'desc')
                            .limit(1);

        return await query;
    }

}