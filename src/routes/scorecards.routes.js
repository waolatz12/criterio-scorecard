const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('list scorecards'));

module.exports = router;
