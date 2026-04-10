import jwt from "jsonwebtoken";

export const ACCESS_COOKIE_NAME = "gymforge_access";
export const REFRESH_COOKIE_NAME = "gymforge_refresh";

const isProduction = process.env.NODE_ENV === "production";

const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 15 * 60 * 1000
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
};

export const signAccessToken = (userId) =>
  jwt.sign({ id: String(userId), type: "access" }, process.env.JWT_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (userId) =>
  jwt.sign({ id: String(userId), type: "refresh" }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

export const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);
};

export const clearAuthCookies = (res) => {
  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  };

  res.clearCookie(ACCESS_COOKIE_NAME, clearOptions);
  res.clearCookie(REFRESH_COOKIE_NAME, clearOptions);
};

export const getAccessTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.[ACCESS_COOKIE_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};