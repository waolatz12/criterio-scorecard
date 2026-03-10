const BaseRepository = require('./base.repository');

class ScorecardsRepository extends BaseRepository {
  constructor() {
    super('supplier_scorecards');
  }
}

module.exports = new ScorecardsRepository();
