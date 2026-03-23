import axios, { API_BASE } from './../../src/lib/config';
import { Project } from '../types/projects';


export async function createProject(data: FormData) {
    const response = await axios.post(`${API_BASE}/project/add/`, data, {
        withCredentials: true,
    });
    return response.data;
}

export async function fetchProjects(scope: 'my' | 'all' = 'all') {
    const response = await axios.get(`${API_BASE}/project/projects/?scope=${scope}`);
    return response.data;
}

export async function getProject(id: number) {
    const response = await axios.get(`${API_BASE}/project/projects/${id}/`);
    return response.data;
}

export async function getTree(id: number) {
    const response = await axios.get(`${API_BASE}/project/${id}/structure/`);
    return response.data;
}

export const getFile = async (id: number, path: string) => {
    try {
        const response = await axios.get(`${API_BASE}/project/${id}/file/?path=${encodeURIComponent(path)}`);
        return response.data.content;
    } catch (err) {
        console.error(err);
        return "✕ Error retrieving file content";
    }
};

export async function updateProject(id: number, data: Partial<Project>) {
    return axios.put(`${API_BASE}/project/projects/${id}/`, data);
}

export async function renameFile(id: number, path: string, value: string) {
    return axios.put(`${API_BASE}/project/projects/${id}/`, {"path": path, "value": value});
}

export async function deleteProject(id: number) {
    return axios.delete(`${API_BASE}/project/projects/${id}/`);
}

export async function updateFile(projectId: number, data: { path: string; content: string }) {
    return axios.put(`${API_BASE}/project/${projectId}/file/update/`, data, {
        withCredentials: true,
    });
}

export async function downloadFile(projectId: number, data: { path: string; content: string }) {
    return axios.post(`${API_BASE}/project/${projectId}/file/download/`, data, {
        withCredentials: true,
    });
}

export async function deleteFile(projectId: number, path: string) {
    return axios.delete(`${API_BASE}/project/${projectId}/file/delete/?path=${encodeURIComponent(path)}`);
}