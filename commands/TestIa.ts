import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class TestIa extends BaseCommand {
  public static commandName = 'test:ia'
  public static description = 'Test IaController prompt and flow logic according to documentation'

  public static settings = {
    loadApp: true,
  }

  public async run () {
    const { default: IaController } = await import('App/Controllers/Http/v1/bo/IaController')
    const controller = new IaController()

    const makeMockContext = (body: any, query: any = {}) => {
      let sentData: any = null
      let statusCode = 200
      return {
        ctx: {
          request: {
            body: () => body,
            input: (key: string, def?: any) => body[key] ?? query[key] ?? def,
          },
          response: {
            status: (code: number) => {
              statusCode = code
              return {
                send: (data: any) => {
                  sentData = data
                  return data
                },
              }
            },
            send: (data: any) => {
              sentData = data
              return data
            },
            badRequest: (data: any) => {
              statusCode = 400
              sentData = data
              return data
            },
          },
        },
        getResult: () => ({ statusCode, data: sentData }),
      }
    }

    this.logger.info('=== TEST 1: Pos 1 Pertanyaan Anamnesis Cocok (Paritas/Anak) ===')
    const test1 = makeMockContext({
      response_id: 1,
      message: 'Ibu sudah punya anak berapa dan melahirkan secara normal atau sesar?',
    })
    await controller.store(test1.ctx)
    const res1 = test1.getResult()
    this.logger.info(`Status: ${res1.statusCode}`)
    this.logger.info(`Matched Category: ${res1.data?.data?.matchedCategory}`)
    this.logger.info(`Source: ${res1.data?.data?.source}`)
    this.logger.info(`Score: ${res1.data?.data?.score}`)
    this.logger.info(`Reply: "${res1.data?.data?.replyText}"`)

    this.logger.info('\n=== TEST 2: Pos 1 Pertanyaan Keluhan Utama ===')
    const test2 = makeMockContext({
      response_id: 1,
      message: 'Bisa diceritakan Bu apa keluhan utama yang paling mengganggu saat ini?',
    })
    await controller.store(test2.ctx)
    const res2 = test2.getResult()
    this.logger.info(`Matched Category: ${res2.data?.data?.matchedCategory}`)
    this.logger.info(`Source: ${res2.data?.data?.source}`)
    this.logger.info(`Score: ${res2.data?.data?.score}`)
    this.logger.info(`Reply: "${res2.data?.data?.replyText}"`)

    this.logger.info('\n=== TEST 3: Pos 1 Pertanyaan Out of Scope ===')
    const test3 = makeMockContext({
      response_id: 1,
      message: 'Ibu tahu resep rendang enak tidak ya?',
    })
    await controller.store(test3.ctx)
    const res3 = test3.getResult()
    this.logger.info(`Matched Category: ${res3.data?.data?.matchedCategory}`)
    this.logger.info(`Source: ${res3.data?.data?.source}`)
    this.logger.info(`Score: ${res3.data?.data?.score}`)
    this.logger.info(`Reply: "${res3.data?.data?.replyText}"`)

    this.logger.info('\n=== TEST 4: Pos 5 Asuhan Benar (IVA Positif & Rujukan) ===')
    const test4 = makeMockContext({
      response_id: 1,
      pos: 5,
      message: 'Ibu tenang saja ya jangan cemas, hasil IVA positif ini lesi pra-kanker dan bukan vonis kanker. Kita akan jadwalkan rujukan ke dokter spesialis SpOG di RS ya Bu.',
    })
    await controller.store(test4.ctx)
    const res4 = test4.getResult()
    this.logger.info(`Stase: ${res4.data?.data?.stase}`)
    this.logger.info(`Matched Category: ${res4.data?.data?.matchedCategory}`)
    this.logger.info(`Is Malpractice: ${res4.data?.data?.is_malpractice}`)
    this.logger.info(`Source: ${res4.data?.data?.source}`)
    this.logger.info(`Score: ${res4.data?.data?.score}`)
    this.logger.info(`Reply: "${res4.data?.data?.replyText}"`)

    this.logger.info('\n=== TEST 5: Pos 5 Vonis Malpraktik / Menakuti Pasien ===')
    const test5 = makeMockContext({
      response_id: 1,
      pos: 5,
      message: 'Ibu ini sudah pasti kanker ganas stadium akhir tidak ada harapan sembuh lagi dan tidak usah dirujuk.',
    })
    await controller.store(test5.ctx)
    const res5 = test5.getResult()
    this.logger.info(`Stase: ${res5.data?.data?.stase}`)
    this.logger.info(`Matched Category: ${res5.data?.data?.matchedCategory}`)
    this.logger.info(`Is Malpractice: ${res5.data?.data?.is_malpractice}`)
    this.logger.info(`Source: ${res5.data?.data?.source}`)
    this.logger.info(`Score: ${res5.data?.data?.score}`)
    this.logger.info(`Reply: "${res5.data?.data?.replyText}"`)

    this.logger.info('\n=== TEST 6: GET /v1/ia (Riwayat Percakapan) ===')
    const test6 = makeMockContext({}, { response_id: 1 })
    await controller.index(test6.ctx)
    const res6 = test6.getResult()
    this.logger.info(`Total Messages: ${res6.data?.data?.total_messages}`)
    if (res6.data?.data?.conversation?.length > 0) {
      const sample = res6.data.data.conversation.slice(-2)
      for (const msg of sample) {
        this.logger.info(`- ${msg.sender}: ${msg.message}`)
      }
    }
  }
}
