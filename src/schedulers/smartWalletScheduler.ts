import cron from 'node-cron'
import logger from '../logs'
import { SmartWalletBatchService } from '../services/wallet/SmartWalletBatchService'
import { EtherscanService } from '../services/external/EtherscanService'
import { WalletDiscoveryService } from '../services/wallet/WalletDiscoveryService'

// export const smartWalletScheduler = () => {
//   // jalan tiap 6 jam
//   cron.schedule('0 */6 * * *', async () => {
//     logger.info('Smart wallet scheduler started')

//     await syncAllSmartWallets()

//     logger.info('Smart wallet scheduler finished')
//   })
// }

// cron.schedule(
//   '* * * * *',
//   async () => {
//     logger.info('[Scheduler]: Smart wallet scheduler started')
//     await SmartWalletBatchService.syncAll()
//   },
//   {
//     timezone: 'Asia/Jakarta'
//   }
// )

// cron.schedule(
//   '* * * * *',
//   async () => {
//     logger.info('[Scheduler] Wallet discovery started')

//     const txs = await EtherscanService.fetchWalletERC20Tx(
//       '0x6982508145454Ce325dDbE47a25d4ec3d2311933'
//     )

//     console.log('===txs====', txs)

//     await WalletDiscoveryService.collectFromTransactions(txs)
//   },
//   {
//     timezone: 'Asia/Jakarta'
//   }
// )
