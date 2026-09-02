import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import SshTunnel from 'App/Services/SshTunnel'

export default class AppProvider {
  constructor (protected app: ApplicationContract) {
  }

  public register () {
    // Register your own bindings
  }

  public async boot () {
    // IoC container is ready
    await SshTunnel.createTunnel()
  }

  public async ready () {
    // App is ready
  }

  public async shutdown () {
    // Cleanup, since app is going down
    await SshTunnel.closeTunnel()
  }
}

