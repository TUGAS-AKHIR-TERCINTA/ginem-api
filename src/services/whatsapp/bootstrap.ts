import type { Dirent } from 'fs'
import { readdir, readFile } from 'fs/promises'
import path from 'path'

import logger from '../../utilities/logger'
import { WHATSAPP_SESSIONS_ROOT } from './constants'
import { WhatsappService } from './WhatsApp.service'

const LOG_PREFIX = '[WhatsappBoot]'

/** Aktif kecuali `WHATSAPP_AUTO_CONNECT_ON_BOOT=false`. */
export function isWhatsappAutoConnectOnBootEnabled(): boolean {
  return process.env.WHATSAPP_AUTO_CONNECT_ON_BOOT !== 'false'
}

/**
 * `undefined` = tidak dibatasi (semua user terpasang di-resume).
 * Angka positif = batas eksplisit, mis. `50` → paling banyak 50 user, sisanya tidak di-connect.
 */
function parseMaxUsers(): number | undefined {
  const raw = process.env.WHATSAPP_AUTO_CONNECT_MAX_USERS
  if (raw == null || raw.trim() === '') return undefined
  const n = parseInt(raw.trim(), 10)
  if (!Number.isFinite(n) || n <= 0) return undefined
  return n
}

async function dirHasRegisteredCreds(authDir: string): Promise<boolean> {
  const credsPath = path.join(authDir, 'creds.json')
  try {
    const raw = await readFile(credsPath, 'utf8')
    const parsed = JSON.parse(raw) as { registered?: boolean }
    return parsed.registered === true
  } catch {
    return false
  }
}

function collectNumericUserIds(entries: Dirent[]): number[] {
  const ids: number[] = []
  for (const ent of entries) {
    if (!ent.isDirectory()) continue
    const name = ent.name
    if (!/^\d+$/.test(name)) continue
    const userId = Number(name)
    if (!Number.isSafeInteger(userId) || userId <= 0) continue
    ids.push(userId)
  }
  return ids.sort((a, b) => a - b)
}

/**
 * Setelah server listen: hubungkan ulang sesi yang sudah pernah dipasangkan (ada `creds.json` dengan `registered: true`).
 * Non-blocking; kegagalan per-user hanya di-log.
 */
export async function resumeWhatsappSessionsOnBoot(): Promise<void> {
  if (!isWhatsappAutoConnectOnBootEnabled()) {
    logger.info(`${LOG_PREFIX} skipped (WHATSAPP_AUTO_CONNECT_ON_BOOT=false)`)
    return
  }

  let entries: Dirent[]
  try {
    entries = await readdir(WHATSAPP_SESSIONS_ROOT, { withFileTypes: true })
  } catch (error) {
    logger.warn(
      `${LOG_PREFIX} cannot read sessions root ${WHATSAPP_SESSIONS_ROOT}: ${String(error)}`
    )
    return
  }

  const maxUsers = parseMaxUsers()
  const numericIds = collectNumericUserIds(entries)
  const paired: number[] = []

  for (const userId of numericIds) {
    const authDir = path.join(WHATSAPP_SESSIONS_ROOT, String(userId))
    if (await dirHasRegisteredCreds(authDir)) {
      paired.push(userId)
    }
  }

  if (paired.length === 0) {
    logger.info(
      `${LOG_PREFIX} no paired sessions to resume under ${WHATSAPP_SESSIONS_ROOT}`
    )
    return
  }

  const toResume =
    maxUsers != null && paired.length > maxUsers
      ? paired.slice(0, maxUsers)
      : paired

  if (maxUsers != null && paired.length > maxUsers) {
    logger.warn(
      `${LOG_PREFIX} WHATSAPP_AUTO_CONNECT_MAX_USERS=${maxUsers}: only ${maxUsers} of ${paired.length} paired sessions will auto-connect (rest skipped)`
    )
  }

  logger.info(
    `${LOG_PREFIX} resuming ${toResume.length} WhatsApp session(s) in background`
  )

  for (const userId of toResume) {
    void WhatsappService.forUser(userId).connect().catch((error: unknown) => {
      logger.warn(
        `${LOG_PREFIX} auto-connect failed user=${userId}: ${String(error)}`
      )
    })
  }
}
