import { useState } from 'react';
import { useGeneralStore } from '../../store/generalStore';
import type {Quiz} from "../../services/quizService.ts";
import type {Course} from "../../types/Course.ts";
import {useModalStore} from "../../store/modalStore.tsx";
import type {Chapter} from "../../types/Chapter.ts";

// Mock Data
export const mockCourses = [
    { value: '1', label: 'Mathématiques Avancées', description: 'Cours de mathématiques niveau universitaire' },
    { value: '2', label: 'Physique Quantique', description: 'Introduction à la physique quantique' },
    { value: '3', label: 'Programmation React', description: 'Développement d\'applications React' },
    { value: '4', label: 'Intelligence Artificielle', description: 'Bases de l\'IA et Machine Learning' },
    { value: '5', label: 'Base de Données', description: 'Conception et gestion de bases de données' }
];

export const mockChapters: Record<string, Array<{value: string, label: string}>> = {
    '1': [
        { value: '1', label: 'Chapitre 1: Calcul différentiel' },
        { value: '2', label: 'Chapitre 2: Calcul intégral' },
        { value: '3', label: 'Chapitre 3: Équations différentielles' }
    ],
    '2': [
        { value: '4', label: 'Chapitre 1: Principe de superposition' },
        { value: '5', label: 'Chapitre 2: Équation de Schrödinger' },
        { value: '6', label: 'Chapitre 3: Observables quantiques' }
    ],
    '3': [
        { value: '7', label: 'Chapitre 1: Composants et JSX' },
        { value: '8', label: 'Chapitre 2: State et Props' },
        { value: '9', label: 'Chapitre 3: Hooks avancés' }
    ],
    '4': [
        { value: '10', label: 'Chapitre 1: Réseaux de neurones' },
        { value: '11', label: 'Chapitre 2: Apprentissage supervisé' },
        { value: '12', label: 'Chapitre 3: Deep Learning' }
    ],
    '5': [
        { value: '13', label: 'Chapitre 1: Modèle relationnel' },
        { value: '14', label: 'Chapitre 2: SQL avancé' },
        { value: '15', label: 'Chapitre 3: Optimisation' }
    ]
};

// Extended Quiz interface
export interface ExtendedQuiz {
    quizId: number;
    title: string;
    description?: string;
    courseId?: number;
    chapterId?: number;
    successPercentage: number;
    createdAt?: string;
    updatedAt?: string;
    questionsCount?: number;
}

export interface ExtendedQuizCreateDto {
    title: string;
    description?: string;
    courseId?: number;
    chapterId?: number;
    successPercentage: number;
}

export function useQuizPageStates() {
    // Mock Data pour les quiz
    const mockQuizzes: Quiz[] = [
    ];

    // États
    const [quizzes, setQuizzes] = useState<Quiz[]>(mockQuizzes);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState<ExtendedQuiz | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [availableChapters, setAvailableChapters] = useState<Array<{value: string, label: string}>>([]);
    const [activeStep, setActiveStep] = useState(0);
    const [courseList,setCourseList] = useState<Course[]>([]);
    const {showModal: showStatusModal} = useModalStore();
    const [chapterList,setChapterList] = useState<Chapter[]>([]);


    // Store
    const setBreadCrumb = useGeneralStore(state => state.setBreadCrumb);

    // Breadcrumbs
    const breadcrumbs = [
        { title: 'Tableau de bord', href: '/' },
        { title: 'Quiz', href: '/quiz' }
    ];

    return {
        // États
        quizzes,
        setQuizzes,
        loading,
        setLoading,
        page,
        setPage,
        totalPages,
        setTotalPages,
        search,
        setSearch,
        selectedQuiz,
        setSelectedQuiz,
        isUpdating,
        setIsUpdating,
        selectedCourse,
        setSelectedCourse,
        availableChapters,
        setAvailableChapters,
        activeStep,
        setActiveStep,
        courseList,
        setCourseList,
        chapterList,
        setChapterList,
        
        // Store
        setBreadCrumb,
        breadcrumbs,
        showStatusModal,
        
        // Mock Data
        mockQuizzes,
        mockCourses,
        mockChapters
    };
}
