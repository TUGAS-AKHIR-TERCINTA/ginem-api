/**
 * Poin 28: raw model responses and tool calls are kept for research audit, but
 * credentials must never be written to disk even if a provider echoes one back
 * (e.g. inside an error message). Defense in depth — normal chat/tool traffic in
 * this dataset never carries secrets, but this runs on every persisted string anyway.
 */
const SECRET_PATTERNS: RegExp[] = [
  /sk-[a-zA-Z0-9]{16,}/g, // OpenAI/Anthropic-style API keys
  /Bearer\s+[a-zA-Z0-9._-]{16,}/gi,
  /AKIA[0-9A-Z]{16}/g, // AWS access key id
  /mongodb(\+srv)?:\/\/[^\s"']+/gi,
  /amqp:\/\/[^\s"']+/gi,
  /mqtt:\/\/[^\s"']*:[^\s"']+@[^\s"']+/gi
]

export function redactSecrets(text: string): string {
  return SECRET_PATTERNS.reduce(
    (acc, pattern) => acc.replace(pattern, '[REDACTED]'),
    text
  )
}
