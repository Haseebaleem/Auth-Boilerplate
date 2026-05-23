import { verifyAccessToken } from "../utils/jwt.utils.js";
import { ApiError } from "./error.middleware.js";

export const authenticate = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid Authorization header"));
  }
  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, "Invalid or expired access token"));
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, "Not authenticated"));
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Insufficient permissions"));
  }
  next();
};
