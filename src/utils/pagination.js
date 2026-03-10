function paginate(query, { limit = 25, offset = 0 } = {}) {
  return `${query} LIMIT ${limit} OFFSET ${offset}`;
}

module.exports = { paginate };
