import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'

const General = new GeneralRepository();

export default class JwtAuth{
    public async handle({request, response, auth}: HttpContextContract, next: () => Promise<void>) {
        let result: object = {};

        try {
            await auth.use('api').authenticate();

            if (auth.use('api').isLoggedIn) {
                request.auth = await auth.use('api').authenticate();
                let role_id = request.auth.user_role_id;
                let module_name = request.url().split('/')[2];
                let method_name = request.method();
                let acccess = await General.canAccess(role_id, module_name, method_name);
                if (!acccess) {
                    result = {
                        status : false,
                        message : 'You not allowed access'
                    }
                    response.status(403).send(result);
                } else {
                    await next();
                }
            } else {
                result = {
                    status: false,
                    message: 'Must be loggin !'
                }
                response.status(403).send(result);
            }
        } catch (error) {
            result = {
                status: false,
                message: error.responseText
            }
            response.status(401).send(result);
        }        
    }
}