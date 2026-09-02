import { BaseCommand } from '@adonisjs/core/build/standalone'

export default class TestDb extends BaseCommand {
  public static commandName = 'test:db'
  public static description = 'Test MySQL connection (including SSH Tunnel if enabled)'

  public static settings = {
    loadApp: true,
  }

  public async run () {
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
    const { default: Env } = await import('@ioc:Adonis/Core/Env')

    this.logger.info('--- Testing Database Connection ---')
    this.logger.info(`SSH Tunnel Enabled: ${Env.get('SSH_TUNNEL_ENABLED', false)}`)
    this.logger.info(`Target Database Host: ${Env.get('MYSQL_HOST')}:${Env.get('MYSQL_PORT')}`)
    this.logger.info(`Database Name: ${Env.get('MYSQL_DB_NAME')}`)

    try {
      const result = await Database.rawQuery('SELECT 1 + 1 AS result, NOW() as server_time')
      this.logger.success('MySQL connection successful!')
      this.logger.info(`Server time: ${JSON.stringify(result[0])}`)

      const dbs = await Database.rawQuery('SHOW DATABASES')
      this.logger.info('List Database di server:')
      for (const row of dbs[0]) {
        this.logger.info(` - ${row.Database}`)
      }
    } catch (error) {
      this.logger.error('Database query error:')
      this.logger.error(error.message)
    }
  }
}
