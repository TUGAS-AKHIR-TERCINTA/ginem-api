import { WalletTransactionModel } from '../../models/walletTransactionModel'
import { CoinGeckoService } from '../external/CoinGeckoService'

export class WalletTransactionService {
  static async saveWalletTransactions(
    walletAddress: string,
    transactions: any[]
  ): Promise<void> {
    const wallet = walletAddress.toLowerCase()

    for (const tx of transactions) {
      if (!tx.from || !tx.contractAddress) continue

      const from = tx.from.toLowerCase()
      const to = tx.to?.toLowerCase()

      let txType: 'BUY' | 'SELL' | null = null

      if (to === wallet) {
        txType = 'BUY'
      } else if (from === wallet) {
        txType = 'SELL'
      } else {
        continue
      }

      const priceUsd = await CoinGeckoService.getTokenPriceUsd(tx.contractAddress)

      await WalletTransactionModel.findOrCreate({
        where: { txHash: tx.hash },
        defaults: {
          walletAddress,
          txHash: tx.hash,
          fromAddress: tx.from,
          toAddress: tx.to ?? '',
          tokenAddress: tx.contractAddress,
          tokenSymbol: tx.tokenSymbol,
          value: tx.value,
          txType,
          priceUsd,
          timestamp: Number(tx.timeStamp)
        }
      })
    }
  }
}
