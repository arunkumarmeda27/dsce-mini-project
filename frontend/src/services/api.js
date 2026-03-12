import { auth } from "../firebase/config";

const BASE_URL = "http://127.0.0.1:8000";


// =================================
// GET FRESH FIREBASE TOKEN
// =================================
const getToken = async () => {

    const user = auth.currentUser;

    if (!user) return null;

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

    const data = await res.json();

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
        Authorization: `Bearer ${token}`
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
    // USER PROFILE
    // =============================
    getUserProfile: async () => {
        return fetchWithAuth("/user-profile");
    },


    // =============================
    // CREATE GROUP
    // =============================
    createGroup: async (data) => {

        return fetchWithAuth("/create-group", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

    },


    // =============================
    // GET ELIGIBLE STUDENTS
    // =============================
    getEligibleStudents: async () => {
        return fetchWithAuth("/eligible-students");
    },


    // =============================
    // GET MY GROUP
    // =============================
    getMyGroup: async () => {
        return fetchWithAuth("/my-group");
    },


    // =============================
    // GET MY NOTIFICATIONS
    // =============================
    getMyNotifications: async () => {
        return fetchWithAuth("/my-notifications");
    },


    // =============================
    // ADMIN APIs
    // =============================

    getBranchGroups: async () => {
        return fetchWithAuth("/branch-groups");
    },

    getStudents: async () => {
        return fetchWithAuth("/students");
    },

    getGuides: async () => {
        return fetchWithAuth("/guides");
    },

    getPendingUsers: async () => {
        return fetchWithAuth("/pending-users");
    },

    approveUser: async (uid) => {

        return fetchWithAuth(`/approve/${uid}`, {
            method: "PUT"
        });

    },

    rejectUser: async (uid) => {

        return fetchWithAuth(`/reject/${uid}`, {
            method: "DELETE"
        });

    },


    // =============================
    // GROUP MANAGEMENT
    // =============================

    assignGuide: async (groupId, guideId) => {

        return fetchWithAuth(
            `/assign-guide/${groupId}?guide_id=${guideId}`,
            { method: "PUT" }
        );

    },

    guideDecision: async (groupId, decision) => {

        return fetchWithAuth(
            `/guide-decision/${groupId}?decision=${decision}`,
            { method: "PUT" }
        );

    },

    deleteGroup: async (groupId) => {

        return fetchWithAuth(`/delete-group/${groupId}`, {
            method: "DELETE"
        });

    },

    editGroup: async (groupId, data) => {

        return fetchWithAuth(`/edit-group/${groupId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

    },


    // =============================
    // GUIDE DASHBOARD
    // =============================

    getGuideGroups: async () => {
        return fetchWithAuth("/guide-groups");
    },


    // =============================
    // NOTIFICATIONS
    // =============================

    sendNotification: async (groupId, message) => {

        return fetchWithAuth("/send-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                groupId,
                message
            })
        });

    }

};

// DELETE USER (ADMIN)
deleteUser: async (uid) => {

    return fetchWithAuth(`/delete-user/${uid}`, {
        method: "DELETE"
    });

}