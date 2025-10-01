import axios, { AxiosInstance } from 'axios'

const request = axios.create({
  baseURL: '/api'
})

interface Response<T> {
  code: number
  message: string
  data: T
}

class verificationApi  {
  constructor(private readonly request: AxiosInstance) {}

  async generateFingerprint(params: {
    address: string
    quality: 'S' | 'A' | 'B' | 'C' | 'D' | ''
    submit_data: unknown
  }): Promise<Response<{ fingerprint: string }>> {
    const res = await this.request.post('/v2/chain/gen/fingerprint', params)
    return res.data
  }
}

export default new verificationApi(request)