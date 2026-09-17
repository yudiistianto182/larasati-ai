import date from 'date-and-time';
import moment from 'moment';
import User from 'App/Models/User';
import Hash from '@ioc:Adonis/Core/Hash';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository';
import Database from '@ioc:Adonis/Lucid/Database';

const General = new GeneralRepository();

export default class AuthController {
	public async login({ auth, request, response }) {
		let result: object = {};

		const validationSchema = schema.create({
			user_name: schema.string([
				rules.minLength(4)
			]),
			user_password: schema.string([
				rules.minLength(4)
			])
		});

		try {
			await request.validate({ schema: validationSchema });

			let post = request.body();
			const user = await User
				.query()
				.where('user_name', post.user_name)
				.first();

			if (user) {
				if (user.user_is_banned == 0) {
					if ((await Hash.verify(user.user_password, post.user_password))) {
						const token = await auth.use('api').generate(user, {
							expiresIn: '720 minutes'
						})

						if (token) {
							const data_token = token.toJSON();
							const rawExpiresAt = data_token.expires_at;
							data_token.expires_at = this.formatDatetime(rawExpiresAt);
							data_token.expires_at_text = this.formatDateIndo(rawExpiresAt, true);

							let where_role = { role_id: user.user_role_id };
							let role = await General.getWhereRowObject('sys_role', where_role);

							const data_user = {
								user_id: user.user_id,
								user_name: user.user_name,
								user_fullname: user.user_fullname,
								user_email: user.user_email,
								role_id: role ? role.role_id : user.user_role_id,
								role_name: role ? role.role_name : null
							};

							const contestData = await this.getUserContestData(user.user_id, user.user_role_id);

							result = {
								status: true,
								message: 'Success !',
								data: {
									user: data_user,
									token: data_token,
									contest_team: contestData.contest_team,
									scorer: contestData.scorer
								}
							};
							response.send(result);
						} else {
							result = {
								status: false,
								message: 'Error create token !'
							};
							response.badRequest(result);
						}
					} else {
						result = {
							status: false,
							message: 'Password not match !'
						};
						response.status(404).send(result);
					}
				} else {
					result = {
						status: false,
						message: 'User is banned !'
					};
					response.status(404).send(result);
				}
			} else {
				result = {
					status: false,
					message: 'Username not found !'
				};
				response.status(404).send(result);
			};
		} catch (error: any) {
			result = {
				status: false,
				message: error.messages?.errors?.[0]
					? error.messages.errors[0].field + ' ' + error.messages.errors[0].message
					: (error.message || 'Validation error')
			};
			response.badRequest(result);
		}
	}

	public async profile({ response, auth }) {
		let result: object = {};

		try {
			const user = await auth.use('api').authenticate();
			let where_role = { role_id: user.user_role_id };
			let role = await General.getWhereRowObject('sys_role', where_role);

			const data_user = {
				user_id: user.user_id,
				user_name: user.user_name,
				user_fullname: user.user_fullname,
				user_email: user.user_email,
				role_id: role ? role.role_id : user.user_role_id,
				role_name: role ? role.role_name : null
			};

			const contestData = await this.getUserContestData(user.user_id, user.user_role_id);

			result = {
				status: true,
				message: 'Success',
				data: {
					user: data_user,
					contest_team: contestData.contest_team,
					scorer: contestData.scorer
				}
			};
			response.send(result);
		} catch (error: any) {
			result = {
				status: false,
				message: error.responseText || error.message || 'Unauthorized'
			};
			response.badRequest(result);
		}
	}

	public async logout({ response, auth }) {
		let result: object = {};

		try {
			await auth.use('api').revoke()

			result = {
				status: true,
				message: 'Success'
			};
			response.send(result);
		} catch (error: any) {
			result = {
				status: false,
				message: error.responseText || error.message || 'Error revoking token'
			};
			response.badRequest(result);
		}
	}

