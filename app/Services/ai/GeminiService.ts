import '../../Helpers/webPolyfill'
import { GoogleGenAI } from '@google/genai'
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
     * Defaults to generationConfig from documentation: temperature 0.6, maxOutputTokens 65, topP 0.9, timeout 3500ms
     */
    public async generatePatientAnswer(params: PatientAnswerParams): Promise<string> {
        return this.generateContent({
            prompt: params.prompt,
            contents: params.contents,
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.6,
            maxOutputTokens: params.maxOutputTokens ?? 150,
            topP: params.topP ?? 0.9,
            timeout: params.timeout ?? 3500,
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
        const timeoutMs = params.timeout ?? 10000

        for (const modelName of candidateModels) {
            try {
                const contentsPayload = params.contents || params.prompt || ''

                const config: any = {
                    systemInstruction: params.systemInstruction,
                    temperature: params.temperature ?? 0.6,
                    maxOutputTokens: params.maxOutputTokens ?? 1000,
                    topP: params.topP ?? 0.9,
                }

                const apiCall = this.client.models.generateContent({
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
