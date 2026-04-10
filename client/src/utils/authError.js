const firebaseMessages = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters.",
  "auth/user-not-found": "Account not found.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/too-many-requests": "Too many attempts. Please try again in a few minutes."
};

export const getReadableAuthError = (error, fallbackMessage) => {
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) {
    return serverMessage;
  }

  const firebaseCode = error?.code;
  if (firebaseCode && firebaseMessages[firebaseCode]) {
    return firebaseMessages[firebaseCode];
  }

  if (error?.code === "ERR_NETWORK") {
    return "Cannot connect to server. Start backend API or set VITE_API_URL correctly.";
  }

  return fallbackMessage;
};