	private async getUserContestData(userId: number | string, roleId?: number | string) {
		const now = new Date();

		// 1. Contest yang dapat diikuti user via Tim (data_contest_team_member -> data_contest_team -> data_contest)
		const contestTeams = await Database.query()
			.select([
				'tm.contestteammember_id',
				'tm.contestteammember_is_leader',
				't.contestteam_id',
				't.contestteam_name',
				't.contestteam_case_id',
				'cs.case_name',
				'cs.case_desc',
				'cs.case_introduction',
				'c.contest_id',
				'c.contest_name',
				'c.contest_desc',
				'c.contest_datestart',
				'c.contest_dateend',
				'c.contest_periode_id',
				'p.periode_name',
				'p.periode_desc',
			])
			.from('data_contest_team_member as tm')
			.join('data_contest_team as t', 't.contestteam_id', 'tm.contestteammember_contestteam_id')
			.join('data_contest as c', 'c.contest_id', 't.contestteam_contest_id')
			.leftJoin('mst_periode as p', 'p.periode_id', 'c.contest_periode_id')
			.leftJoin('data_case as cs', 'cs.case_id', 't.contestteam_case_id')
			.where('tm.contestteammember_user_id', userId)
			.orderBy('c.contest_datestart', 'desc');

		const formattedContestTeams = contestTeams.map((item: any) => {
			const startDate = item.contest_datestart ? new Date(item.contest_datestart) : null;
			const endDate = item.contest_dateend ? new Date(item.contest_dateend) : null;
			let status = 'UNKNOWN';
			let isOpen = false;

			if (startDate && endDate) {
				if (now < startDate) {
					status = 'UPCOMING';
					isOpen = false;
				} else if (now >= startDate && now <= endDate) {
					status = 'OPEN';
					isOpen = true;
				} else {
					status = 'CLOSED';
					isOpen = false;
				}
			}

			return {
				contestteam_id: item.contestteam_id,
				contestteam_name: item.contestteam_name,
				is_leader: Number(item.contestteammember_is_leader) === 1,
				contest: {
					contest_id: item.contest_id,
					contest_name: item.contest_name,
					contest_desc: item.contest_desc,
					contest_periode_id: item.contest_periode_id,
					periode_name: item.periode_name || null,
					periode_desc: item.periode_desc || null,
					contest_datestart: this.formatDatetime(item.contest_datestart),
					contest_datestart_text: this.formatDateIndo(item.contest_datestart),
					contest_dateend: this.formatDatetime(item.contest_dateend),
					contest_dateend_text: this.formatDateIndo(item.contest_dateend),
					is_open: isOpen,
					status: status,
				},
				case: item.contestteam_case_id ? {
					case_id: item.contestteam_case_id,
					case_name: item.case_name || null,
					case_desc: item.case_desc || null,
					case_introduction: item.case_introduction || null,
				} : null
			};
		});

		// 2. Contest yang dapat dinilai user sebagai Penilai/Juri (via data_contest_scorer)
		const contestScorers = await Database.query()
			.select([
				's.contestscorer_id',
				'c.contest_id',
				'c.contest_name',
				'c.contest_desc',
				'c.contest_datestart',
				'c.contest_dateend',
				'c.contest_periode_id',
				'p.periode_name',
				'p.periode_desc',
			])
			.from('data_contest_scorer as s')
			.join('data_contest as c', 'c.contest_id', 's.contestscorer_contest_id')
			.leftJoin('mst_periode as p', 'p.periode_id', 'c.contest_periode_id')
			.where('s.contestscorer_user_id', userId)
			.orderBy('c.contest_datestart', 'desc');

		const formattedScorers = contestScorers.map((item: any) => {
			const startDate = item.contest_datestart ? new Date(item.contest_datestart) : null;
			const endDate = item.contest_dateend ? new Date(item.contest_dateend) : null;
			let status = 'UNKNOWN';
			let isOpen = false;

			if (startDate && endDate) {
				if (now < startDate) {
					status = 'UPCOMING';
					isOpen = false;
				} else if (now >= startDate && now <= endDate) {
					status = 'OPEN';
					isOpen = true;
				} else {
					status = 'CLOSED';
					isOpen = false;
				}
			}

			return {
				contestscorer_id: item.contestscorer_id,
				contest_id: item.contest_id,
				contest_name: item.contest_name,
				contest_desc: item.contest_desc,
				contest_periode_id: item.contest_periode_id,
				periode_name: item.periode_name || null,
				periode_desc: item.periode_desc || null,
				contest_datestart: this.formatDatetime(item.contest_datestart),
				contest_datestart_text: this.formatDateIndo(item.contest_datestart),
				contest_dateend: this.formatDatetime(item.contest_dateend),
				contest_dateend_text: this.formatDateIndo(item.contest_dateend),
				is_open: isOpen,
				status: status,
			};
		});

		return {
			contest_team: formattedContestTeams,
			scorer: formattedScorers
		};
	}

	private formatDatetime(dateInput: string | Date | null): string | null {
		if (!dateInput) return null;
		const m = moment(dateInput);
		return m.isValid() ? m.format('YYYY-MM-DD HH:mm:ss') : null;
	}

	private formatDateIndo(dateInput: string | Date | null): string | null {
		if (!dateInput) return null;
		const m = moment(dateInput);
		if (!m.isValid()) return null;

		const monthsIndo = [
			'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
			'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
		];

		const day = m.date().toString().padStart(2, '0');
		const month = monthsIndo[m.month()];
		const year = m.year();
		const time = m.format('HH:mm:ss');

		return `${day} ${month} ${year} ${time}`;
	}
}