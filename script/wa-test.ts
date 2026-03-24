import path from 'path'

import {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeWASocket,
  useMultiFileAuthState,
  type BaileysEventMap,
  type WAMessage,
  type WASocket
} from '@whiskeysockets/baileys'
import * as QRCode from 'qrcode'

type MultiFileAuthState = Awaited<ReturnType<typeof useMultiFileAuthState>>
type WhatsAppWebVersion = Awaited<
  ReturnType<typeof fetchLatestBaileysVersion>
>['version']

export type WhatsappConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export class WhatsappNotConnectedError extends Error {
  readonly code = 'NOT_CONNECTED' as const

  constructor(message: string) {
    super(message)
    this.name = 'WhatsappNotConnectedError'
  }
}

export class WhatsappService {
  private static readonly DEFAULT_AUTH_BASE_DIR = path.join(process.cwd(), '..', 'resources', 'whatsapp', 'sessions')
  private static readonly RECONNECT_MS = 1500

  public readonly userId: number | string

  private readonly authDir: string

  private socket: WASocket | undefined
  private reconnectScheduled = false
  private intentionalDisconnect = false
  private credentialsLoaded = false

  private authenticationState!: MultiFileAuthState['state']
  private persistCredentials!: MultiFileAuthState['saveCreds']
  private whatsAppWebVersion!: WhatsAppWebVersion

  private status: WhatsappConnectionStatus = 'disconnected'
  public lastDisconnectReason: string | undefined

  private connectPromise: Promise<void> | undefined

  constructor(
    userId: number | string,
    authBaseDir: string = WhatsappService.DEFAULT_AUTH_BASE_DIR
  ) {
    this.userId = userId
    this.authDir = path.join(authBaseDir, String(userId))
  }

  get connectionStatus(): WhatsappConnectionStatus {
    return this.status
  }

  /**
   * Memuat kredensial (jika belum), lalu membuka socket WhatsApp.
   * Aman dipanggil berulang; pemanggilan bersamaan digabung ke satu promise.
   */
  async connect(): Promise<void> {
    if (this.connectPromise != null) {
      return this.connectPromise
    }

    this.connectPromise = this.runConnectFlow().finally(() => {
      this.connectPromise = undefined
    })

    return this.connectPromise
  }

  private async runConnectFlow(): Promise<void> {
    this.intentionalDisconnect = false
    await this.ensureCredentialsLoaded()

    if (this.status === 'connected' && this.socket != null) {
      return
    }

    if (this.socket != null && this.status === 'connecting') {
      return
    }

    this.status = 'connecting'
    this.lastDisconnectReason = undefined
    this.startSocket()
  }

  /**
   * Menutup socket dan menghentikan auto-reconnect.
   */
  async disconnect(): Promise<void> {
    this.intentionalDisconnect = true
    this.reconnectScheduled = false

    const active = this.socket
    this.socket = undefined

    active?.end(undefined)

    this.status = 'disconnected'
  }

  /**
   * Mengirim pesan teks. `jid` harus format WhatsApp (mis. `628xxx@s.whatsapp.net`).
   */
  async sendMessage(jid: string, text: string): Promise<void> {
    const trimmedJid = jid.trim()
    const trimmedText = text.trim()

    if (trimmedJid.length === 0) {
      throw new Error(`${this.logTag()} jid tidak boleh kosong`)
    }
    if (trimmedText.length === 0) {
      throw new Error(`${this.logTag()} teks pesan tidak boleh kosong`)
    }

    const sock = this.socket
    if (sock == null || this.status !== 'connected') {
      throw new WhatsappNotConnectedError(
        `${this.logTag()} tidak terhubung (status: ${this.status})`
      )
    }

    await sock.sendMessage(trimmedJid, { text: trimmedText })
  }

  private logTag(): string {
    return `[WA userId=${String(this.userId)}]`
  }

