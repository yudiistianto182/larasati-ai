/**
 * TrxResponseAnswer API Service
 * Ref: docs/api/trx-response-answer.json
 * Endpoint: /v1/trx_response_answer
 */

import { apiClient, type ApiResponse } from "@/lib/api/api-client";
import type {
  TrxChatPayload,
  TrxChatResponseData,
  TrxResponseAnswerDetail,
  TrxStoreAnswerPayload,
  TrxStoreAnswerResponseData,
  TrxStoreRecordResponseData,
} from "@/types/api";

export const trxResponseAnswerService = {
  /**
   * Mengambil detail seluruh jawaban pos tim berdasarkan response_id
   */
  async getDetail(responseId: number | string): Promise<ApiResponse<TrxResponseAnswerDetail>> {
    return apiClient.get<TrxResponseAnswerDetail>(`/v1/trx_response_answer/${responseId}`);
  },

  /**
   * Mengirim chat pesan bidan dan mendapatkan balasan AI dari API
   * Endpoint: POST /v1/trx_response_answer/chat
   * Chat turn otomatis tersimpan di server
   */
  async chat(payload: TrxChatPayload): Promise<ApiResponse<TrxChatResponseData>> {
    return apiClient.post<TrxChatResponseData>("/v1/trx_response_answer/chat", {
      response_id: String(payload.response_id),
      casequest_id: String(payload.casequest_id),
      sender: payload.sender,
      text: payload.text,
    });
  },

  /**
   * Menyimpan submission jawaban per pos (Interactive AI, Multiple Choice, Ordering Step, Interpretasi Visual)
   * Endpoint: POST /v1/trx_response_answer
   */
  async store(payload: TrxStoreAnswerPayload): Promise<ApiResponse<TrxStoreAnswerResponseData>> {
    const body: Record<string, unknown> = {
      response_id: String(payload.response_id),
      casequest_id: String(payload.casequest_id),
    };

    if (Array.isArray(payload.answers)) {
      const formattedAnswers = payload.answers.map((a) => {
        if (typeof a === "object" && a !== null && "casequestos_id" in a) {
          return {
            casequestos_id: String(a.casequestos_id),
            order: Number(a.order),
          };
        }
        return String(a);
      });
      body.answers = formattedAnswers;
    }

    if (payload.casequestcioption_id !== undefined && payload.casequestcioption_id !== null) {
      body.casequestcioption_id = String(payload.casequestcioption_id);
    }

    if (payload.responseanswer_submited !== undefined && payload.responseanswer_submited !== null) {
      body.responseanswer_submited = String(payload.responseanswer_submited);
    }

    if (payload.duration !== undefined && payload.duration !== null) {
      body.duration = String(payload.duration);
    }

    return apiClient.post<TrxStoreAnswerResponseData>("/v1/trx_response_answer", body);
  },

  /**
   * Menyimpan rekaman audio peserta (Pos 6 - Records)
   * Endpoint: POST /v1/trx_response_answer (multipart/form-data)
   */
  async storeRecord(formData: FormData): Promise<ApiResponse<TrxStoreRecordResponseData>> {
    return apiClient.post<TrxStoreRecordResponseData>("/v1/trx_response_answer", formData);
  },
};
