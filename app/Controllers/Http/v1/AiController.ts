import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeminiService from 'App/Services/ai/GeminiService'

const geminiService = new GeminiService()

export default class AiController {
    /**
     * GET /v1/ai/test
     * Quick test endpoint using GET query param: ?prompt=Halo
     */
    public async test({ request, response }) {
        const prompt = request.input('prompt', 'Halo Gemini, perkenalkan dirimu secara singkat!')

        try {
            const answer = await geminiService.generateContent({
                prompt: prompt,
            })

            return response.send({
                status: true,
                message: 'Success',
                data: {
                    prompt,
                    answer,
                },
            })
        } catch (error) {
            return response.badRequest({
                status: false,
                message: error.message || 'Gagal berkomunikasi dengan Gemini AI',
            })
        }
    }

    /**
     * POST /v1/ai/ask
     * General purpose Gemini question / prompt
     */
    public async ask({ request, response }) {
        const validationSchema = schema.create({
            prompt: schema.string([rules.minLength(1)]),
            system_instruction: schema.string.optional(),
            temperature: schema.number.optional(),
            max_tokens: schema.number.optional(),
            model: schema.string.optional(),
        })

        try {
            const payload = await request.validate({ schema: validationSchema })

            const answer = await geminiService.generateContent({
                prompt: payload.prompt,
                systemInstruction: payload.system_instruction,
                temperature: payload.temperature,
                maxOutputTokens: payload.max_tokens,
                model: payload.model,
            })

            return response.send({
                status: true,
                message: 'Success',
                data: {
                    prompt: payload.prompt,
                    answer: answer,
                },
            })
        } catch (error) {
            if (error.messages) {
                return response.badRequest({
                    status: false,
                    message: error.messages.errors?.[0]?.message || 'Validation error',
                })
            }

            return response.badRequest({
                status: false,
                message: error.message || 'Gagal berkomunikasi dengan Gemini AI',
            })
        }
    }

    /**
     * POST /v1/ai/patient-chat
     * Endpoint for patient roleplay simulation
     */
    public async patientChat({ request, response }) {
        const validationSchema = schema.create({
            prompt: schema.string([rules.minLength(1)]),
            system_instruction: schema.string.optional(),
            temperature: schema.number.optional(),
            max_tokens: schema.number.optional(),
        })

        try {
            const payload = await request.validate({ schema: validationSchema })

            const systemInstruction = payload.system_instruction ||
                'Anda berperan sebagai pasien rumah sakit bernama Budi (45 tahun) dengan keluhan utama nyeri dada sebelah kiri sejak 2 hari yang lalu. Jawab pertanyaan dokter secara natural, ramah, dan sesuai dengan keluhan Anda.'

            const answer = await geminiService.generatePatientAnswer({
                systemInstruction: systemInstruction,
                prompt: payload.prompt,
                temperature: payload.temperature ?? 0.3,
                maxOutputTokens: payload.max_tokens ?? 300,
            })

            return response.send({
                status: true,
                message: 'Success',
                data: {
                    doctor_question: payload.prompt,
                    patient_answer: answer,
                },
            })
        } catch (error) {
            if (error.messages) {
                return response.badRequest({
                    status: false,
                    message: error.messages.errors?.[0]?.message || 'Validation error',
                })
            }

            return response.badRequest({
                status: false,
                message: error.message || 'Gagal berkomunikasi dengan Gemini AI',
            })
        }
    }
}
