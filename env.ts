/*
|--------------------------------------------------------------------------
| Validating Environment Variables
|--------------------------------------------------------------------------
|
| In this file we define the rules for validating environment variables.
| By performing validation we ensure that your application is running in
| a stable environment with correct configuration values.
|
| This file is read automatically by the framework during the boot lifecycle
| and hence do not rename or move this file to a different location.
|
*/

import Env from '@ioc:Adonis/Core/Env'

export default Env.rules({
	HOST: Env.schema.string({ format: 'host' }),
	PORT: Env.schema.number(),
	APP_KEY: Env.schema.string(),
	APP_NAME: Env.schema.string(),
  DRIVE_DISK: Env.schema.enum(['local'] as const),
	NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),

	// Database config
	DB_CONNECTION: Env.schema.string(),
	MYSQL_HOST: Env.schema.string.optional(),
	MYSQL_PORT: Env.schema.number.optional(),
	MYSQL_USER: Env.schema.string.optional(),
	MYSQL_PASSWORD: Env.schema.string.optional(),
	MYSQL_DB_NAME: Env.schema.string.optional(),

	// SSH Tunnel config
	SSH_TUNNEL_ENABLED: Env.schema.boolean.optional(),
	SSH_HOST: Env.schema.string.optional(),
	SSH_PORT: Env.schema.number.optional(),
	SSH_USER: Env.schema.string.optional(),
	SSH_PASSWORD: Env.schema.string.optional(),
	SSH_KEY_PATH: Env.schema.string.optional(),
	SSH_KEY_PASSPHRASE: Env.schema.string.optional(),
	SSH_DST_HOST: Env.schema.string.optional(),
	SSH_DST_PORT: Env.schema.number.optional(),
})
