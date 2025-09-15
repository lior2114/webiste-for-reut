let URL = "http://localhost:5000"

// Auth headers helpers
const getAuthHeaderOnly = () => {
    try {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    } catch { return {}; }
};

const getJsonHeaders = () => ({
    'Content-Type': 'application/json',
    ...getAuthHeaderOnly()
});

export const register = async (userData) => {
    const response = await fetch(`${URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });
    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.Error || "Failed to register");
    }
    let data = await response.json();
    return data;
}

export const login = async (userData) => {
    // Convert to query parameters for GET request
    const params = new URLSearchParams({
        user_email: userData.user_email,
        user_password: userData.user_password
    });
    
    const response = await fetch(`${URL}/users/login?${params}`, {
        method: "GET",
    });
    
    // Read body ONCE depending on status
    if(!response.ok){
        const raw = await response.text();
        let errorMessage = "Failed to login";
        try {
            const errorData = JSON.parse(raw);
            errorMessage = errorData.Error || errorData.message || errorMessage;
        } catch (_e) {
            if (response.status === 400) {
                errorMessage = "Invalid email or password format";
            } else if (response.status === 401) {
                errorMessage = "Invalid email or password";
            } else if (response.status === 500) {
                errorMessage = "Server error. Please try again later.";
            } else {
                errorMessage = raw || errorMessage;
            }
        }
        throw new Error(errorMessage);
    }
    
    // Success path: parse as JSON once
    let data = await response.json();
    return data;
}

export const checkEmailAvailability = async (email) => {
    const params = new URLSearchParams({
        user_email: email
    });
    
    const response = await fetch(`${URL}/users/check_email?${params}`, {
        method: "GET",
    });
    if(!response.ok){
        throw new Error("Failed to check email");
    }
    let data = await response.json();
    return data;
}

// Vacations API
export const getVacations = async () => {
    const response = await fetch(`${URL}/vacations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch vacations");
    }
    return await response.json();
}

export const getVacationById = async (vacationId) => {
    const response = await fetch(`${URL}/vacations/${vacationId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch vacation");
    }
    return await response.json();
}

// Countries API
export const getCountries = async () => {
    const response = await fetch(`${URL}/countries`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch countries");
    }
    return await response.json();
}

export const createCountry = async (country_name) => {
    const response = await fetch(`${URL}/countries`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify({ country_name }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.Error || "Failed to create country");
    }
    return await response.json();
}

export const deleteVacation = async (vacationId, adminUserId) => {
    const qs = adminUserId ? `?admin_user_id=${encodeURIComponent(adminUserId)}` : '';
    const response = await fetch(`${URL}/vacations/delete/${vacationId}${qs}`, {
        method: "DELETE",
        headers: getJsonHeaders(),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.Error || "Failed to delete vacation");
    }
    return await response.json();
}

export const createVacation = async (formData) => {
    const response = await fetch(`${URL}/vacations`, {
        method: "POST",
        headers: { ...getAuthHeaderOnly() }, // don't set Content-Type with FormData
        body: formData,
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.Error || "Failed to create vacation");
    }
    return await response.json();
}

export const updateVacation = async (vacationId, formData) => {
    const response = await fetch(`${URL}/vacations/update/${vacationId}`, {
        method: "PUT",
        headers: { ...getAuthHeaderOnly() },
        body: formData,
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.Error || "Failed to update vacation");
    }
    return await response.json();
}

// Likes API
export const getLikes = async () => {
    const response = await fetch(`${URL}/likes`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch likes");
    }
    return await response.json();
}

export const likeVacation = async ({ user_id, vacation_id }) => {
    const response = await fetch(`${URL}/likes`, {
        method: "POST",
        headers: getJsonHeaders(),
        body: JSON.stringify({ user_id, vacation_id }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.Error || "Failed to like vacation");
    }
    return await response.json();
}

export const unlikeVacation = async ({ user_id, vacation_id }) => {
    const response = await fetch(`${URL}/likes`, {
        method: "DELETE",
        headers: getJsonHeaders(),
        body: JSON.stringify({ user_id, vacation_id }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.Error || "Failed to unlike vacation");
    }
    return await response.json();
}

// Users admin API
export const getUsers = async () => {
    const res = await fetch(`${URL}/users`, { method: 'GET', headers: getAuthHeaderOnly() });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
}

export const updateUser = async (userId, payload) => {
    const res = await fetch(`${URL}/users/${userId}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(payload)
    });
    const raw = await res.text();
    if (!res.ok) {
        try { const j = JSON.parse(raw); throw new Error(j.Error || 'Failed to update user'); } catch { throw new Error(raw || 'Failed to update user'); }
    }
    return JSON.parse(raw);
}

export const deleteUser = async (userId) => {
    const res = await fetch(`${URL}/users/${userId}`, {
        method: 'DELETE',
        headers: getJsonHeaders()
    });
    const raw = await res.text();
    if (!res.ok) {
        try { const j = JSON.parse(raw); throw new Error(j.Error || 'Failed to delete user'); } catch { throw new Error(raw || 'Failed to delete user'); }
    }
    return JSON.parse(raw);
}

export const banUser = async (userId, { reason, days }) => {
    const res = await fetch(`${URL}/bans/${userId}`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify({ reason, days })
    });
    const raw = await res.text();
    if (!res.ok) {
        try { const j = JSON.parse(raw); throw new Error(j.Error || 'Failed to ban user'); } catch { throw new Error(raw || 'Failed to ban user'); }
    }
    return JSON.parse(raw);
}

export const unbanUser = async (userId) => {
    const res = await fetch(`${URL}/bans/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaderOnly()
    });
    const raw = await res.text();
    if (!res.ok) {
        try { const j = JSON.parse(raw); throw new Error(j.Error || 'Failed to unban user'); } catch { throw new Error(raw || 'Failed to unban user'); }
    }
    return JSON.parse(raw);
}

export const checkBan = async (userId) => {
    const res = await fetch(`${URL}/bans/${userId}`, { method: 'GET', headers: getAuthHeaderOnly() });
    if (!res.ok) throw new Error('Failed to check ban');
    return await res.json();
}

// Refresh current user data from server
export const refreshUserData = async () => {
    const res = await fetch(`${URL}/users/verify_token`, { 
        method: 'GET', 
        headers: getAuthHeaderOnly() 
    });
    if (!res.ok) throw new Error('Failed to refresh user data');
    return await res.json();
}

