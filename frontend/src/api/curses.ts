import axios, { API_BASE } from './../../src/lib/config';


//
export async function getCourse (id: number) {
    const response = await axios.get(`${API_BASE}/course/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

//
export async function getCourses() {
    const response = await axios.get(`${API_BASE}/course/list/`, {
        withCredentials: true,
    });
    return response.data;
}

//
export async function lessonFinish(lessId: number) {
    const response = await axios.post(`${API_BASE}/course/complete/${lessId}/`, {
        withCredentials: true,
    });
    return response.data;
}