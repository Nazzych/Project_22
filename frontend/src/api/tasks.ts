// api/tasks.ts
import axios, { API_BASE } from './../../src/lib/config';


// Отримати завдання.
export async function tasksList() {
    const response = await axios.get(`${API_BASE}/task/chellanges/`);
    return response.data;
}
