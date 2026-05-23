import { ApiError } from "./error.middleware.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return next(new ApiError(400, "Validation failed", details));
  }
  req.body = result.data;
  next();
};
