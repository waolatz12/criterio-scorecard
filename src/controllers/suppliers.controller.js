const suppliersService = require('../services/suppliers.service');
const asyncHandler = require('../utils/asyncHandler');
const { createSupplier, updateSupplier, bulkImport } = require('../validators/suppliers.validator');

const listSuppliers = asyncHandler(async (req, res) => {
  const data = await suppliersService.list(req.query);
  res.json(data);
});

const getSupplier = asyncHandler(async (req, res) => {
  const data = await suppliersService.getById(req.params.id);
  if (!data) return res.status(404).json({ error: 'Supplier not found' });
  res.json(data);
});

const createSupplierHandler = asyncHandler(async (req, res) => {
  // Validate input
  const validatedData = createSupplier.parse(req.body);

  // Add organization_id from authenticated user
  validatedData.organization_id = req.user.organization_id;

  const data = await suppliersService.create(validatedData);
  res.status(201).json(data);
});

const updateSupplierHandler = asyncHandler(async (req, res) => {
  const validatedData = updateSupplier.parse(req.body);
  const data = await suppliersService.update(req.params.id, validatedData);
  if (!data) return res.status(404).json({ error: 'Supplier not found' });
  res.json(data);
});

const deleteSupplierHandler = asyncHandler(async (req, res) => {
  await suppliersService.delete(req.params.id);
  res.status(204).send();
});

const bulkImportSuppliers = asyncHandler(async (req, res) => {
  const validatedData = bulkImport.parse(req.body);
  validatedData.organization_id = req.user.organization_id;
  validatedData.created_by = req.user.id;

  const result = await suppliersService.bulkImport(validatedData);
  res.status(201).json(result);
});

const getImportBatches = asyncHandler(async (req, res) => {
  const data = await suppliersService.getImportBatches(req.user.organization_id);
  res.json(data);
});

const getImportBatch = asyncHandler(async (req, res) => {
  const data = await suppliersService.getImportBatch(req.params.batchId);
  if (!data) return res.status(404).json({ error: 'Import batch not found' });
  res.json(data);
});

module.exports = {
  listSuppliers,
  getSupplier,
  createSupplierHandler,
  updateSupplierHandler,
  deleteSupplierHandler,
  bulkImportSuppliers,
  getImportBatches,
  getImportBatch
};