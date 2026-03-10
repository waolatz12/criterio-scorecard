const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  listSuppliers,
  getSupplier,
  createSupplierHandler,
  updateSupplierHandler,
  deleteSupplierHandler,
  bulkImportSuppliers,
  getImportBatches,
  getImportBatch
} = require('../controllers/suppliers.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

// Configure multer for CSV uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Supplier CRUD routes
router.get('/', listSuppliers);
router.get('/:id', getSupplier);
router.post('/', validate('createSupplier'), createSupplierHandler);
router.put('/:id', validate('updateSupplier'), updateSupplierHandler);
router.delete('/:id', deleteSupplierHandler);

// Bulk import routes
router.post('/bulk-import', validate('bulkImport'), bulkImportSuppliers);
router.post('/import-csv', upload.single('file'), async (req, res) => {
  try {
    const suppliersService = require('../services/suppliers.service');
    const result = await suppliersService.importFromCSV(
      req.file.path,
      req.user.organization_id,
      req.user.id
    );

    // Clean up uploaded file
    require('fs').unlinkSync(req.file.path);

    res.status(201).json(result);
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      require('fs').unlinkSync(req.file.path);
    }
    res.status(400).json({ error: error.message });
  }
});

// Import batch tracking routes
router.get('/imports/batches', getImportBatches);
router.get('/imports/batches/:batchId', getImportBatch);

module.exports = router;
