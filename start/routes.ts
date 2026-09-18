/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'update on 2025-07-04 15.00' }
})

Route.post('/v1/auth/login', 'v1/AuthController.login');
Route.get('/v1/auth/profile', 'v1/AuthController.profile');
Route.get('/v1/auth/logout', 'v1/AuthController.logout');

Route.get('/v1/sys_config', 'v1/bo/SysConfigController.index').middleware('jwtauth');
Route.get('/v1/sys_config/:id', 'v1/bo/SysConfigController.detail').middleware('jwtauth');

Route.get('/v1/sys_role', 'v1/bo/SysRoleController.index').middleware('jwtauth');

Route.get('/v1/sys_user', 'v1/bo/SysUserController.index').middleware('jwtauth');
Route.get('/v1/sys_user/:id', 'v1/bo/SysUserController.detail').middleware('jwtauth');
Route.post('/v1/sys_user', 'v1/bo/SysUserController.store').middleware('jwtauth');
Route.put('/v1/sys_user/:id', 'v1/bo/SysUserController.update').middleware(['jwtauth']);
Route.delete('/v1/sys_user/:id', 'v1/bo/SysUserController.destroy').middleware(['jwtauth']);

Route.get('/v1/ref_method', 'v1/bo/RefMethodController.index').middleware('jwtauth');
Route.get('/v1/ref_method/:id', 'v1/bo/RefMethodController.detail').middleware('jwtauth');
Route.post('/v1/ref_method', 'v1/bo/RefMethodController.store').middleware('jwtauth');
Route.put('/v1/ref_method/:id', 'v1/bo/RefMethodController.update').middleware(['jwtauth']);
Route.delete('/v1/ref_method/:id', 'v1/bo/RefMethodController.destroy').middleware(['jwtauth']);

Route.get('/v1/mst_periode', 'v1/bo/MstPeriodeController.index').middleware('jwtauth');
Route.get('/v1/mst_periode/:id', 'v1/bo/MstPeriodeController.detail').middleware('jwtauth');
Route.post('/v1/mst_periode', 'v1/bo/MstPeriodeController.store').middleware('jwtauth');
Route.put('/v1/mst_periode/:id', 'v1/bo/MstPeriodeController.update').middleware(['jwtauth']);
Route.delete('/v1/mst_periode/:id', 'v1/bo/MstPeriodeController.destroy').middleware(['jwtauth']);

Route.get('/v1/data_contest', 'v1/bo/DataContestController.index').middleware('jwtauth');
Route.get('/v1/data_contest/:id', 'v1/bo/DataContestController.detail').middleware('jwtauth');
Route.post('/v1/data_contest', 'v1/bo/DataContestController.store').middleware('jwtauth');
Route.put('/v1/data_contest/:id', 'v1/bo/DataContestController.update').middleware(['jwtauth']);
Route.delete('/v1/data_contest/:id', 'v1/bo/DataContestController.destroy').middleware(['jwtauth']);

Route.get('/v1/data_contest_team', 'v1/bo/DataContestTeamController.index').middleware('jwtauth');
Route.get('/v1/data_contest_team/:id', 'v1/bo/DataContestTeamController.detail').middleware('jwtauth');
Route.post('/v1/data_contest_team', 'v1/bo/DataContestTeamController.store').middleware('jwtauth');
Route.put('/v1/data_contest_team/:id', 'v1/bo/DataContestTeamController.update').middleware(['jwtauth']);
Route.delete('/v1/data_contest_team/:id', 'v1/bo/DataContestTeamController.destroy').middleware(['jwtauth']);

Route.get('/v1/data_patient', 'v1/bo/DataPatientController.index').middleware('jwtauth');
Route.get('/v1/data_patient/:id', 'v1/bo/DataPatientController.detail').middleware('jwtauth');
Route.post('/v1/data_patient', 'v1/bo/DataPatientController.store').middleware('jwtauth');
Route.put('/v1/data_patient/:id', 'v1/bo/DataPatientController.update').middleware(['jwtauth']);
Route.delete('/v1/data_patient/:id', 'v1/bo/DataPatientController.destroy').middleware(['jwtauth']);

