import { Request, Response } from 'express'
import { jest } from '@jest/globals'

export const mockRequest = (
  body: any = {},
  params: any = {},
  query: any = {}
): Request => {
  return {
    body,
    params,
    query,
    get: jest.fn(),
    headers: {}
  } as unknown as Request
}

export const mockResponse = (): Response => {
  const res: Partial<Response | any> = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  res.setHeader = jest.fn().mockReturnValue(res)
  return res as Response
}
