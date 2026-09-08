import '../../Helpers/webPolyfill'
import { GoogleGenAI } from '@google/genai'
import Config from '@ioc:Adonis/Core/Config'
import Env from '@ioc:Adonis/Core/Env'

export interface GenerateContentParams {
    prompt: string
    systemInstruction?: string
    temperature?: number
    maxOutputTokens?: number
    model?: string
}

export interface PatientAnswerParams {
    systemInstruction: string
    prompt: string
    temperature?: number
    maxOutputTokens?: number
    model?: string
}

export default class GeminiService {
    private client: GoogleGenAI
    private defaultModel: string
    private fallbackModels: string[] = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash']

    constructor() {
        const apiKey = Config.get('ai.gemini.apiKey') || Env.get('GEMINI_API_KEY', '')
        this.defaultModel = Config.get('ai.gemini.model') || Env.get('GEMINI_MODEL', 'gemini-3.7-flash')

        if (!apiKey) {
            console.warn('[GeminiService] Warning: GEMINI_API_KEY is not configured in .env')
        }

        this.client = new GoogleGenAI({
            apiKey: apiKey,
        })
    }

    /**
     * Generate answer simulating a patient based on clinical scenario instructions and doctor/user prompt.
     */
    public async generatePatientAnswer(params: PatientAnswerParams): Promise<string> {
        return this.generateContent({
            prompt: params.prompt,
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.2,
            maxOutputTokens: params.maxOutputTokens ?? 300,
            model: params.model,
        })
    }

    /**
     * General content generation method with automatic model fallback & retry for 503 / 429 errors.
     */
    public async generateContent(params: GenerateContentParams): Promise<string> {
        const primaryModel = params.model || this.defaultModel
        // Order models to try: primary model first, followed by remaining fallback models
        const candidateModels = [
            primaryModel,
            ...this.fallbackModels.filter((m) => m !== primaryModel),
        ]

        let lastError: any = null

        for (const modelName of candidateModels) {
            try {
                const response = await this.client.models.generateContent({
                    model: modelName,
                    contents: params.prompt,
                    config: {
                        systemInstruction: params.systemInstruction,
                        temperature: params.temperature ?? 0.7,
                        maxOutputTokens: params.maxOutputTokens ?? 1000,
                    },
                })

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
                    errorStr.includes('no longer available')

                if (isRetryable) {
                    console.warn(`[GeminiService] Model ${modelName} unavailable, attempting fallback to next model...`)
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
        } catch (_) {}

        return new Error(msg)
    }

    /**
     * Get direct access to the GoogleGenAI client instance if needed for advanced features.
     */
    public getClient(): GoogleGenAI {
        return this.client
    }
}
