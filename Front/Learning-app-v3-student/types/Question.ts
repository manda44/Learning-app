export interface QuestionCreateDto {
    quizId: number;
    type: string;
    content: string;
    rank: number;
    explanation?: string;
    questionItems: QuestionItemCreateDto[];
}

export interface QuestionItemCreateDto {
    questionId: number;
    content?: string;
    isRight?: boolean;
    explanation?: string;
    rightResponse?: string;
}

export interface QuestionDto {
    questionId: number;
    quizId: number;
    type: string;
    content: string;
    rank: number;
    exaplanation?: string;
    questionItems?: QuestionItemDto[];
}

export interface QuestionItemDto {
    questionItemId: number;
    questionId: number;
    content?: string;
    isRight?: boolean;
    explanation?: string;
    rightResponse?: string;
}
