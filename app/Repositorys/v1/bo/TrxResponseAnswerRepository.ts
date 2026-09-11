import Database from '@ioc:Adonis/Lucid/Database'

export default class TrxResponseAnswerRepository {
    /**
     * Ambil semua jawaban MC per response_id dan casequest_id
     */
    async getAnswerMc(response_id: number | string, casequest_id?: number | string) {
        let query = Database.query()
            .select([
                'a.*',
                'b.casequestmc_name',
                'b.casequestmc_score_correct',
                'b.casequestmc_score_incorrect',
            ])
            .from('trx_response_answer_mc as a')
            .leftJoin('data_case_quest_mc as b', 'b.casequestmc_id', 'a.responseanswermc_casequestmc_id')
            .where('a.responseanswermc_response_id', response_id)

        if (casequest_id) {
            query = query.where('a.responseanswermc_casequest_id', casequest_id)
        }

        return await query
    }

    /**
     * Ambil semua jawaban OS (Ordering) per response_id dan casequest_id
     */
    async getAnswerOs(response_id: number | string, casequest_id?: number | string) {
        let query = Database.query()
            .select([
                'a.*',
                'b.casequestos_name',
                'b.casequestos_order',
                'b.casequestos_score_correct',
                'b.casequestos_score_incorrect',
            ])
            .from('trx_response_answer_os as a')
            .leftJoin('data_case_quest_os as b', 'b.casequestos_id', 'a.responseansweros_casequestos_id')
            .where('a.responseansweros_response_id', response_id)

        if (casequest_id) {
            query = query.where('a.responseansweros_casequest_id', casequest_id)
        }

        return await query
    }

    /**
     * Ambil semua jawaban CI (Image Choice) per response_id dan casequest_id
     */
    async getAnswerCi(response_id: number | string, casequest_id?: number | string) {
        let query = Database.query()
            .select([
                'a.*',
                'b.casequestci_name',
                'b.casequestci_image',
                'b.casequestci_score_correct',
            ])
            .from('trx_response_answer as a')
            .leftJoin('data_case_quest_ci as b', 'b.casequestci_id', 'a.responseanswer_casequest_id')
            .where('a.responseanswer_response_id', response_id)

        if (casequest_id) {
            query = query.where('a.responseanswer_casequest_id', casequest_id)
        }

        return await query
    }

    /**
     * Ambil semua jawaban general (trx_response_answer) per response_id
     */
    async getAnswerGeneral(response_id: number | string, casequest_id?: number | string) {
        let query = Database.query()
            .select(['a.*', 'b.casequest_name', 'b.casequest_method_id', 'b.casequest_order'])
            .from('trx_response_answer as a')
            .leftJoin('data_case_quest as b', 'b.casequest_id', 'a.responseanswer_casequest_id')
            .where('a.responseanswer_response_id', response_id)

        if (casequest_id) {
            query = query.where('a.responseanswer_casequest_id', casequest_id)
        }

        return await query
    }

    /**
     * Hitung total skor dari semua pos untuk sebuah response_id
     */
    async getTotalScore(response_id: number | string) {
        // Skor dari MC
        const mcScore = await Database.query()
            .from('trx_response_answer_mc')
            .where('responseanswermc_response_id', response_id)
            .sum('responseanswermс_score as total')
            .first()

        // Skor dari OSresponseanswermс_response_id
        const osScore = await Database.query()
            .from('trx_response_answer_os')
            .where('responseansweros_response_id', response_id)
            .sum('responseansweros_score as total')
            .first()

        // Skor dari CI (trx_response_answer)
        const ciScore = await Database.query()
            .from('trx_response_answer')
            .where('responseanswer_response_id', response_id)
            .sum('responseanswer_score as total')
            .first()

        return {
            mc: Number(mcScore?.total || 0),
            os: Number(osScore?.total || 0),
            ci: Number(ciScore?.total || 0),
            total: Number(mcScore?.total || 0) + Number(osScore?.total || 0) + Number(ciScore?.total || 0),
        }
    }

    /**
     * @deprecated - Gunakan method spesifik per tipe pos
     */
    async getDetail(id) {
        let column = ['a.*', 'b.*']
        let query = Database.query()
            .select(column)
            .from('trx_response_answer as a')
            .leftJoin('data_case_quest as b', 'b.casequest_id', 'a.responseanswer_casequest_id')
            .where('a.responseanswer_id', id)
        return await query
    }
}