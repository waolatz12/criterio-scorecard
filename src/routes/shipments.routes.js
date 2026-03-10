const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('list shipments'));

module.exports = router;
