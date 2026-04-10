export const getMeProfile = async (req, res) => {
  return res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar,
    isOnboarded: req.user.isOnboarded,
    createdAt: req.user.createdAt
  });
};

export const updateMeProfile = async (req, res) => {
  try {
    const hasNameField = typeof req.body?.name === "string";
    const hasAvatarField = typeof req.body?.avatar === "string";
    const name = hasNameField ? req.body.name.trim() : "";
    const avatar = hasAvatarField ? req.body.avatar.trim() : "";

    if (hasNameField && name) {
      req.user.name = name;
    }

    if (hasAvatarField) {
      req.user.avatar = avatar;
    }

    await req.user.save();

    return res.json({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      isOnboarded: req.user.isOnboarded,
      createdAt: req.user.createdAt
    });
  } catch {
    return res.status(500).json({ message: "Failed to update profile." });
  }
};
