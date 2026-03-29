import { indexingTextDocuments } from './textIndexing'
import { findAllIndexings } from './findAllIndexings'
import { removeIndexingById } from './deleteIndexingById'

export const IndexingController = {
  indexingTextDocuments,
  findAllIndexings,
  removeIndexingById
}
