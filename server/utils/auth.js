import jwt from "jsonwebtoken";

const TOKEN_NAME = "gymforge_token";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000
});

export const signAuthToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

export const setAuthCookie = (res, token) => {
  res.cookie(TOKEN_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(TOKEN_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  });
};

export const getTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.[TOKEN_NAME];
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
};

export { TOKEN_NAME };
