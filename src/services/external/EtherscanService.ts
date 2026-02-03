import axios, { AxiosError } from 'axios'
import { appConfigs } from '../../configs'
import logger from '../../logs'

export class EtherscanService {
  static async fetchWalletERC20Tx(walletAddress: string): Promise<any[]> {
    try {
      const response = await axios.get(appConfigs.etherScan.baseUrl!, {
        params: {
          chainid: 1,
          module: 'account',
          action: 'tokentx',
          address: walletAddress,
          contractaddress: '0xdac17f958d2ee523a2206206994597c13d831ec7', // Example: USDT token
          startblock: 0,
          endblock: 9999999999,
          page: 1,
          offset: 100, // Number of results per page
          sort: 'asc',
          apikey: appConfigs.etherScan.token
        },
        timeout: 10_000
      })

      if (typeof response.data !== 'object') {
        logger.error('[Etherscan] Invalid response (not JSON)', {
          walletAddress,
          dataType: typeof response.data
        })
        return []
      }

      const { status, message, result } = response.data

      if (status !== '1') {
        logger.warn('[Etherscan] API warning', {
          walletAddress,
          message
        })
        return []
      }

      if (!Array.isArray(result)) {
        logger.error('[Etherscan] Result is not array', {
          walletAddress,
          result
        })
        return []
      }

      return result
    } catch (error) {
      const err = error as AxiosError

      logger.error('[Etherscan] Request failed', {
        walletAddress,
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      })

      return []
    }
  }

  static async fetchTokenTransfers(tokenAddress: string): Promise<any[]> {
    try {
      const response = await axios.get(appConfigs.etherScan.baseUrl!, {
        params: {
          chainid: 1,
          module: 'account',
          action: 'tokentx',
          contractaddress: tokenAddress,
          page: 1,
          offset: 100,
          sort: 'desc',
          apikey: appConfigs.etherScan.token
        },
        timeout: 10000
      })

      if (response.data?.status !== '1') return []
      return Array.isArray(response.data.result) ? response.data.result : []
    } catch (error) {
      const err = error as AxiosError
      logger.error('[Etherscan] fetchTokenTransfers failed', {
        message: err.message
      })
      return []
    }
  }
}
