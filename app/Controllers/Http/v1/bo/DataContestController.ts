import date from 'date-and-time'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
import DataContestRepository from 'App/Repositorys/v1/bo/DataContestRepository'
import Database from '@ioc:Adonis/Lucid/Database'
import TrxResponseController from './TrxResponseController'

const General = new GeneralRepository()
const DataContest = new DataContestRepository()
const TrxResponseCtrl = new TrxResponseController()

export default class DataContestController {
    public async index({ request, response }) {
        let data: Array<string> = [];
        let result: object = {};
        let where: object = { contest_is_deleted: 0 };

        if (request.only(['dropdown']).dropdown) {
            data = await General.dropdownData('data_contest', 'contest_id', 'contest_name', where);
        } else {
            data = await DataContest.getAll({ request });
            if (typeof request.only(['limit']).limit !== 'undefined' && typeof request.only(['page']).page !== 'undefined') {
                for (let index = 0; index < data.rows.length; index++) {
                    data.rows[index].numb = (parseInt(request.only(['limit']).limit) * (data.currentPage - 1)) + index + 1;
                    data.rows[index].contest_datestart_text = date.format(new Date(data.rows[index].contest_datestart), 'YYYY-MM-DD');
                    data.rows[index].contest_dateend_text = date.format(new Date(data.rows[index].contest_dateend), 'YYYY-MM-DD');
                }
            } else {
                for (let index = 0; index < data.length; index++) {
                    data[index].contest_datestart_text = date.format(new Date(data[index].contest_datestart), 'YYYY-MM-DD');
                    data[index].contest_dateend_text = date.format(new Date(data[index].contest_dateend), 'YYYY-MM-DD');
                }
            }
        }

        if (typeof data.length != 'undefined' || data.data[0]) {
            result = {
                status: true,
                message: 'Success',
                data: data
            }
            response.send(result);
        } else {
            result = {
                status: false,
                message: 'Data not found !',
                data: data
            }
            response.status(404).send(result);
        }
    }

