let app;
let initError = null;

try {
  app = require('../server/server');
} catch (err) {
  try {
    app = require('./server/server');
  } catch (err2) {
    initError = {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      secondaryError: err2.message,
    };
    console.error('[Vercel Serverless Init Error]:', err);
  }
}

module.exports = (req, res) => {
  // CORS headers just in case
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Diagnostic ping route
  if (req.url === '/api/ping' || req.url === '/ping') {
    return res.status(200).json({
      status: 'ok',
      message: 'Vercel Serverless Function is alive!',
      hasApp: !!app,
      initError,
      time: new Date().toISOString(),
    });
  }

  if (initError || !app) {
    return res.status(500).json({
      success: false,
      error: 'SERVERLESS_INIT_ERROR',
      message: 'Failed to load server module',
      details: initError,
    });
  }

  try {
    return app(req, res);
  } catch (runtimeErr) {
    console.error('[Vercel Runtime Error]:', runtimeErr);
    return res.status(500).json({
      success: false,
      error: 'SERVERLESS_RUNTIME_ERROR',
      message: runtimeErr.message,
      stack: runtimeErr.stack,
    });
  }
};
