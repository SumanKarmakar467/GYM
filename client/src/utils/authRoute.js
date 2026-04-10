export const getPostAuthRoute = (user) => {
  if (!user) {
    return "/login";
  }

  if (user.role === "admin") {
    return "/admin";
  }

  return user.isOnboarded ? "/dashboard" : "/onboarding";
};
