import apiClient from "./apiClient";
import type { QuestionDto } from "../types/Question";
import { QUIZ_ENDPOINT } from "../constants/api";

// Types pour Quiz
export interface Quiz {
    quizId: number;
    title: string;
    description?: string;
    courseId?: number;
    createdAt?: string;
    updatedAt?: string;
    questionsCount?: number;
}

export interface QuizCreateDto {
    title: string;
    description?: string;
    courseId?: number;
}

export interface QuizListResponse {
    quizzes: Quiz[];
    totalPages: number;
    page: number;
    limit: number;
    TotalCount: number;
}

// Quiz CRUD operations
export const getQuizList = async function(page: number = 1, limit: number = 10, search?: string): Promise<QuizListResponse> {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
        });
        const response = await apiClient.get<QuizListResponse>(`${QUIZ_ENDPOINT}?${params}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz list', error);
        throw error;
    }
};

export const getQuizById = async function(quizId: number): Promise<Quiz> {
    try {
        const response = await apiClient.get<Quiz>(`${QUIZ_ENDPOINT}/${quizId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching quiz with id ${quizId}`, error);
        throw error;
    }
};

export const createQuiz = async function(quizData: QuizCreateDto): Promise<Quiz> {
    try {
        const response = await apiClient.post<Quiz>(QUIZ_ENDPOINT, quizData);
        return response.data;
    } catch (error) {
        console.error('Error creating quiz', error);
        throw error;
    }
};

export const updateQuiz = async function(quizId: number, quizData: Partial<QuizCreateDto>): Promise<Quiz> {
    try {
        const response = await apiClient.put<Quiz>(`${QUIZ_ENDPOINT}/${quizId}`, quizData);
        return response.data;
    } catch (error) {
        console.error(`Error updating quiz with id ${quizId}`, error);
        throw error;
    }
};

export const deleteQuiz = async function(quizId: number): Promise<void> {
    try {
        await apiClient.delete(`${QUIZ_ENDPOINT}/${quizId}`);
    } catch (error) {
        console.error(`Error deleting quiz with id ${quizId}`, error);
        throw error;
    }
};

export const searchQuiz = async function(query: string): Promise<Quiz[]> {
    try {
        const response = await apiClient.get<Quiz[]>(`${QUIZ_ENDPOINT}/search?q=${query}`);
        return response.data;
    } catch (error) {
        console.error(`Error searching quiz with query '${query}'`, error);
        throw error;
    }
};

// Questions operations
export const getQuizQuestions = async function(quizId: number): Promise<QuestionDto[]> {
    try {
        const response = await apiClient.get<QuestionDto[]>(`${QUIZ_ENDPOINT}/questions/${quizId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching questions for quiz ${quizId}`, error);
        throw error;
    }
};
