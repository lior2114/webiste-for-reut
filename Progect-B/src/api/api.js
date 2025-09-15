// Mock data for vacations
const mockVacations = [
    {
        id: 1,
        vacation_destination: "Paris, France",
        vacation_description: "Romantic getaway to the City of Light",
        vacation_image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=500",
        vacation_start_date: "2024-06-01",
        vacation_end_date: "2024-06-07",
        vacation_price: 1200,
        vacation_followers_count: 0
    },
    {
        id: 2,
        vacation_destination: "Tokyo, Japan",
        vacation_description: "Experience the blend of traditional and modern Japan",
        vacation_image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500",
        vacation_start_date: "2024-07-15",
        vacation_end_date: "2024-07-22",
        vacation_price: 1800,
        vacation_followers_count: 0
    },
    {
        id: 3,
        vacation_destination: "New York, USA",
        vacation_description: "The city that never sleeps",
        vacation_image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500",
        vacation_start_date: "2024-08-10",
        vacation_end_date: "2024-08-17",
        vacation_price: 1500,
        vacation_followers_count: 0
    }
];

// Mock data for countries
const mockCountries = [
    { id: 1, country_name: "France" },
    { id: 2, country_name: "Japan" },
    { id: 3, country_name: "United States" },
    { id: 4, country_name: "Italy" },
    { id: 5, country_name: "Spain" }
];

// Mock API functions - simulate async behavior
export const getVacations = async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockVacations;
}

export const getVacationById = async (vacationId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const vacation = mockVacations.find(v => v.id === parseInt(vacationId));
    if (!vacation) {
        throw new Error("Vacation not found");
    }
    return vacation;
}

export const getCountries = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockCountries;
}

export const createCountry = async (country_name) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCountry = {
        id: mockCountries.length + 1,
        country_name
    };
    mockCountries.push(newCountry);
    return newCountry;
}

export const deleteVacation = async (vacationId) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockVacations.findIndex(v => v.id === parseInt(vacationId));
    if (index === -1) {
        throw new Error("Vacation not found");
    }
    mockVacations.splice(index, 1);
    return { message: "Vacation deleted successfully" };
}

export const createVacation = async (vacationData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newVacation = {
        id: mockVacations.length + 1,
        ...vacationData,
        vacation_followers_count: 0
    };
    mockVacations.push(newVacation);
    return newVacation;
}

export const updateVacation = async (vacationId, vacationData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const index = mockVacations.findIndex(v => v.id === parseInt(vacationId));
    if (index === -1) {
        throw new Error("Vacation not found");
    }
    mockVacations[index] = { ...mockVacations[index], ...vacationData };
    return mockVacations[index];
}

// Mock likes functionality
export const getLikes = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [];
}

export const likeVacation = async ({ user_id, vacation_id }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const vacation = mockVacations.find(v => v.id === vacation_id);
    if (vacation) {
        vacation.vacation_followers_count += 1;
    }
    return { message: "Vacation liked successfully" };
}

export const unlikeVacation = async ({ user_id, vacation_id }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const vacation = mockVacations.find(v => v.id === vacation_id);
    if (vacation && vacation.vacation_followers_count > 0) {
        vacation.vacation_followers_count -= 1;
    }
    return { message: "Vacation unliked successfully" };
}

