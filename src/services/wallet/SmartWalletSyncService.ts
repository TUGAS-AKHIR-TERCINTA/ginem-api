import logger from '../../logs'
import { EtherscanService } from '../external/EtherscanService'
import { WalletTransactionService } from './WalletTransactionService'
import { SmartWalletProfitService } from './SmartWalletProfitService'

export class SmartWalletSyncService {
  static async sync(walletAddress: string): Promise<void> {
    try {
      const transactions = await EtherscanService.fetchWalletERC20Tx(walletAddress)

      if (!transactions.length) {
        logger.info(`No tx for wallet ${walletAddress}`)
        return
      }

      await WalletTransactionService.saveWalletTransactions(walletAddress, transactions)

      await SmartWalletProfitService.calculate(walletAddress)

      logger.info(`Wallet synced: ${walletAddress}`)
    } catch (error) {
      logger.error(`Sync failed for ${walletAddress}`, error)
    }
  }
}
