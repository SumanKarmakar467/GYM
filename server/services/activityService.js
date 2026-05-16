import UserActivity from "../models/UserActivity.js";

export const recordActivity = async (userId, type, message, metadata = {}) => {
  if (!userId || !type || !message) {
    return null;
  }

  try {
    return await UserActivity.create({
      userId,
      type,
      message,
      metadata
    });
  } catch (error) {
    // Activity logging should never block the user action that caused it.
    // eslint-disable-next-line no-console
    console.warn("Activity log skipped:", error?.message || error);
    return null;
  }
};
