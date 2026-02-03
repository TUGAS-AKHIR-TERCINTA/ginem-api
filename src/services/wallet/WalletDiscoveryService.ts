import { WalletModel } from '../../models/walletModel'
import logger from '../../logs'

export class WalletDiscoveryService {
  static async collectFromTransactions(transactions: any[]): Promise<void> {
    for (const tx of transactions) {
      const candidates = [tx.from, tx.to]

      for (const address of candidates) {
        if (!address) continue
        if (!address.startsWith('0x')) continue
        if (address.length !== 42) continue

        console.log(address)

        await WalletModel.findOrCreate({
          where: { walletAddress: address.toLowerCase() }
        })
      }
    }

    logger.info('[WalletDiscoveryService]: Wallet discovery finished')
  }
}
