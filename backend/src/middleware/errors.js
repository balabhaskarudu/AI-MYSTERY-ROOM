export function notFound(req, res) { res.status(404).json({ success: false, message: 'We could not find that page.', code: 'NOT_FOUND' }); }
export function errorHandler(error, req, res, next) {
  req.log?.error({ err: error }, 'request failed');
  if (error?.name === 'ZodError') return res.status(400).json({ success: false, message: error.issues?.[0]?.message || 'Please check the details and try again.', code: 'VALIDATION_ERROR' });
  if (error?.code === 11000) return res.status(409).json({ success: false, message: 'An account with that email already exists.', code: 'DUPLICATE' });
  const status = error.status || 500;
  res.status(status).json({ success: false, message: status < 500 ? error.message : 'Something went wrong. Please try again.', code: error.code || 'INTERNAL_ERROR' });
}
