import { WalletModel } from '../../models/walletModel'
import { SmartWalletSyncService } from './SmartWalletSyncService'

export class SmartWalletBatchService {
  static async syncAll(): Promise<void> {
    const wallets = (await WalletModel.findAll({
      where: { deleted: 0 }
    })) as any[]

    for (const wallet of wallets) {
      await SmartWalletSyncService.sync(wallet.walletAddress)
    }
  }
}
