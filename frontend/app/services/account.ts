export async function registerUser(username: string, password: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    return await response.json();
}

export async function loginUser(username: string, password: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    return await response.json();
}

export async function fetchUserProfile() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/fetch`, {
        method: 'GET',
        credentials: 'include',
    });
    return await response.json();
}

export async function logoutUser() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    return await response.json();
}

export async function deleteAccount(password: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
    });
    return await response.json();
}

export async function downloadAccountData() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/download`, {
        method: 'GET',
        credentials: 'include',
    });
    
    if (!response.ok) {
        throw new Error('Failed to download account data');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thoughtful-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true };
}

export async function listApiKeys() {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/api-keys`, {
        method: 'GET',
        credentials: 'include',
    });
    return await response.json();
}

export async function createApiKey(description: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/api-keys/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
    });
    return await response.json();
}

export async function deleteApiKey(id: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/account/api-keys/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
    });
    return await response.json();
}