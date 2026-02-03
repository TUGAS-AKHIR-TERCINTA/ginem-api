import { DailySummaryModel } from '../../models/dailySummaryModel'
import { DailySummaryService } from '../llm/DailySummaryService'

export class DailySummaryStoreService {
  static async getOrCreate(date: Date) {
    const dateOnly = date.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Jakarta'
    })

    const existing = await DailySummaryModel.findOne({
      where: {
        dailySummaryDate: dateOnly
      }
    })

    if (existing) {
      return existing
    }

    const summary = await DailySummaryService.generate(date)

    return await DailySummaryModel.create({
      dailySummaryDate: dateOnly,
      dailySummaryMarketSentiment: summary.marketSentiment,
      dailySummaryConfidence: summary.confidence,
      dailySummarySummary: summary.summary,
      dailySummaryHighlights: summary.highlights
    })
  }

  static async get(date: Date) {
    const dateOnly = date.toLocaleDateString('en-CA', {
      timeZone: 'Asia/Jakarta'
    })

    const existing = await DailySummaryModel.findOne({
      where: {
        dailySummaryDate: dateOnly
      }
    })

    return existing
  }
}
