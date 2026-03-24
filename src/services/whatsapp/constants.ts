import path from 'path'

/** Folder induk sesi multi-file Baileys per user (di luar `src/` agar watch tidak restart). */
export const WHATSAPP_SESSIONS_ROOT = path.join(
  process.cwd(),
  '..',
  'resources',
  'whatsapp',
  'sessions'
)

export const WHATSAPP_RECONNECT_DELAY_MS = 1500

/** Polling interval while waiting for pairing QR after connect. */
export const WHATSAPP_PAIRING_QR_POLL_MS = 250

export const WHATSAPP_PAIRING_QR_WAIT_DEFAULT_MS = 30_000
