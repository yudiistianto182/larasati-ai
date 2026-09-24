/**
 * MstPeriode Module API Types
 * Ref: docs/api/mst-periode.json
 */

export interface MstPeriodeItem {
  periode_id: number;
  periode_name: string;
  numb?: number;
}

export interface MstPeriodePayload {
  periode_name: string;
}
