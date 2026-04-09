
const _baseURL = import.meta.env.VITE_API_URL || 'https://mujconnect-3lj9.onrender.com/api';
const API_URL = _baseURL.endsWith('/api') ? _baseURL : `${_baseURL}/api`;

export const fetchServices = async () => {
    const response = await fetch(`${API_URL}/services`);
    if (!response.ok) {
        throw new Error('Failed to fetch services');
    }
    return response.json();
};

export const fetchServiceById = async (id: string) => {
    const response = await fetch(`${API_URL}/services/${id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch service');
    }
    return response.json();
};

export const fetchCategories = async () => {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) {
        throw new Error('Failed to fetch categories');
    }
    return response.json();
};

export const createBooking = async (bookingData: any) => {
    const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create booking');
    }
    return response.json();
};

export const fetchBookings = async () => {
    const response = await fetch(`${API_URL}/bookings`);
    if (!response.ok) {
        throw new Error('Failed to fetch bookings');
    }
    return response.json();
};

export const fetchUserBookings = async (userId: string) => {
    const response = await fetch(`${API_URL}/bookings/user/${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user bookings');
    }
    return response.json();
};
