import { createRemoteJWKSet, jwtVerify } from "jose";

const JWKS_URL = new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com");
const JWKS = createRemoteJWKSet(JWKS_URL);

const getFirebaseProjectId = () =>
  process.env.FIREBASE_PROJECT_ID || "gym1-b11c9";

export const verifyFirebaseIdToken = async (idToken) => {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing Firebase ID token.");
  }

  const projectId = getFirebaseProjectId();

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId
  });

  return payload;
};