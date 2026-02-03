import { tool } from 'langchain'
import * as z from 'zod'

export interface SentimentResult {
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  confidence: number
  reason: string
}

/**
 * TOOL: Sentiment Analysis
 */
export const sentimentTool = tool(
  async ({ text }) => {
    return `
You are a financial sentiment analysis engine.

Analyze the sentiment of the following crypto-related text.

Text:
"""
${text}
"""

Return ONLY valid JSON with this exact format:
{
  "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
  "confidence": number,
  "reason": string
}
`
  },
  {
    name: 'sentiment_analysis',
    description: 'Analyze sentiment of crypto-related news text',
    schema: z.object({
      text: z.string().min(10)
    })
  }
)
