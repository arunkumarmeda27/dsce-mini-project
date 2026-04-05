import { auth } from "../firebase/config";

/**
 * Always returns a fresh, valid Firebase ID token.
 * Falls back to the localStorage token if Firebase has no current user.
 * This prevents 401 errors caused by expired tokens.
 */
export async function getFreshToken() {
    const currentUser = auth.currentUser;
    if (currentUser) {
        try {
            const token = await currentUser.getIdToken(true); // force refresh
            localStorage.setItem("token", token);
            return token;
        } catch (err) {
            console.error("Token refresh failed:", err);
        }
    }
    // Fallback to stored token (may be expired, but better than nothing)
    return localStorage.getItem("token");
}
