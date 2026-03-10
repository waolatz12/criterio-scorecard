const express = require('express');
const router = express.Router();

// import routes here
const authRoutes = require('./auth.routes');
const suppliersRoutes = require('./suppliers.routes');
const scorecardsRoutes = require('./scorecards.routes');
const kpisRoutes = require('./kpis.routes');
const shipmentsRoutes = require('./shipments.routes');
const integrationsRoutes = require('./integrations.routes');
const documentsRoutes = require('./documents.routes');
const notificationsRoutes = require('./notifications.routes');

router.use('/auth', authRoutes);
router.use('/suppliers', suppliersRoutes);
router.use('/scorecards', scorecardsRoutes);
router.use('/kpis', kpisRoutes);
router.use('/shipments', shipmentsRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/documents', documentsRoutes);
router.use('/notifications', notificationsRoutes);

module.exports = router;
