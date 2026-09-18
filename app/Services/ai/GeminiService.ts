import '../../Helpers/webPolyfill'
import { GoogleGenAI } from '@google/genai'
import Database from '@ioc:Adonis/Lucid/Database'
import Config from '@ioc:Adonis/Core/Config'
import Env from '@ioc:Adonis/Core/Env'

export interface GenerateContentParams {
    prompt?: string
    contents?: any
    systemInstruction?: string
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    model?: string
    timeout?: number
}

export interface PatientAnswerParams {
    systemInstruction: string
    prompt?: string
    contents?: any
    temperature?: number
    maxOutputTokens?: number
    topP?: number
    model?: string
    timeout?: number
}

export default class GeminiService {
    private defaultModel: string
    private fallbackModels: string[] = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash', 'gemini-3.5-flash']

    constructor() {
        this.defaultModel = Config.get('ai.gemini.model') || Env.get('GEMINI_MODEL', 'gemini-3.6-flash')
    }

    /**
     * Mengambil API Key Gemini dari tabel sys_config (config_name = 'GEMINI_API_KEY')
     * dengan fallback ke Config / Env jika diperlukan
     */
    public async getApiKey(): Promise<string> {
        try {
            const config = await Database.from('sys_config')
                .where('config_name', 'GEMINI_API_KEY')
                .first()

            if (config && config.config_value && config.config_value.trim()) {
                return config.config_value.trim()
            }
        } catch (dbErr: any) {
            console.warn('[GeminiService] Warning: Gagal membaca GEMINI_API_KEY dari database sys_config:', dbErr.message)
        }

        const fallbackKey = Config.get('ai.gemini.apiKey') || Env.get('GEMINI_API_KEY', '')
        return (fallbackKey || '').trim()
    }

    /**
     * Inisialisasi GoogleGenAI client menggunakan API Key dari tabel sys_config
     */
    public async getClient(): Promise<GoogleGenAI> {
        const apiKey = await this.getApiKey()

        if (!apiKey) {
            console.warn('[GeminiService] Warning: GEMINI_API_KEY tidak ditemukan pada sys_config database')
            throw new Error('GEMINI_API_KEY tidak ditemukan pada sys_config database')
        }

        return new GoogleGenAI({
            apiKey: apiKey,
        })
    }

    /**
     * Generate answer simulating a patient based on clinical scenario instructions and doctor/user prompt.
     * Defaults to low latency config: temperature 0.6, maxOutputTokens 150, topP 0.9, timeout 25000ms
     */
    public async generatePatientAnswer(params: PatientAnswerParams): Promise<string> {
        return this.generateContent({
            prompt: params.prompt,
            contents: params.contents,
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.6,
            maxOutputTokens: params.maxOutputTokens ?? 150,
            topP: params.topP ?? 0.9,
            timeout: params.timeout ?? 25000,
            model: params.model,
        })
    }

    /**
     * General content generation method with automatic model fallback & retry for 503 / 429 errors.
     */
    public async generateContent(params: GenerateContentParams): Promise<string> {
        const client = await this.getClient()
        const primaryModel = params.model || this.defaultModel
        // Order models to try: primary model first, followed by remaining fallback models
        const candidateModels = [
            primaryModel,
            ...this.fallbackModels.filter((m) => m !== primaryModel),
        ]

        let lastError: any = null
        const timeoutMs = params.timeout ?? 30000

        for (const modelName of candidateModels) {
            try {
                const contentsPayload = params.contents || params.prompt || ''

                const config: any = {
                    systemInstruction: params.systemInstruction,
                    temperature: params.temperature ?? 0.6,
                    maxOutputTokens: params.maxOutputTokens ?? 200,
                    topP: params.topP ?? 0.9,
                }

                // Hanya pasang thinkingConfig jika model mendukung mode thinking (seperti 3.7)
                if (modelName.includes('3.7') || modelName.includes('thinking')) {
                    config.thinkingConfig = { thinkingBudget: 0 }
                }

                const apiCall = client.models.generateContent({
                    model: modelName,
                    contents: contentsPayload,
                    config: config,
                })

                // Wrap with timeout race
                let timer: any = null
                const timeoutPromise = new Promise<never>((_, reject) => {
                    timer = setTimeout(() => {
                        reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`))
                    }, timeoutMs)
                })

                const response: any = await Promise.race([apiCall, timeoutPromise])
                if (timer) clearTimeout(timer)

                return response.text?.trim() ?? ''
            } catch (error: any) {
                lastError = error
                const errorStr = error?.message || String(error)
                const isRetryable =
                    errorStr.includes('503') ||
                    errorStr.includes('high demand') ||
                    errorStr.includes('UNAVAILABLE') ||
                    errorStr.includes('429') ||
                    errorStr.includes('RESOURCE_EXHAUSTED') ||
                    errorStr.includes('404') ||
                    errorStr.includes('timed out') ||
                    errorStr.includes('no longer available')

                if (isRetryable) {
                    console.warn(`[GeminiService] Model ${modelName} unavailable (${errorStr.slice(0, 100)}), attempting fallback to next model...`)
                    continue
                }

                // If not retryable error (e.g. invalid API key or bad request), throw immediately
                throw this.formatError(error)
            }
        }

        throw this.formatError(lastError)
    }

    /**
     * Format errors cleanly instead of dumping raw JSON strings.
     */
    private formatError(error: any): Error {
        if (!error) {
            return new Error('Gagal berkomunikasi dengan Gemini AI')
        }

        const msg = error.message || String(error)
        try {
            // Attempt to parse JSON error message if wrapped
            const jsonStart = msg.indexOf('{')
            const jsonEnd = msg.lastIndexOf('}')
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const parsed = JSON.parse(msg.substring(jsonStart, jsonEnd + 1))
                if (parsed?.error?.message) {
                    return new Error(parsed.error.message)
                }
            }
        } catch (_) { }

        return new Error(msg)
    }
}

