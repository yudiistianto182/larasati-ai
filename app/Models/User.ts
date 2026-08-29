import { DateTime } from 'luxon'
import Hash from '@ioc:Adonis/Core/Hash'
import { column, beforeSave, BaseModel } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
	public static table = 'sys_user'

  @column({ isPrimary: true })
  public user_id: string

  @column()
  public user_name: string

  @column()
  public user_email: string

  @column()
  public user_is_banned: number

  @column()
  public user_role_id: number

  @column({ serializeAs: null })
  public user_password: string

	@column.dateTime({ autoCreate: true })
	public insert_timestamp: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public update_timestamp: DateTime

  @beforeSave()
  public static async hashPassword (user: User) {
    if (user.$dirty.user_password) {
      user.user_password = await Hash.make(user.user_password)
    }
  }
}
