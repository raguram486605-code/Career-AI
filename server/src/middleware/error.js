exports.notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
exports.errorHandler = (err, req, res, next) => {  // eslint-disable-line no-unused-vars
  console.error(err);
  let status = err.status || 500, message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.code === 11000) { status = 409; message = 'Duplicate value: ' + Object.keys(err.keyValue || {}).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid id'; }
  if (err.code === 'LIMIT_FILE_SIZE') { status = 413; message = 'File too large (max 5 MB)'; }
  if (err.response && err.response.data) {   // error coming from the AI service
    status = err.response.status === 400 || err.response.status === 422 ? 422 : 502;
    message = err.response.data.detail || message;
  } else if (err.code === 'ECONNREFUSED') { status = 503; message = 'AI service is not running'; }
  res.status(status).json({ message });
};