Route.get('/v1/data_case', 'v1/bo/DataCaseController.index').middleware('jwtauth');
Route.get('/v1/data_case/:id', 'v1/bo/DataCaseController.detail').middleware('jwtauth');
Route.post('/v1/data_case', 'v1/bo/DataCaseController.store').middleware('jwtauth');
Route.put('/v1/data_case/:id', 'v1/bo/DataCaseController.update').middleware(['jwtauth']);
Route.delete('/v1/data_case/:id', 'v1/bo/DataCaseController.destroy').middleware(['jwtauth']);

Route.get('/v1/trx_response', 'v1/bo/TrxResponseController.index').middleware('jwtauth');
Route.get('/v1/trx_response/instruction', 'v1/bo/TrxResponseController.instruction');
Route.get('/v1/trx_response/:id/instruction', 'v1/bo/TrxResponseController.instruction');
Route.get('/v1/trx_response/:id/rule', 'v1/bo/TrxResponseController.instruction');
Route.get('/v1/trx_response/:id', 'v1/bo/TrxResponseController.detail');
Route.post('/v1/trx_response', 'v1/bo/TrxResponseController.store').middleware('jwtauth');
Route.put('/v1/trx_response/:id', 'v1/bo/TrxResponseController.update').middleware(['jwtauth']);
Route.delete('/v1/trx_response/:id', 'v1/bo/TrxResponseController.destroy').middleware(['jwtauth']);

Route.get('/v1/api_health', 'v1/bo/ApiHealthController.index')

// -----------------------------------------------------------------------
// Jawaban Respondent Per-Pos
// -----------------------------------------------------------------------
// PENTING: POST routes statis harus di atas GET /:id (parameterized)
// agar AdonisJS tidak salah routing ke detail handler
// POST /v1/trx_response_answer/ia     — Pos 1: IA Chat & Triggers
// POST /v1/trx_response_answer/chat   — Pos 1: Simpan 1 baris chat
// POST /v1/trx_response_answer/mc     — Pos 2: Multiple Choice
// POST /v1/trx_response_answer/os     — Pos 3: Ordering
// POST /v1/trx_response_answer/ci     — Pos 4: Image Choice
// POST /v1/trx_response_answer/submit — Submit final & hitung skor
// GET  /v1/trx_response_answer/:id    — Semua jawaban per response_id
Route.post('/v1/trx_response_answer', 'v1/bo/TrxResponseAnswerController.store').middleware('jwtauth');
Route.post('/v1/trx_response_answer/ia', 'v1/bo/TrxResponseAnswerController.storeIa').middleware('jwtauth');
Route.post('/v1/trx_response_answer/chat', 'v1/bo/TrxResponseAnswerController.storeChat').middleware('jwtauth');
Route.post('/v1/trx_response_answer/mc', 'v1/bo/TrxResponseAnswerController.storeMc').middleware('jwtauth');
Route.post('/v1/trx_response_answer/os', 'v1/bo/TrxResponseAnswerController.storeOs').middleware('jwtauth');
Route.post('/v1/trx_response_answer/ci', 'v1/bo/TrxResponseAnswerController.storeCi').middleware('jwtauth');
Route.post('/v1/trx_response_answer/record', 'v1/bo/TrxResponseAnswerController.storeRecord').middleware('jwtauth');
Route.post('/v1/trx_response_answer/submit', 'v1/bo/TrxResponseAnswerController.submit').middleware('jwtauth');
Route.get('/v1/trx_response_answer/:id', 'v1/bo/TrxResponseAnswerController.detail').middleware('jwtauth');

Route.get('/v1/data_case_quest/:id', 'v1/bo/DataCaseQuestController.detail').middleware('jwtauth');
Route.post('/v1/data_case_quest', 'v1/bo/DataCaseQuestController.store').middleware('jwtauth');
Route.put('/v1/data_case_quest/:id', 'v1/bo/DataCaseQuestController.update').middleware(['jwtauth']);
Route.delete('/v1/data_case_quest/:id', 'v1/bo/DataCaseQuestController.destroy').middleware(['jwtauth']);