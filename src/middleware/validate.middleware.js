const { ZodSchema } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      // build a clean errors object
      const issues = result.error?.issues || result.error?.errors || [];
      const errors = issues.map(e => ({
        field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
        message: e.message || 'Validation error',
      }));

      if (errors.length === 0) {
        errors.push({ field: '', message: 'Validation error' });
      }

      return res.status(400).json({ errors });
    } else {
      next();
    }
  };
}

module.exports = { validate };

