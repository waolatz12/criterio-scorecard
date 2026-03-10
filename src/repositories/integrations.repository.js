const BaseRepository = require('./base.repository');

class IntegrationsRepository extends BaseRepository {
  constructor() {
    super('api_integrations');
  }
}

module.exports = new IntegrationsRepository();
