// api/tasks.ts
import axios, { API_BASE } from './../../src/lib/config';


// Отримати завдання.
export async function tasksList() {
    const response = await axios.get(`${API_BASE}/task/challenges/`);
    return response.data;
}

// Отримати конкретне завдання.
export async function getChallenge(challengeId: number) {
    const response = await axios.get(`${API_BASE}/task/challenge/${challengeId}/`);
    return response.data;
}

// Завершити завдання (для квізових завдань).
export async function submitQuiz(challengeId: number, answers: Record<number, number>) {
    const response = await axios.post(`${API_BASE}/task/challenge/${challengeId}/submit_quiz/`, { answers: answers });
    return response.data;
}