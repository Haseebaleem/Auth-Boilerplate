export class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const body = {
    success: false,
    message: err.message || "Internal server error",
  };
  if (err.details) body.details = err.details;
  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    body.stack = err.stack;
  }
  res.status(statusCode).json(body);
};
