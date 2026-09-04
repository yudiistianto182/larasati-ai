import Database from '@ioc:Adonis/Lucid/Database'

export default class TrxResponseRepository {
    async getAll({ request }) {
        let column = [
            'a.*',
            'b.contestteam_name',
            'c.contest_name',
            'd.case_name',
            'e.patient_id'
        ];

        let query = Database.query()
            .select(column)
            .from('trx_response as a')
            .leftJoin('data_contest_team as b', 'b.contestteam_id', 'a.response_contestteam_id')
            .leftJoin('data_contest as c', 'c.contest_id', 'a.response_contestteam_id')
            .leftJoin('data_case as d', 'd.case_id', 'a.response_case_id')
            .leftJoin('data_patient as e', 'e.patient_id', 'a.response_patient_id');

        if (typeof request.only(['contest_id']).contest_id !== 'undefined') {
            query.where('response_contest_id', request.only(['contest_id']).contest_id)
        }

        if (typeof request.only(['case_id']).case_id !== 'undefined') {
            query.where('response_cose_id', request.only(['case_id']).case_id)
        }

        if (typeof request.only(['patient_id']).patient_id !== 'undefined') {
            query.where('response_patient_id', request.only(['patient_id']).patient_id)
        }

        if (typeof request.only(['search']).search !== 'undefined') {
            query.where((query) => {
                query
                    .where('contestteam_name', 'like', '%' + request.only(['search']).search + '%')
                    .orWhere('contest_name', 'like', '%' + request.only(['search']).search + '%')
                    .orWhere('case_name', 'like', '%' + request.only(['search']).search + '%');
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
            'b.contestteam_name',
            'c.contest_name',
            'c.contest_desc',
            'c.contest_datestart',
            'c.contest_dateend',
            'd.case_name',
            'e.patient_id',
            'e.patient_gender',
            'e.patient_birthdate',
            'e.patient_photo',
            'e.patient_photo_path',
            'd.case_introduction'
        ];

        let query = Database.query()
            .select(column)
            .from('trx_response as a')
            .leftJoin('data_contest_team as b', 'b.contestteam_id', 'a.response_contestteam_id')
            .leftJoin('data_contest as c', 'c.contest_id', 'a.response_contestteam_id')
            .leftJoin('data_case as d', 'd.case_id', 'a.response_case_id')
            .leftJoin('data_patient as e', 'e.patient_id', 'a.response_patient_id')
            .where('a.response_id', id)
            .first();

        return await query;
    }
}