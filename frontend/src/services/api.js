import { auth } from "../firebase/config";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// =================================
// GET FIREBASE TOKEN
// =================================
const getToken = async () => {

    const user = auth.currentUser;

    if (!user) {
        console.warn("No logged in user");
        return null;
    }

    const token = await user.getIdToken(true);
    localStorage.setItem("token", token);

    return token;

};

// =================================
// RESPONSE HANDLER
// =================================
const handleResponse = async (res) => {

    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
    }

    let data;

    try {
        data = await res.json();
    } catch {
        data = {};
    }

    if (!res.ok) {
        throw new Error(data.detail || "Server Error");
    }

    return data;

};

// =================================
// FETCH WRAPPER
// =================================
const fetchWithAuth = async (url, options = {}) => {

    const token = await getToken();

    const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const res = await fetch(`${BASE_URL}${url}`, {
        ...options,
        headers
    });

    return handleResponse(res);

};

// =================================
// API METHODS
// =================================
export const api = {

    // =============================
    // USER
    // =============================
    getUserProfile: () => fetchWithAuth("/users/user-profile"),

    registerUser: (data) =>
        fetchWithAuth("/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),

    getPendingUsers: () => fetchWithAuth("/users/pending-users"),
    getStudents: () => fetchWithAuth("/users/students"),
    getGuides: () => fetchWithAuth("/users/guides"),

    deleteUser: (uid) =>
        fetchWithAuth(`/users/delete-user/${uid}`, {
            method: "DELETE"
        }),

    resetPassword: (newPassword) =>
        fetchWithAuth("/users/reset-password", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword })
        }),

    // =============================
    // GUIDE ACTIONS
    // =============================
    guideDecision: (groupId, decision) =>
        fetchWithAuth(`/groups/guide-decision/${groupId}?decision=${decision}`, {
            method: "PUT"
        }),

    // =============================
    // GROUPS
    // =============================
    getBranchGroups: () => fetchWithAuth("/groups/branch-groups"),

    createGroup: (data) =>
        fetchWithAuth("/groups/create-group", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),

    getMyGroup: () => fetchWithAuth("/groups/my-group"),

    getGuideGroups: () => fetchWithAuth("/groups/guide-groups"),

    // ✅ ASSIGN GUIDE
    assignGuide: (groupId, guideId) =>
        fetchWithAuth(`/groups/assign-guide/${groupId}?guide_id=${guideId}`, {
            method: "PUT"
        }),

    // ✅ DELETE GROUP
    deleteGroup: (groupId) =>
        fetchWithAuth(`/groups/delete-group/${groupId}`, {
            method: "DELETE"
        }),

    // =============================
    // 🔔 NOTIFICATIONS (NEW 🔥)
    // =============================
    sendNotification: (groupId, target, message) =>
        fetchWithAuth(
            `/groups/send-notification/${groupId}?target=${target}&message=${encodeURIComponent(message)}`,
            {
                method: "POST"
            }
        ),

    // ✅ GUIDE SEND NOTIFICATION
    sendGuideNotification: (groupId, message) =>
        fetchWithAuth(
            `/groups/guide-send-notification/${groupId}?message=${encodeURIComponent(message)}`,
            {
                method: "POST"
            }
        ),

    // ✅ CLEAR NOTIFICATIONS
    clearNotifications: () =>
        fetchWithAuth("/users/clear-notifications", {
            method: "DELETE"
        }),

    // =============================
    // PROJECT
    // =============================
    uploadProject: async (groupId, formData) => {

        const token = await getToken();

        const res = await fetch(`${BASE_URL}/groups/upload-project/${groupId}`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData
        });

        return handleResponse(res);
    },

    getGuideSubmissions: () => fetchWithAuth("/groups/guide-submissions"),

    reviewSubmission: (submissionId, data) =>
        fetchWithAuth(`/groups/review-submission/${submissionId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }),

    // =============================
    // FILE DOWNLOAD
    // =============================
    downloadFile: (filename) =>
        `${BASE_URL}/groups/files/${filename}`

};
