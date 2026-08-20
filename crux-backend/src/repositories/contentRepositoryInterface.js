/**
 * ContentRepository Interface Contract
 * Isolates data access operations from business logic so Local JSON / DynamoDB / PostgreSQL
 * can be interchanged without modifying application controllers or services.
 */
class ContentRepositoryInterface {
  async getFeed(limit = 20) { throw new Error('Not implemented'); }
  async getLatest() { throw new Error('Not implemented'); }
  async getById(id) { throw new Error('Not implemented'); }
  async getByCategory(category) { throw new Error('Not implemented'); }
  async getAllForAdmin() { throw new Error('Not implemented'); }
  async save(contentItem) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}

module.exports = ContentRepositoryInterface;
