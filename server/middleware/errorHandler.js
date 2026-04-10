const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err?.message?.includes("CORS")) {
    return res.status(403).json({ message: err.message });
  }

  const statusCode = Number(err?.statusCode) || 500;
  const message = err?.message || "Internal server error";

  return res.status(statusCode).json({ message });
};

export default errorHandler;