import axios from 'axios'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'

const General = new GeneralRepository();

export default class ApiHealthController {

    public async index({ response }) {
        const gemini = await this.checkGemini()
        const simpli = await this.checkSimpli()

        const status = gemini.connected && simpli.connected

        const result = {
            status: status,
            message: status
                ? 'All API connections are healthy'
                : 'One or more API connections failed',
            data: {
                gemini: gemini,
                simpli: simpli
            }
        }

        return response
            .status(status ? 200 : 503)
            .send(result)
    }

    private async checkGemini() {
        const config = await General.getWhereRowObject('sys_config', { config_name: 'GEMINI_API_KEY' });
        const apiKey = config.config_value;

        if (!apiKey) {
            return {
                connected: false,
                message: 'GEMINI_API_KEY is not configured'
            }
        }

        try {
            await axios.get(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
                {
                    timeout: 10000
                }
            )

            return {
                connected: true,
                message: 'Gemini API connected successfully'
            }
        } catch (error) {
            return {
                connected: false,
                message: 'Gemini API connection failed'
            }
        }
    }

    private async checkSimpli() {
        const config = await General.getWhereRowObject('sys_config', { config_name: 'SIMLI_API_KEY' });
        const apiKey = config.config_value;

        if (!apiKey) {
            return {
                connected: false,
                message: 'SIMPLI_API_KEY is not configured'
            }
        }

        try {
            // Sesuaikan endpoint dengan API Simpli yang digunakan
            await axios.get(
                'https://api.simpli.com/health',
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`
                    },
                    timeout: 10000
                }
            )

            return {
                connected: true,
                message: 'Simpli API connected successfully'
            }
        } catch (error) {
            return {
                connected: false,
                message: 'Simpli API connection failed'
            }
        }
    }
}
