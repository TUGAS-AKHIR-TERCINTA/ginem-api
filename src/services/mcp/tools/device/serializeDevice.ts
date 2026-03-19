export function serializeDevice(device: Record<string, unknown>): string {
  return JSON.stringify(device, null, 2)
}
