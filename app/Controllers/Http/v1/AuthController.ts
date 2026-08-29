import date from 'date-and-time';
import User from 'App/Models/User';
import Hash from '@ioc:Adonis/Core/Hash';
import { schema, rules } from '@ioc:Adonis/Core/Validator';
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository';

const General = new GeneralRepository();

export default class AuthController {
	public async login ({auth, request, response}) {
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
							data_token.expires_at = date.format(new Date(data_token.expires_at), 'YYYY-MM-DD HH:mm:ss');

							let where_role = { role_id: user.user_role_id };
							let role = await General.getWhereRowObject('sys_role', where_role);

							const data_user = {
								user_id: user.user_id,
								user_name: user.user_name,
								role_id: role.role_id,
								role_name: role.role_name
							};
							
							result = {
								status: true,
								message: 'Success !',
								data: {
									user: data_user,
									token: data_token
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
		} catch (error) {
            result = {
                status : false,
                message : error.messages.errors[0].field + ' ' + error.messages.errors[0].message
            };
            response.badRequest(result);
        }
	}

	public async profile ({response, auth}) {
		let result: object = {};

		try {
			const data = await auth.use('api').authenticate();

			result = {
				status 	: true,
				message	: 'Success',
				data : data
			};
			response.send(result); 
		} catch (error) {
            result = {
                status : false,
                message : error.responseText
            };
            response.badRequest(result);
		}
	}

	public async logout ({response, auth}) {
		let result: object = {};
		
		try {
			await auth.use('api').revoke()

			result = {
				status 	: true,
				message	: 'Success'
			};
			response.send(result); 
		} catch (error) {
            result = {
                status : false,
                message : error.responseText
            };
            response.badRequest(result);
		}
	}
}