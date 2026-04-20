// api/admin.ts
import axios, { API_BASE } from './../../src/lib/config';


// Створити завдання
export async function createTask(form: any) {
    const response = await axios.post(`${API_BASE}/admin/task/add`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Оновити завдання
export async function updateTask(id: string, form: any) {
    const response = await axios.put(`${API_BASE}/admin/task/update/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

// Видалити завдання
export async function deleteTask(id: string) {
    const response = await axios.delete(`${API_BASE}/admin/task/del/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

// Отримати всі завдання
export async function getUnapprovedTasks() {
    const response = await axios.get(`${API_BASE}/admin/task/unapproved/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function acceptTask(channelId: number) {
    const response = await axios.put(`${API_BASE}/admin/task/accept/${channelId}/`, {}, {
        withCredentials: true,
    });
    return response.data;
}

export async function rejectTask(channelId: number) {
    const response = await axios.put(`${API_BASE}/admin/task/reject/${channelId}/`, {}, {
        withCredentials: true,
    });
    return response.data;
}


export async function getCourses() {
    const response = await axios.get(`${API_BASE}/admin/courses/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function createCourse (form: any) {
    const response = await axios.post (`${API_BASE}/admin/course/add/`, form, {
        withCredentials: true,
    })
    return response.data;
}

// Оновити курс
export async function updateCourse(id: string, form: any) {
    const response = await axios.put(`${API_BASE}/admin/course/edit/${id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function deleteCourse(id: string) {
    const response = await axios.delete(`${API_BASE}/admin/course/del/${id}/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function createLessons(courseId: number, form: any) {
    const response = await axios.post(`${API_BASE}/admin/lesson/add/${courseId}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function projectsList() {
    const response = await axios.get(`${API_BASE}/admin/projects/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function projectUpdate(ProjId: number, form: any) {
    const response = await axios.patch(`${API_BASE}/admin/proj/${ProjId}/update/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function projectDelete(ProjId: number) {
    const response = await axios.delete(`${API_BASE}/admin/proj/${ProjId}/del/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function usersList() {
    const response = await axios.get(`${API_BASE}/admin/users/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function adminUpdateUser (user_id: number, form: any) {
    const response = await axios.patch(`${API_BASE}/admin/user/update/${user_id}/`, form, {
        withCredentials: true,
    });
    return response.data;
}

export async function adminDeleteUser (user_id: number) {
    const response = await axios.delete(`${API_BASE}/admin/user/del/${user_id}/`, {
        withCredentials: true,
    });
    return response.data;
}

export async function adminBanUser (user_id: number, reason: string) {
    const response = await axios.post(`${API_BASE}/admin/user/ban/${user_id}/`, { reason }, {
        withCredentials: true,
    });
    return response.data;
}