  private async ensureCredentialsLoaded(): Promise<void> {
    if (this.credentialsLoaded) {
      return
    }

    const auth = await useMultiFileAuthState(this.authDir)
    this.authenticationState = auth.state
    this.persistCredentials = auth.saveCreds

    const { version } = await fetchLatestBaileysVersion()
    this.whatsAppWebVersion = version

    this.credentialsLoaded = true
    console.log(`${this.logTag()} Auth: ${this.authDir}`)
  }

  private startSocket(): void {
    this.socket?.end(undefined)
    this.reconnectScheduled = false

    this.socket = makeWASocket({
      version: this.whatsAppWebVersion,
      auth: this.authenticationState,
      browser: Browsers.macOS('Chrome')
    })

    const sock = this.socket

    sock.ev.on('creds.update', this.persistCredentials)
    sock.ev.on('connection.update', (u) => {
      void this.onConnectionUpdate(u)
    })
    sock.ev.on('messages.upsert', (payload) => {
      this.onMessagesUpsert(payload)
    })
  }

  private async onConnectionUpdate(
    update: Partial<BaileysEventMap['connection.update']>
  ): Promise<void> {
    const { connection, lastDisconnect, qr } = update

    if (qr != null && qr.length > 0) {
      console.log(`\n${this.logTag()} Pindai QR dengan WhatsApp:\n`)
      console.log(await QRCode.toString(qr, { type: 'terminal', small: true }))
    }

    if (connection === 'open') {
      this.status = 'connected'
      this.lastDisconnectReason = undefined
      console.log(`${this.logTag()} Terhubung ke WhatsApp.`)
      return
    }

    if (connection !== 'close') {
      return
    }

    const disconnectError = lastDisconnect?.error as
      | (Error & { output?: { statusCode?: number } })
      | undefined
      
    const code = disconnectError?.output?.statusCode
    const errMsg = disconnectError?.message ?? String(code ?? 'unknown')
    this.lastDisconnectReason = errMsg
    console.error(`${this.logTag()} Koneksi tertutup:`, errMsg)

    this.socket = undefined

    if (this.intentionalDisconnect) {
      this.status = 'disconnected'
      return
    }

    if (code === DisconnectReason.loggedOut) {
      this.status = 'disconnected'
      this.lastDisconnectReason = 'Logged out — perlu scan QR lagi'
      return
    }

    const shouldRetry =
      code === DisconnectReason.restartRequired ||
      code === DisconnectReason.connectionClosed ||
      code === DisconnectReason.connectionLost ||
      code === DisconnectReason.timedOut

    if (!shouldRetry || this.reconnectScheduled) {
      this.status = 'error'
      return
    }

    this.status = 'connecting'
    this.reconnectScheduled = true
    setTimeout(() => {
      this.reconnectScheduled = false
      if (this.intentionalDisconnect) {
        this.status = 'disconnected'
        return
      }
      this.startSocket()
    }, WhatsappService.RECONNECT_MS)
  }

  private onMessagesUpsert(payload: BaileysEventMap['messages.upsert']): void {
    for (const msg of payload.messages) {
      void this.botReply(msg)
    }
  }

  private getIncomingPlainText(
    content: NonNullable<WAMessage['message']>
  ): string | undefined {
    if (typeof content.conversation === 'string' && content.conversation.length > 0) {
      return content.conversation
    }
    const extended = content.extendedTextMessage?.text
    if (typeof extended === 'string' && extended.length > 0) {
      return extended
    }
    return undefined
  }

  private async botReply(msg: WAMessage): Promise<void> {
    const sock = this.socket
    if (sock == null || msg.message == null) return
    if (msg.key.fromMe === true) return

    const chatJid = msg.key.remoteJid
    if (chatJid == null || chatJid === 'status@broadcast') return

    const text = this.getIncomingPlainText(msg.message)
    if (text == null || text.trim().toLowerCase() !== 'ping') return

    try {
      await sock.sendMessage(chatJid, { text: 'pong' }, { quoted: msg })
      console.log(`${this.logTag()} Membalas "pong" ke ${chatJid}`)
    } catch (error) {
      console.error(`${this.logTag()} Gagal mengirim pong:`, error)
    }
  }
}

void new WhatsappService(1).connect()
