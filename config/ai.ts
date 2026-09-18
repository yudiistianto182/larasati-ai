import Env from '@ioc:Adonis/Core/Env'

export default {
    gemini: {
        apiKey: Env.get('GEMINI_API_KEY', ''),
        model: Env.get('GEMINI_MODEL', 'gemini-3.6-flash'),
    },
}