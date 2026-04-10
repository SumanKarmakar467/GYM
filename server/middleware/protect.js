import User from "../models/User.js";
import { getAccessTokenFromRequest, verifyAccessToken } from "../services/tokenService.js";

const protect = async (req, res, next) => {
  try {
    const token = getAccessTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default protect;