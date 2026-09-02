import Database from '@ioc:Adonis/Lucid/Database'

export default class TrxResponseAnswerRepository {
    async getDetailByResponse(id) {
        let column = [
            'a.*',
            'b.*'
        ];

        let query = Database.query()
                            .select(column)
                            .from('trx_response_answer as a')
                            .leftJoin('data_case_quest as b', 'b.casequest_id', 'a.responseanswer_casequest_id')
                            .where('a.reponseanswer_response_id', id);
                            .first();

        return await query;
    }
}