    public async detail({ request, params, response }) {
        let result: object = {};

        let where = { contest_id: params.id };
        let data = await General.getWhereRowObject('data_contest', where);
        if (data) {
            if (data.contest_datestart) {
                try {
                    data.contest_datestart_text = date.format(new Date(data.contest_datestart), 'YYYY-MM-DD');
                } catch (e) {
                    data.contest_datestart_text = String(data.contest_datestart);
                }
            }
            if (data.contest_dateend) {
                try {
                    data.contest_dateend_text = date.format(new Date(data.contest_dateend), 'YYYY-MM-DD');
                } catch (e) {
                    data.contest_dateend_text = String(data.contest_dateend);
                }
            }

            // Status waktu pelaksanaan lomba
            const now = new Date();
            const start = data.contest_datestart ? new Date(data.contest_datestart) : null;
            const end = data.contest_dateend ? new Date(data.contest_dateend) : null;
            let contestStatus = 'UPCOMING';
            let contestStatusText = 'Belum Dimulai';
            let isOpen = false;

            if (start && end) {
                if (now < start) {
                    contestStatus = 'UPCOMING';
                    contestStatusText = 'Belum Dimulai';
                    isOpen = false;
                } else if (now >= start && now <= end) {
                    contestStatus = 'OPEN';
                    contestStatusText = 'Sedang Berlangsung';
                    isOpen = true;
                } else {
                    contestStatus = 'CLOSED';
                    contestStatusText = 'Selesai';
                    isOpen = false;
                }
            } else if (start && !end) {
                if (now >= start) {
                    contestStatus = 'OPEN';
                    contestStatusText = 'Sedang Berlangsung';
                    isOpen = true;
                }
            }

            data.status = contestStatus;
            data.status_text = contestStatusText;
            data.is_open = isOpen;

            // Periode lomba
            if (data.contest_periode_id) {
                const periode = await Database.query()
                    .from('mst_periode')
                    .where('periode_id', data.contest_periode_id)
                    .select('periode_name')
                    .first();
                data.periode_name = periode ? periode.periode_name : null;
            }

            // Scorer / juri lomba
            data.scorer = await DataContest.getContestScorer(params.id);

            // Kasus lomba (data_contest_case -> data_case)
            const contestCases = await Database.query()
                .from('data_contest_case as a')
                .join('data_case as b', 'b.case_id', 'a.contestcase_case_id')
                .where('a.contestcase_contest_id', params.id)
                .where('b.case_is_deleted', 0)
                .select([
                    'b.case_id',
                    'b.case_name',
                    'b.case_desc',
                    'b.case_introduction'
                ]);

            // Ambil juga kasus lomba yang terdaftar di trx_response contest ini (jika belum tercatat di data_contest_case)
            const trxCases = await Database.query()
                .from('trx_response as tr')
                .join('data_case as b', 'b.case_id', 'tr.response_case_id')
                .where('tr.response_contest_id', params.id)
                .where('b.case_is_deleted', 0)
                .select([
                    'b.case_id',
                    'b.case_name',
                    'b.case_desc',
                    'b.case_introduction'
                ]);

            for (const tc of trxCases) {
                if (!contestCases.some((c: any) => c.case_id === tc.case_id)) {
                    contestCases.push(tc);
                }
            }

            let totalPosInContest = 0;
            for (const c of contestCases) {
                const questCountResult = await Database.query()
                    .from('data_case_quest')
                    .where('casequest_case_id', c.case_id)
                    .count('* as count')
                    .first();
                const patientCountResult = await Database.query()
                    .from('data_case_patient')
                    .where('casepatient_case_id', c.case_id)
                    .count('* as count')
                    .first();
                c.total_quest = parseInt(questCountResult?.count || 0, 10);
                c.total_patient = parseInt(patientCountResult?.count || 0, 10);
                totalPosInContest += c.total_quest;
            }
            data.case = contestCases;

            // Peserta lomba: ambil dari data_contest_team yang terdaftar di contest ini atau memiliki response di trx_response
            const teams = await Database.query()
                .from('data_contest_team')
                .where((query) => {
                    query.where('contestteam_contest_id', params.id)
                        .orWhereIn('contestteam_id',
                            Database.query()
                                .from('trx_response')
                                .where('response_contest_id', params.id)
                                .select('response_contestteam_id')
                        )
                })
                .orderBy('contestteam_id', 'asc');

            const teamsData: any[] = [];

            for (const team of teams) {
                // Member tim
                const members = await Database.query()
                    .from('data_contest_team_member as a')
                    .leftJoin('sys_user as b', 'b.user_id', 'a.contestteammember_user_id')
                    .where('a.contestteammember_contestteam_id', team.contestteam_id)
                    .select([
                        'a.contestteammember_id',
                        'a.contestteammember_contestteam_id',
                        'a.contestteammember_user_id',
                        'a.contestteammember_is_leader',
                        'b.user_id',
                        'b.user_name',
                        'b.user_fullname',
                        'b.user_email'
                    ]);

                const leader = members.find((m: any) => Number(m.contestteammember_is_leader) === 1) || members[0] || null;

                // Responses tim dalam contest ini (kasus yang didapat dari tabel trx_response)
                const responses = await Database.query()
                    .from('trx_response as a')
                    .leftJoin('data_case as b', 'b.case_id', 'a.response_case_id')
                    .leftJoin('data_patient as p', 'p.patient_id', 'a.response_patient_id')
                    .where('a.response_contest_id', params.id)
                    .where('a.response_contestteam_id', team.contestteam_id)
                    .select([
                        'a.response_id',
                        'a.response_contest_id',
                        'a.response_contestteam_id',
                        'a.response_case_id',
                        'a.response_patient_id',
                        'a.response_total_score',
                        'a.response_is_submited',
                        'b.case_name',
                        'b.case_desc',
                        'b.case_introduction',
                        'p.patient_name',
                        'p.patient_gender',
                        'p.patient_birthdate'
                    ]);

                let teamScore = 0;
                let teamDuration = 0;
                let teamPosCompleted = 0;
                let teamPosTotal = 0;

                if (responses && responses.length > 0) {
                    for (const resp of responses) {
                        // Fallback data pasien jika response_patient_id kosong tapi kasus memiliki data pasien
                        if (!resp.patient_name && resp.response_case_id) {
                            const cp = await Database.query()
                                .from('data_case_patient as cp')
                                .join('data_patient as p', 'p.patient_id', 'cp.casepatient_patient_id')
                                .where('cp.casepatient_case_id', resp.response_case_id)
                                .select(['p.patient_id', 'p.patient_name', 'p.patient_gender', 'p.patient_birthdate'])
                                .first();
                            if (cp) {
                                resp.patient_name = cp.patient_name;
                                resp.patient_gender = cp.patient_gender;
                                resp.patient_birthdate = cp.patient_birthdate;
                                if (!resp.response_patient_id) {
                                    resp.response_patient_id = cp.patient_id;
                                }
                            }
                        }

                        resp.case = resp.response_case_id ? {
                            case_id: resp.response_case_id,
                            case_name: resp.case_name || null,
                            case_desc: resp.case_desc || null,
                            case_introduction: resp.case_introduction || null
                        } : null;

                        resp.patient = resp.patient_name ? {
                            patient_id: resp.response_patient_id || null,
                            patient_name: resp.patient_name,
                            patient_gender: resp.patient_gender || null,
                            patient_birthdate: resp.patient_birthdate || null
                        } : null;

                        const posInfo = await TrxResponseCtrl.getPosStatusAndScores(resp.response_id, resp.response_case_id);
                        const durationRow = await Database.query()
                            .from('trx_response_answer')
                            .where('responseanswer_response_id', resp.response_id)
                            .sum('responseanswer_duration as total_duration')
                            .first();
                        const respDuration = parseInt(durationRow?.total_duration || 0, 10);

                        resp.pos = posInfo.pos;
                        resp.pos_completed_count = posInfo.pos_completed_count;
                        resp.pos_total_count = posInfo.pos_total_count;
                        resp.pos_progress = posInfo.pos_progress;
                        resp.pos_progress_text = posInfo.pos_progress_text;
                        resp.calculated_total_score = posInfo.calculated_total_score;
                        resp.duration = respDuration;
                        resp.duration_text = this.formatDuration(respDuration);
                        resp.duration_clock = this.formatDurationClock(respDuration);

                        if (resp.response_total_score === null || resp.response_total_score === undefined) {
                            resp.response_total_score = posInfo.calculated_total_score;
                        }

                        teamScore += Number(resp.response_total_score || 0);
                        teamDuration += respDuration;
                        teamPosCompleted += posInfo.pos_completed_count;
                        teamPosTotal += posInfo.pos_total_count;
                    }
                }

                // Tentukan status pengerjaan
                let statusPengerjaan = 'BELUM_MULAI';
                let statusPengerjaanText = 'Belum Mulai';
                let isSubmitted = 0;

                if (responses && responses.length > 0) {
                    const allSubmitted = responses.every((r: any) => Number(r.response_is_submited) === 1);
                    if (allSubmitted && (contestCases.length === 0 || responses.length >= contestCases.length)) {
                        statusPengerjaan = 'SELESAI';
                        statusPengerjaanText = 'Selesai';
                        isSubmitted = 1;
                    } else {
                        statusPengerjaan = 'SEDANG_MENGERJAKAN';
                        statusPengerjaanText = 'Sedang Mengerjakan';
                        isSubmitted = 0;
                    }
                }

                const finalPosTotal = teamPosTotal > 0 ? teamPosTotal : totalPosInContest;

                const firstResp = responses && responses.length > 0 ? responses[0] : null;
                const assignedCase = firstResp?.case || (firstResp?.response_case_id ? {
                    case_id: firstResp.response_case_id,
                    case_name: firstResp.case_name || null,
                    case_desc: firstResp.case_desc || null,
                    case_introduction: firstResp.case_introduction || null
                } : null);

                const assignedCases = (responses || []).map((r: any) => ({
                    response_id: r.response_id,
                    case_id: r.response_case_id,
                    case_name: r.case_name || null,
                    case_desc: r.case_desc || null,
                    case_introduction: r.case_introduction || null,
                    patient_id: r.response_patient_id || null,
                    patient_name: r.patient_name || null,
                    patient_gender: r.patient_gender || null,
                    score: r.response_total_score,
                    total_score: r.response_total_score,
                    is_submited: r.response_is_submited,
                    status_pengerjaan: Number(r.response_is_submited) === 1 ? 'SELESAI' : 'SEDANG_MENGERJAKAN',
                    duration: r.duration,
                    duration_text: r.duration_text,
                    duration_clock: r.duration_clock,
                    pos_progress: r.pos_progress,
                    pos_progress_text: r.pos_progress_text
                }));

                const assignedPatient = firstResp?.patient || (firstResp?.patient_name ? {
                    patient_id: firstResp.response_patient_id || null,
                    patient_name: firstResp.patient_name || null,
                    patient_gender: firstResp.patient_gender || null,
                    patient_birthdate: firstResp.patient_birthdate || null
                } : null);

                teamsData.push({
                    contestteam_id: team.contestteam_id,
                    contestteam_name: team.contestteam_name,
                    leader: leader ? {
                        user_id: leader.user_id,
                        user_name: leader.user_name,
                        user_fullname: leader.user_fullname,
                        user_email: leader.user_email
                    } : null,
                    leader_name: leader ? (leader.user_fullname || leader.user_name) : '-',
                    total_members: members.length,
                    members: members,

                    // Informasi tim dan kasus yang didapat dari tabel trx_response
                    response_id: firstResp ? firstResp.response_id : null,
                    case_id: firstResp ? firstResp.response_case_id : null,
                    case_name: firstResp ? (firstResp.case_name || null) : null,
                    case: assignedCase,
                    cases: assignedCases,
                    patient_id: firstResp ? (firstResp.response_patient_id || null) : null,
                    patient_name: firstResp ? (firstResp.patient_name || null) : null,
                    patient: assignedPatient,

                    status_pengerjaan: statusPengerjaan,
                    status_pengerjaan_text: statusPengerjaanText,
                    is_submitted: isSubmitted,
                    score: teamScore,
                    total_score: teamScore,
                    total_duration: teamDuration,
                    total_duration_text: this.formatDuration(teamDuration),
                    total_duration_clock: this.formatDurationClock(teamDuration),
                    pos_completed_count: teamPosCompleted,
                    pos_total_count: finalPosTotal,
                    pos_progress: `${teamPosCompleted}/${finalPosTotal}`,
                    pos_progress_text: `${teamPosCompleted} dari ${finalPosTotal} Pos Selesai`,
                    responses: responses
                });
            }

            // Urutkan untuk penentuan ranking:
            // 1. Nilai tertinggi
            // 2. Status selesai (is_submitted = 1 lebih dulu)
            // 3. Durasi tercepat jika nilai sama
            // 4. Pos selesai terbanyak
            // 5. Nama tim alfabetis
            teamsData.sort((a, b) => {
                if (b.total_score !== a.total_score) {
                    return b.total_score - a.total_score;
                }
                if (b.is_submitted !== a.is_submitted) {
                    return b.is_submitted - a.is_submitted;
                }
                if (a.total_duration > 0 && b.total_duration > 0 && a.total_duration !== b.total_duration) {
                    return a.total_duration - b.total_duration;
                }
                if (b.pos_completed_count !== a.pos_completed_count) {
                    return b.pos_completed_count - a.pos_completed_count;
                }
                return (a.contestteam_name || '').localeCompare(b.contestteam_name || '');
            });

            // Set nomor ranking (1-indexed)
            teamsData.forEach((item, index) => {
                item.rank = index + 1;
            });

            // Format data ranking (leaderboard ringkas)
            const ranking = teamsData.map((item) => ({
                rank: item.rank,
                contestteam_id: item.contestteam_id,
                contestteam_name: item.contestteam_name,
                leader_name: item.leader_name,
                leader: item.leader,
                total_members: item.total_members,
                response_id: item.response_id,
                case_id: item.case_id,
                case_name: item.case_name,
                case: item.case,
                cases: item.cases,
                patient_name: item.patient_name,
                patient: item.patient,
                score: item.total_score,
                total_score: item.total_score,
                status_pengerjaan: item.status_pengerjaan,
                status_pengerjaan_text: item.status_pengerjaan_text,
                is_submitted: item.is_submitted,
                total_duration: item.total_duration,
                total_duration_text: item.total_duration_text,
                total_duration_clock: item.total_duration_clock,
                pos_completed_count: item.pos_completed_count,
                pos_total_count: item.pos_total_count,
                pos_progress: item.pos_progress,
                pos_progress_text: item.pos_progress_text
            }));

            // Pasangkan daftar tim ke masing-masing kasus berdasarkan kasus yang didapat di trx_response
            for (const c of contestCases) {
                c.teams = teamsData
                    .filter((t) => (t.cases || []).some((cs: any) => cs.case_id === c.case_id))
                    .map((t) => ({
                        contestteam_id: t.contestteam_id,
                        contestteam_name: t.contestteam_name,
                        leader_name: t.leader_name,
                        status_pengerjaan: t.status_pengerjaan,
                        score: t.total_score,
                        duration_text: t.total_duration_text
                    }));
                c.total_teams = c.teams.length;
            }

            // Summary / Statistik Lomba
            const totalPeserta = teamsData.length;
            const totalSelesai = teamsData.filter((t) => t.status_pengerjaan === 'SELESAI').length;
            const totalSedangMengerjakan = teamsData.filter((t) => t.status_pengerjaan === 'SEDANG_MENGERJAKAN').length;
            const totalBelumMulai = teamsData.filter((t) => t.status_pengerjaan === 'BELUM_MULAI').length;

            const teamsWithScores = teamsData.filter((t) => t.status_pengerjaan !== 'BELUM_MULAI');
            const scores = teamsWithScores.map((t) => t.total_score);

            const nilaiTertinggi = scores.length > 0 ? Math.max(...scores) : 0;
            const nilaiTerendah = scores.length > 0 ? Math.min(...scores) : 0;
            const nilaiRataRata = scores.length > 0
                ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
                : 0;
            const persentaseSelesai = totalPeserta > 0
                ? Math.round((totalSelesai / totalPeserta) * 10000) / 100
                : 0;

            const summary = {
                total_peserta: totalPeserta,
                total_selesai: totalSelesai,
                total_sedang_mengerjakan: totalSedangMengerjakan,
                total_belum_mulai: totalBelumMulai,
                persentase_selesai: persentaseSelesai,
                persentase_selesai_text: `${persentaseSelesai}%`,
                nilai_tertinggi: nilaiTertinggi,
                nilai_terendah: nilaiTerendah,
                nilai_rata_rata: nilaiRataRata,
                total_case: contestCases.length,
                total_pos: totalPosInContest
            };

            // Daftar transaksi response tim dan kasus dalam contest ini dari tabel trx_response
            const contestResponses = teamsData.flatMap((t) =>
                (t.responses || []).map((r: any) => ({
                    response_id: r.response_id,
                    contestteam_id: t.contestteam_id,
                    contestteam_name: t.contestteam_name,
                    case_id: r.response_case_id,
                    case_name: r.case_name || null,
                    case: r.case || null,
                    patient_id: r.response_patient_id || null,
                    patient_name: r.patient_name || null,
                    patient: r.patient || null,
                    score: r.response_total_score,
                    total_score: r.response_total_score,
                    is_submited: r.response_is_submited,
                    status_pengerjaan: Number(r.response_is_submited) === 1 ? 'SELESAI' : 'SEDANG_MENGERJAKAN',
                    duration: r.duration,
                    duration_text: r.duration_text,
                    duration_clock: r.duration_clock,
                    pos_progress: r.pos_progress,
                    pos_progress_text: r.pos_progress_text
                }))
            );

            data.peserta = teamsData;
            data.tim = teamsData;
            data.teams = teamsData;
            data.ranking = ranking;
            data.leaderboard = ranking;
            data.trx_response = contestResponses;
            data.summary = summary;
            data.statistik = summary;

            result = {
                'status': true,
                'message': 'Success',
                'data': data
            }
            response.send(result);
        } else {
            result = {
                'status': false,
                'message': 'Data not found !'
            }
            response.status(404).send(result);
        }
    }

