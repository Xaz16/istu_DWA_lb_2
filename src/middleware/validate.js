const { validationResult } = require('express-validator');

function sendValidationErrors(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({ errors: result.array({ onlyFirstError: false }) });
  }
  next();
}

module.exports = { sendValidationErrors };
