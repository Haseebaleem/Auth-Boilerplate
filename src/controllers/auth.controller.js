import prisma from "../config/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.utils.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.utils.js";
import { ApiError } from "../middleware/error.middleware.js";

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const issueTokens = async (user) => {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, "Email already registered");

    const user = await prisma.user.create({
      data: { name, email, password: await hashPassword(password) },
    });
    const tokens = await issueTokens(user);
    res.status(201).json({ success: true, user: publicUser(user), ...tokens });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.password))) {
      throw new ApiError(401, "Invalid email or password");
    }
    const tokens = await issueTokens(user);
    res.json({ success: true, user: publicUser(user), ...tokens });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.refreshToken !== refreshToken) {
      throw new ApiError(401, "Refresh token revoked");
    }
    const tokens = await issueTokens(user);
    res.json({ success: true, ...tokens });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });
    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new ApiError(404, "User not found");
    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};
