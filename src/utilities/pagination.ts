interface PaginationDataType {
  count: number
  rows: any[]
}

/**
 * Pagination utility. Page is 1-based: page 1 = first page.
 */
class Pagination {
  readonly limit: number
  readonly offset: number
  /** 1-based page number (page 1 = first page) */
  readonly page: number

  constructor (page: number, size: number = 10) {
    const parsedPage = Math.floor(Number(page))
    const parsedSize = Math.floor(Number(size))
    this.page = Math.max(
      1,
      Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
    )
    this.limit = Math.max(
      1,
      Number.isFinite(parsedSize) && parsedSize > 0 ? parsedSize : 10
    )
    this.offset = this.calculateOffset(this.page, this.limit)
  }

  /** Offset for 1-based page: page 1 -> 0, page 2 -> limit, etc. */
  private calculateOffset (page: number, size: number): number {
    return (page - 1) * size
  }

  public formatData (data: PaginationDataType) {
    const { count, rows } = data

    const totalPages = this.limit > 0 ? Math.ceil(count / this.limit) : 0

    return {
      totalItems: count,
      items: rows,
      totalPages,
      currentPage: this.page
    }
  }
}

export { Pagination }
