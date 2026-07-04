import { mockRequest, mockResponse } from '../testHelpers'

describe('testHelpers', () => {
  it('creates a mock request with body, params, and query', () => {
    const req = mockRequest({ name: 'device' }, { id: '1' }, { page: '2' })

    expect(req.body).toEqual({ name: 'device' })
    expect(req.params).toEqual({ id: '1' })
    expect(req.query).toEqual({ page: '2' })
    expect(req.headers).toEqual({})
  })

  it('creates a chainable mock response', () => {
    const res = mockResponse()

    expect(res.status(200)).toBe(res)
    expect(res.json({ ok: true })).toBe(res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })
})
