import apiClient from "./apiClient";
import type { QuestionCreateDto, QuestionDto } from "../types/Question";
import { QUIZ_ENDPOINT } from "../constants/api";

export const createQuestion = async function(questionData: QuestionCreateDto[]): Promise<QuestionDto> {
    try {
        const response = await apiClient.post<QuestionDto>(`${QUIZ_ENDPOINT}/question`, questionData);
        return response.data;
    } catch (error) {
        console.error('Error creating question', error);
        throw error;
    }
};

export const getQuestionById = async function(questionId: number): Promise<QuestionDto> {
    try {
        const response = await apiClient.get<QuestionDto>(`${QUIZ_ENDPOINT}/question/${questionId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching question with id ${questionId}`, error);
        throw error;
    }
};

export const getQuestionsByQuizId = async function(quizId: number): Promise<QuestionDto[]> {
    try {
        const response = await apiClient.get<QuestionDto[]>(`${QUIZ_ENDPOINT}/${quizId}/questions`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching questions for quiz ${quizId}`, error);
        throw error;
    }
};

export const updateQuestion = async function(questionId: number, questionData: Partial<QuestionCreateDto>): Promise<QuestionDto> {
    try {
        const response = await apiClient.put<QuestionDto>(`${QUIZ_ENDPOINT}/question/${questionId}`, questionData);
        return response.data;
    } catch (error) {
        console.error(`Error updating question with id ${questionId}`, error);
        throw error;
    }
};

export const deleteQuestion = async function(questionId: number): Promise<void> {
    try {
        await apiClient.delete(`${QUIZ_ENDPOINT}/question/${questionId}`);
    } catch (error) {
        console.error(`Error deleting question with id ${questionId}`, error);
        throw error;
    }
};
