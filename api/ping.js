module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Ping serverless function is working!',
    nodeVersion: process.version,
    time: new Date().toISOString(),
  });
};
