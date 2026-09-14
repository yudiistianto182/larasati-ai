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
                'b.casequestmc_score',
            ])
            .from('trx_response_mc as a')
            .leftJoin('data_case_quest_mc as b', 'b.casequestmc_id', 'a.responsemc_casequestmc_id')
            .where('a.responsemc_response_id', response_id)

        if (casequest_id) {
            query = query.where('a.responsemc_casequest_id', casequest_id)
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
                'b.casequestos_score',
            ])
            .from('trx_response_os as a')
            .leftJoin('data_case_quest_os as b', 'b.casequestos_id', 'a.responseos_casequestos_id')
            .where('a.responseos_response_id', response_id)

        if (casequest_id) {
            query = query.where('a.responseos_casequest_id', casequest_id)
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
                'b.casequestcioption_code',
                'b.casequestcioption_name',
                'b.casequestcioption_score',
            ])
            .from('trx_response_ci as a')
            .leftJoin('data_case_quest_ci_option as b', 'b.casequestcioption_id', 'a.responseci_casequestcioption_id')
            .where('a.responseci_response_id', response_id)

        if (casequest_id) {
            query = query.where('a.responseci_casequest_id', casequest_id)
        }

        return await query
    }

    /**
     * Hitung total skor dari semua pos untuk sebuah response_id
     */
    async getTotalScore(response_id: number | string) {
        const iaScore = await Database.query()
            .from('trx_response_ia_trigger')
            .where('responseiatrigger_response_id', response_id)
            .sum('responseiatrigger_score as total')
            .first()

        const mcScore = await Database.query()
            .from('trx_response_mc')
            .where('responsemc_response_id', response_id)
            .sum('responsemc_score as total')
            .first()

        const osScore = await Database.query()
            .from('trx_response_os')
            .where('responseos_response_id', response_id)
            .sum('responseos_score as total')
            .first()

        const ciScore = await Database.query()
            .from('trx_response_ci')
            .where('responseci_response_id', response_id)
            .sum('responseci_score as total')
            .first()

        const ia = Number(iaScore?.total || 0)
        const mc = Number(mcScore?.total || 0)
        const os = Number(osScore?.total || 0)
        const ci = Number(ciScore?.total || 0)

        return {
            ia,
            mc,
            os,
            ci,
            total: ia + mc + os + ci,
        }
    }
}