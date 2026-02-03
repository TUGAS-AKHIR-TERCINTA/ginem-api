import axios from 'axios'
import { appConfigs } from '../../configs'

export class CryptoPanicService {
  static async fetchNews(params?: {
    currencies?: string
    page?: number
  }): Promise<any[]> {
    const response = await axios.get(appConfigs?.cryptopanic?.baseUrl!, {
      params: {
        auth_token: appConfigs?.cryptopanic?.apiKey,
        kind: 'news',
        public: true,
        // currencies: params?.currencies || 'BTC,ETH',
        page: params?.page || 1
      }
    })

    return response.data?.results || []
  }
}
