import { createRef } from "react";
import type { McqRef } from "../../components/Quiz/Mcq.tsx";
import { createQuestion } from "../../services/questionService";
import type { QuestionCreateDto } from "../../types/Question";
import { useModalStore } from "../../store/modalStore";
import {getQuizQuestions} from "../../services/quizService.ts";
import type {UniqueChoiceRef} from "../../components/Quiz/UniqueChoice.tsx";
import type {OpenResponseRef} from "../../components/Quiz/OpenResponse.tsx";

export function useQuizActions({ state }) {
      const {
            mcqs, setMcqs
      } = state;
      const { showModal } = useModalStore();

      const addMcq = () => {
            const newId = Date.now();
            setMcqs(prev => [...prev, {
                  id: newId,
                  rank: prev.length + 1,
                  ref: createRef<McqRef>(),
                  type: 'MCQ'
            }]);
      };
    const addUniqueChoice = () => {
        const newId = Date.now();
        setMcqs(prev => [...prev, {
            id: newId,
            rank: prev.length + 1,
            ref: createRef<UniqueChoiceRef>(),
            type: 'UNIQUECHOICE'
        }]);
    };

    const addOpenResponse = () => {
        const newId = Date.now();
        setMcqs(prev => [...prev, {
            id: newId,
            rank: prev.length + 1,
            ref: createRef<OpenResponseRef>(),
            type: 'OPENRESPONSE'
        }]);
    };
      
      const getAllData = async () => {
            const allData = mcqs.map(mcq => mcq.ref.current?.getData()).filter(Boolean) as QuestionCreateDto[];
            try {
                  // for (const questionData of allData) {
                        await createQuestion(allData);
                  // }
                  showModal('success', 'Questions créées avec succès');
                  console.log('All questions created successfully');
            } catch (error) {
                  showModal('error', 'Une erreur est survenue lors de la création des questions');
                  console.error('Error creating questions:', error);
                  throw error;
            }
      };

      const FetchQuestions = async (quizId: number) => {
            try {
                  const questions = await getQuizQuestions(quizId);
                  const mcqsWithRefs = questions.map((question) => {
                        let ref;
                        if (question.type === 'MCQ') {
                              ref = createRef<McqRef>();
                        } else if (question.type === 'UniqueChoice') {
                              ref = createRef<UniqueChoiceRef>();
                        } else if (question.type === 'OpenResponse') {
                              ref = createRef<OpenResponseRef>();
                        } else {
                              ref = createRef<McqRef>(); // fallback
                        }
                        return {
                              id: question.questionId,
                              ref: ref,
                              rank: question.rank,
                              type: question.type,
                              data: question // Stocker les données de l'API
                        };
                  });
                  setMcqs(mcqsWithRefs);
            } catch (error) {
                  console.error('Erreur lors du chargement des questions:', error);
            }
      }
    const moveQuestion = (id: number, direction: number) => {
          setMcqs(prev => {
            const index = prev.findIndex(mcq => mcq.id === id);
            if (index === -1) return prev;

            const newIndex = direction > 0 ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;

            // Sauvegarder les données actuelles avant manipulation
            const savedData = prev.map(mcq => ({
                ...mcq,
                currentData: mcq.ref.current?.getData ? (() => {
                    try {
                        return mcq.ref.current.getData();
                    } catch {
                        return mcq.data; // fallback to existing data
                    }
                })() : mcq.data
            }));

            const newMcqs = [...savedData];
            [newMcqs[index], newMcqs[newIndex]] = [newMcqs[newIndex], newMcqs[index]];
            console.log("New Mcqs Order:", newMcqs);
            
            // Update ranks and preserve data
            return newMcqs.map((mcq, i) => ({ 
                ...mcq, 
                rank: i + 1,
                data: mcq.currentData || mcq.data
            }));
        });
    };
    const deleteQuestion = (id: number) => {
        setMcqs(prev => {
            const filtered = prev.filter(mcq => mcq.id !== id);
            // Recalculer les rangs
            return filtered.map((mcq, index) => ({ ...mcq, rank: index + 1 }));
        });
    };
    const duplicateQuestion = (id: number) => {
        setMcqs(prev => {
            const index = prev.findIndex(mcq => mcq.id === id);
            const original = prev[index];
            const newId = Date.now();

            // Récupérer les données actuelles de l'original
            let currentData;
            try {
                currentData = original.ref.current?.getData();
            } catch {
                currentData = original.data; // fallback
            }

            const duplicated = {
                ...original,
                id: newId,
                rank: original.rank + 1,
                ref: createRef(),
                data: currentData || original.data
            };

            return prev
                .map(mcq => mcq.rank > original.rank ? {...mcq, rank: mcq.rank + 1} : mcq)
                .concat(duplicated)
                .sort((a, b) => a.rank - b.rank);
        });
    };
      return {
            addMcq,
            getAllData,
          FetchQuestions,
          addUniqueChoice,
          addOpenResponse,
          moveQuestion,
          deleteQuestion,
          duplicateQuestion
      }

}