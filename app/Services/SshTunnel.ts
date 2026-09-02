import net from 'net'
import fs from 'fs'
import { Client } from 'ssh2'
import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'

class SshTunnelService {
  private server: net.Server | null = null
  private sshClient: Client | null = null
  private isConnected = false

  public async createTunnel(): Promise<void> {
    const isEnabled = String(Env.get('SSH_TUNNEL_ENABLED', 'false')).toLowerCase() === 'true'
    if (!isEnabled) {
      return
    }

    if (this.isConnected) {
      Logger.info('[SSH Tunnel] Tunnel already running.')
      return
    }

    const sshHost = Env.get('SSH_HOST')
    const sshPort = Number(Env.get('SSH_PORT', 22))
    const sshUser = Env.get('SSH_USER')
    const sshPassword = Env.get('SSH_PASSWORD')
    const sshKeyPath = Env.get('SSH_KEY_PATH')
    const sshPassphrase = Env.get('SSH_KEY_PASSPHRASE')

    const localPort = Number(Env.get('MYSQL_PORT', 3307))
    const localHost = '127.0.0.1'

    const dstHost = Env.get('SSH_DST_HOST', '127.0.0.1')
    const dstPort = Number(Env.get('SSH_DST_PORT', 3306))

    if (!sshHost || !sshUser) {
      Logger.warn('[SSH Tunnel] SSH_TUNNEL_ENABLED is true, but SSH_HOST or SSH_USER is not configured.')
      return
    }

    return new Promise((resolve, reject) => {
      this.sshClient = new Client()

      this.sshClient.on('ready', () => {
        Logger.info(`[SSH Tunnel] Connected to SSH server ${sshHost}:${sshPort}`)

        this.server = net.createServer((localSocket) => {
          this.sshClient?.forwardOut(
            localHost,
            localSocket.remotePort || 0,
            dstHost,
            dstPort,
            (err, stream) => {
              if (err) {
                Logger.error(`[SSH Tunnel] ForwardOut error: ${err.message}`)
                localSocket.destroy()
                return
              }

              localSocket.pipe(stream).pipe(localSocket)

              stream.on('close', () => {
                localSocket.destroy()
              })
              localSocket.on('close', () => {
                stream.destroy()
              })
            }
          )
        })

        this.server.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            Logger.warn(`[SSH Tunnel] Local port ${localPort} is already in use. Assuming tunnel is already active.`)
            this.isConnected = true
            resolve()
          } else {
            Logger.error(`[SSH Tunnel] Server error: ${err.message}`)
            reject(err)
          }
        })

        this.server.listen(localPort, localHost, () => {
          this.isConnected = true
          Logger.info(`[SSH Tunnel] Local tunnel listening on ${localHost}:${localPort} -> Remote ${dstHost}:${dstPort}`)
          resolve()
        })
      })

      this.sshClient.on('error', (err) => {
        Logger.error(`[SSH Tunnel] SSH connection error: ${err.message}`)
        reject(err)
      })

      const sshConfig: any = {
        host: sshHost,
        port: sshPort,
        username: sshUser,
      }

      if (sshKeyPath && fs.existsSync(sshKeyPath)) {
        sshConfig.privateKey = fs.readFileSync(sshKeyPath)
        if (sshPassphrase) {
          sshConfig.passphrase = sshPassphrase
        }
      } else if (sshPassword) {
        sshConfig.password = sshPassword
      }

      this.sshClient.connect(sshConfig)
    })
  }

  public async closeTunnel(): Promise<void> {
    if (this.server) {
      this.server.close()
      this.server = null
    }
    if (this.sshClient) {
      this.sshClient.end()
      this.sshClient = null
    }
    this.isConnected = false
    Logger.info('[SSH Tunnel] Tunnel closed.')
  }
}

export default new SshTunnelService()
