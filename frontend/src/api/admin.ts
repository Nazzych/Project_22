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
    const response = await axios.put(`${API_BASE}/admin/task/${id}/`, form, {
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
