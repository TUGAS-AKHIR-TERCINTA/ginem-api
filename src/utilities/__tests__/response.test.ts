import { ResponseData } from '../response'

jest.mock('../../configs/appConfig', () => ({
  appConfigs: {
    app: { appVersion: '1.0.0-test' }
  }
}))

describe('ResponseData', () => {
  it('builds a success response with defaults', () => {
    const response = ResponseData.success({ data: { id: 1 } })

    expect(response.success).toBe(true)
    expect(response.message).toBe('Request successful')
    expect(response.data).toEqual({ id: 1 })
    expect(response.meta.version).toBe('1.0.0-test')
    expect(response.meta.timestamp).toEqual(expect.any(String))
  })

  it('builds a success response with custom metadata', () => {
    const response = ResponseData.success({
      data: null,
      message: 'Created',
      executionTime: '12ms',
      requestId: 'req-1'
    })

    expect(response.message).toBe('Created')
    expect(response.meta.executionTime).toBe('12ms')
    expect(response.meta.requestId).toBe('req-1')
  })

  it('builds an error response with defaults', () => {
    const response = ResponseData.error({})

    expect(response.success).toBe(false)
    expect(response.message).toBe('Something went wrong')
    expect(response.data).toBeNull()
    expect(response.meta.version).toBe('1.0.0-test')
  })

  it('builds an error response with custom message', () => {
    const response = ResponseData.error({ message: 'Unauthorized' })

    expect(response.message).toBe('Unauthorized')
  })
})
