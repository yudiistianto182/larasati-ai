import Database from '@ioc:Adonis/Lucid/Database'

export default class TrxResponseAnswerRepository {
    async getQuestIa(id) {
        let column = [
            'a.*',
            'b.*'
        ];

        let query = Database.query()
            .select(column)
            .from('trx_response_answer as a')
            .leftJoin('data_case_quest as b', 'b.casequest_id', 'a.responseanswer_casequest_id')
            .where('a.reponseanswer_id', id)

        return await query;
    }

    async getQuestMc(id) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
            .select(column)
            .from('data_case_quest_mc as a')
            .where('a.casequestmc_casequest_id', id)

        return await query;
    }

    async getQuestOs(id) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
            .select(column)
            .from('data_case_quest_os as a')
            .where('a.casequestos_casequest_id', id)

        return await query;
    }

    async getQuestCi(id) {
        let column = [
            'a.*'
        ];

        let query = Database.query()
            .select(column)
            .from('data_case_quest_ci as a')
            .where('a.casequestci_casequest_id', id)

        return await query;
    }
}