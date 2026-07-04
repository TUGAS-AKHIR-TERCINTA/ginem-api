export type WhatsappConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'

/** Hasil menunggu QR pairing setelah `connect()` (untuk REST). */
export interface WhatsappPairingConnectResult {
  connectionStatus: WhatsappConnectionStatus
  timedOut: boolean
  /** String QR mentah dari Baileys (bisa di-render ke PNG). */
  pairingQrRaw?: string
}
