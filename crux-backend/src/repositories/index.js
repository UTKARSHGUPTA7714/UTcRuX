const env = require('../config/env');
const LocalContentRepository = require('./localContentRepository');

let repositoryInstance = null;

function getContentRepository() {
  if (!repositoryInstance) {
    if (env.USE_DYNAMODB) {
      // Future DynamoDB repository instance
      console.log('[Repository] Initializing DynamoDbContentRepository...');
      const DynamoDbContentRepository = require('./dynamoDbContentRepository');
      repositoryInstance = new DynamoDbContentRepository();
    } else {
      console.log('[Repository] Initializing LocalContentRepository (Local Persistence)...');
      repositoryInstance = new LocalContentRepository();
    }
  }
  return repositoryInstance;
}

module.exports = getContentRepository();
