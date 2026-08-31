import date from 'date-and-time'
import ffmpeg from 'fluent-ffmpeg'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import GeneralRepository from 'App/Repositorys/v1/GeneralRepository'
// import TrxResponseAnswerRepository from 'App/Repositorys/v1/bo/TrxResponseRepository'
import Database from '@ioc:Adonis/Lucid/Database'

const General = new GeneralRepository()
// const TrxResponse = new TrxResponseRepository()

export default class TrxResponseInterviewController {
    public async store ({request, response}) {
        let result: object = {};
        
        const validationSchema = schema.create({
            response_id: schema.string([
                rules.minLength(1)
            ])
        });
        try {
            await request.validate({ schema: validationSchema });

            const recording = request.file('recording', {
                size: '500mb',
                extnames: ['mp3', 'wav', 'm4a', 'mp4', 'webm'],
            })

            if (!recording) {
                return response.badRequest({
                    message: 'Recording tidak ditemukan',
                })
            }

            if (!recording.isValid) {
                return response.badRequest({
                    message: recording.errors,
                })
            }

            try {
                await recording.move('storage/recordings');
                const filePath = recording.filePath;
                let duration = await new Promise<number>((resolve, reject) => {
                    ffmpeg.ffprobe(filePath, (err, metadata) => {
                        if (err) {
                            reject(err)
                            return
                        }

                        resolve(metadata.format.duration ?? 0)
                    })
                })
                
                let post = request.body();
                const trx = await Database.transaction();
                try {
                    let data_insert = {
                        responsinterview_response_id: post.response_id,
                        responsinterview_size: recording.size,
                        responsinterview_duration: duration,
                        responsinterview_file: filePath
                    }
                    // await trx
                    //     .insertQuery()
                    //     .table('trx_response')
                    //     .insert(data_insert);
            
                    result = {
                        status: true,
                        message: 'Success !'
                    }
                    response.send(result);
                    await trx.commit();
                } catch (error) {
                    result = {
                        status : false,
                        message : error.sqlMessage
                    }
                    response.badRequest(result);
                    await trx.rollback();
                }
            } catch (error) {
            result = {
                    status: false,
                    message: error.messages
                }
                response.badRequest(result);
            }
            
        } catch (error) {
            result = {
                status: false,
                message: error.messages.errors[0].field + ' ' + error.messages.errors[0].message
            }
            response.badRequest(result);
        }
    }
}