    private formatDuration(seconds: number): string {
        if (!seconds || seconds <= 0) return '0 dtk';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        const parts: string[] = [];
        if (hrs > 0) parts.push(`${hrs} jam`);
        if (mins > 0) parts.push(`${mins} mnt`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs} dtk`);
        return parts.join(' ');
    }

    private formatDurationClock(seconds: number): string {
        if (!seconds || seconds <= 0) return '00:00:00';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }

    public async store({ request, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            name: schema.string([
                rules.minLength(1)
            ]),
            periode_id: schema.string([
                rules.minLength(1)
            ]),
            datestart: schema.string([
                rules.minLength(1)
            ]),
            dateend: schema.string([
                rules.minLength(1)
            ]),
            desc: schema.string([
                rules.minLength(1)
            ]),
            scorer: schema.array().members(
                schema.object().members({
                    user_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'sys_user', column: 'user_id' })
                    ])
                })
            ),
            case: schema.array().members(
                schema.object().members({
                    case_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_case', column: 'case_id' })
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();
            const trx = await Database.transaction();
            try {
                let data_insert = {
                    contest_name: post.name,
                    contest_periode_id: post.periode_id,
                    contest_datestart: post.datestart,
                    contest_dateend: post.dateend,
                    contest_desc: post.desc
                }
                let contest_id = await trx
                    .insertQuery()
                    .table('data_contest')
                    .insert(data_insert);

                for (let index = 0; index < post.scorer.length; index++) {
                    let data_insert_scorer = {
                        contestscorer_contest_id: contest_id[0],
                        contestscorer_user_id: post.scorer[index].user_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_scorer')
                        .insert(data_insert_scorer);
                }

                for (let index = 0; index < post.case.length; index++) {
                    let data_insert_case = {
                        contestcase_contest_id: contest_id[0],
                        contestcase_case_id: post.case[index].case_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_case')
                        .insert(data_insert_case);
                }

                result = {
                    status: true,
                    message: 'Success !'
                }
                response.send(result);
                await trx.commit();
            } catch (error) {
                result = {
                    status: false,
                    message: error.sqlMessage
                }
                response.badRequest(result);
                await trx.rollback();
            }
        } catch (error) {
            result = {
                status: false,
                message: error.messages.errors[0].field + ' ' + error.messages.errors[0].message
            }
            response.badRequest(result);
        }
    }

    public async update({ request, params, response }) {
        let result: object = {};

        const validationSchema = schema.create({
            name: schema.string([
                rules.minLength(1)
            ]),
            periode_id: schema.string([
                rules.minLength(1)
            ]),
            datestart: schema.string([
                rules.minLength(1)
            ]),
            dateend: schema.string([
                rules.minLength(1)
            ]),
            desc: schema.string([
                rules.minLength(1)
            ]),
            scorer: schema.array().members(
                schema.object().members({
                    user_id: schema.string([
                        rules.minLength(1),
                        rules.maxLength(1),
                        rules.exists({ table: 'sys_user', column: 'user_id' })
                    ])
                })
            ),
            case: schema.array().members(
                schema.object().members({
                    case_id: schema.string([
                        rules.minLength(1),
                        rules.exists({ table: 'data_case', column: 'case_id' })
                    ])
                })
            )
        });

        try {
            await request.validate({ schema: validationSchema });

            let post = request.body();

            const trx = await Database.transaction();
            try {
                let where_update = { contest_id: params.id }
                let data_update = {
                    contest_name: post.name,
                    contest_periode_id: post.periode_id,
                    contest_datestart: post.datestart,
                    contest_dateend: post.dateend,
                    contest_desc: post.desc
                }
                await trx
                    .from('data_contest')
                    .where(where_update)
                    .update(data_update);

                let where_case = { contestcase_contest_id: params.id };
                await trx
                    .from('data_contest_case')
                    .where(where_case)
                    .delete();

                let where_scorer = { contestscorer_contest_id: params.id };
                await trx
                    .from('data_contest_scorer')
                    .where(where_scorer)
                    .delete();

                for (let index = 0; index < post.scorer.length; index++) {
                    let data_insert_case = {
                        contestscorer_contest_id: params.id,
                        contestscorer_user_id: post.scorer[index].user_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_scorer')
                        .insert(data_insert_case);
                }

                for (let index = 0; index < post.case.length; index++) {
                    let data_insert_case = {
                        contestcase_contest_id: params.id,
                        contestcase_case_id: post.case[index].case_id
                    }
                    await trx
                        .insertQuery()
                        .table('data_contest_case')
                        .insert(data_insert_case);
                }

                result = {
                    status: true,
                    message: 'Success !'
                }
                response.send(result);
                await trx.commit();
            } catch (error) {
                result = {
                    status: false,
                    message: error.sqlMessage
                }
                response.badRequest(result);
                await trx.rollback();
            }
        } catch (error) {
            result = {
                status: false,
                message: error.messages.errors[0].field + ' ' + error.messages.errors[0].message
            }
            response.badRequest(result);
        }
    }

    public async destroy({ request, params, response }) {
        let result: object = {};

        const trx = await Database.transaction();
        try {
            let where_update = { contest_id: params.id };
            let data_update = { contest_is_deleted: 1 };
            await trx
                .from('data_contest')
                .where(where_update)
                .update(data_update);

            result = {
                status: true,
                message: 'Success !'
            }
            response.send(result);
            await trx.commit();
        } catch (error: any) {
            result = {
                status: false,
                message: error.sqlMessage || error.message
            }
            response.badRequest(result);
            await trx.rollback();
        }
    }
}