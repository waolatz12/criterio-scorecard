const BaseRepository = require('./base.repository');

class ShipmentsRepository extends BaseRepository {
  constructor() {
    super('shipments');
  }
}

module.exports = new ShipmentsRepository();
