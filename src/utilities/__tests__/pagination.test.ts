import { Pagination } from '../pagination'

describe('Pagination', () => {
  it('calculates offset for 1-based pages', () => {
    expect(new Pagination(1, 10).offset).toBe(0)
    expect(new Pagination(2, 10).offset).toBe(10)
    expect(new Pagination(3, 20).offset).toBe(40)
  })

  it('normalizes invalid page to 1 and falls back size to default 10', () => {
    const pagination = new Pagination(0, 0)

    expect(pagination.page).toBe(1)
    expect(pagination.limit).toBe(10)
    expect(pagination.offset).toBe(0)
  })

  it('formats paginated data', () => {
    const pagination = new Pagination(2, 10)
    const formatted = pagination.formatData({
      count: 25,
      rows: [{ id: 11 }, { id: 12 }]
    })

    expect(formatted).toEqual({
      totalItems: 25,
      items: [{ id: 11 }, { id: 12 }],
      totalPages: 3,
      currentPage: 2
    })
  })

  it('returns zero total pages when count is zero', () => {
    const formatted = new Pagination(1, 10).formatData({ count: 0, rows: [] })

    expect(formatted.totalPages).toBe(0)
    expect(formatted.totalItems).toBe(0)
  })
})
