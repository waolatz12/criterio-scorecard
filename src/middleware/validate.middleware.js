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
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      
      res.status(400).json({ errors });
    } else {
      next();
    }
  };
}

module.exports = { validate };
