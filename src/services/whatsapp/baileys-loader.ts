/**
 * Baileys is ESM-only. Compiling the app to CommonJS may rewrite
 * `import('@whiskeysockets/baileys')` to `require(...)`, which throws ERR_REQUIRE_ESM.
 * This keeps native dynamic import at runtime.
 */
export type BaileysModule = typeof import('@whiskeysockets/baileys')

let baileysPromise: Promise<BaileysModule> | undefined

export async function loadBaileys(): Promise<BaileysModule> {
  if (baileysPromise == null) {
    const dynamicImport = new Function('specifier', 'return import(specifier)') as (
      specifier: string
    ) => Promise<BaileysModule>
    baileysPromise = dynamicImport('@whiskeysockets/baileys')
  }
  return baileysPromise
}
