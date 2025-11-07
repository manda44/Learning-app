import { useState, useEffect } from 'react';
import { Container, Box, Button, Title, Text, Loader, Center, Alert, Group, Stack, Paper, Progress, Badge } from '@mantine/core';
import { IconCheck, IconX, IconClock, IconTrophy, IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { codeBlock } from '@blocknote/code-block';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import quizService, { type Question, type QuestionItem, type StudentQuizAttempt, type StudentQuestionResponse } from '../services/quizService';
import courseService from '../services/courseService';
import chapterProgressService, { type ChapterWithLockStatus } from '../services/chapterProgressService';

interface QuestionResult {
  question: Question;
  response: StudentQuestionResponse[];
  isCorrect: boolean | null;
}

export function QuizResults() {
  const navigate = useNavigate();
  const { quizId, attemptId } = useParams<{ quizId: string; attemptId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState<StudentQuizAttempt | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [courseId, setCourseId] = useState<number | null>(null);
  const [nextChapter, setNextChapter] = useState<ChapterWithLockStatus | null>(null);

  // Fetch quiz attempt results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!attemptId || !quizId) {
          throw new Error('Attempt ID and Quiz ID are required');
        }

        // Fetch attempt with responses
        const attemptData = await quizService.getQuizAttemptWithResults(parseInt(attemptId));
        setAttempt(attemptData);

        // Fetch quiz details to get chapterId
        const quizDetails = await quizService.getQuizDetails(parseInt(quizId));

        // Fetch chapter details to get courseId
        const chapterDetails = await courseService.getChapterDetails(quizDetails.chapterId);
        setCourseId(chapterDetails.courseId);

        // Fetch all chapters to find the next one
        const studentId = 1; // Static student ID for now

        // Check if current quiz was passed based on the attempt data we already have
        const currentQuizPassed = attemptData.status === 'passed';
        console.log('Current quiz passed (from attempt):', currentQuizPassed);

        const allChapters = await chapterProgressService.getChaptersWithLockStatus(chapterDetails.courseId, studentId);
        console.log('All chapters after quiz:', allChapters);
        const currentChapterIndex = allChapters.findIndex(c => c.chapterId === quizDetails.chapterId);
        console.log('Current chapter index:', currentChapterIndex);
        console.log('Current chapter:', allChapters[currentChapterIndex]);

        if (currentChapterIndex >= 0 && currentChapterIndex < allChapters.length - 1) {
          const nextChap = allChapters[currentChapterIndex + 1];
          console.log('Next chapter found:', nextChap);
          console.log('Next chapter locked (before override)?', nextChap.isLocked);

          // If we just passed the quiz, the next chapter should be unlocked
          // Override the backend's lock status since it might not be updated yet
          if (currentQuizPassed) {
            nextChap.isLocked = false;
            console.log('Overriding lock status because quiz was passed');
          }

          console.log('Next chapter locked (after override)?', nextChap.isLocked);
          setNextChapter(nextChap);
        } else {
          console.log('No next chapter available');
        }

        // Fetch questions
        const questionsData = await quizService.getQuizQuestions(parseInt(quizId));

        // Build question results
        const results: QuestionResult[] = questionsData.map((question) => {
          const responses = attemptData.studentQuestionResponses.filter(
            (r) => r.questionId === question.questionId
          );

          // Determine if the question was answered correctly
          let isCorrect: boolean | null = null;
          if (responses.length > 0) {
            // For open response questions, isCorrect might be null (requires manual grading)
            const firstResponse = responses[0];
            if (firstResponse.isCorrect !== null) {
              isCorrect = responses.every((r) => r.isCorrect === true);
            }
          }

          return {
            question,
            response: responses,
            isCorrect,
          };
        });

        setQuestionResults(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [attemptId, quizId]);

  if (loading) {
    return (
      <Center py="xl" style={{ height: 'calc(100vh - 100px)' }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Button mt="md" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Container>
    );
  }

  if (!attempt) {
    return (
      <Container py="xl">
        <Alert color="blue" title="Aucun résultat">
          Aucun résultat trouvé pour cette tentative.
        </Alert>
        <Button mt="md" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Container>
    );
  }

  const isPassed = attempt.status === 'passed';
  const timeSpentMinutes = attempt.timeSpentSeconds ? Math.floor(attempt.timeSpentSeconds / 60) : 0;
  const timeSpentSeconds = attempt.timeSpentSeconds ? attempt.timeSpentSeconds % 60 : 0;

  const correctAnswersCount = questionResults.filter((r) => r.isCorrect === true).length;
  const totalAutoGradedQuestions = questionResults.filter((r) => r.isCorrect !== null).length;

  // Debug logging
  console.log('Quiz Results Debug:', {
    isPassed,
    nextChapter,
    nextChapterLocked: nextChapter?.isLocked,
    shouldShowButton: isPassed && nextChapter && !nextChapter.isLocked
  });

  return (
    <Container py="xl" size="lg">
      <Stack gap="xl">
        {/* Header */}
        <Box>
          <Group justify="space-between" align="center" mb="lg">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => {
                // Navigate back with state to force refresh
                if (courseId) {
                  navigate(`/courses/${courseId}`, { state: { refresh: true } });
                } else {
                  navigate(`/courses`);
                }
              }}
            >
              Retour au cours
            </Button>
            <Title order={2}>Résultats du Quiz</Title>
          </Group>
        </Box>

        {/* Score Summary */}
        <Paper p="xl" radius="md" style={{ backgroundColor: isPassed ? '#d4f4dd' : '#ffe0e0' }}>
          <Stack gap="lg">
            <Group justify="space-between" align="center">
              <Group gap="md">
                <IconTrophy size={48} color={isPassed ? 'green' : 'red'} />
                <Box>
                  <Title order={3}>{isPassed ? 'Félicitations !' : 'Quiz échoué'}</Title>
                  <Text c="dimmed">
                    {isPassed
                      ? 'Vous avez réussi ce quiz avec succès!'
                      : 'Vous pouvez réessayer pour améliorer votre score.'}
                  </Text>
                </Box>
              </Group>
              <Badge size="xl" color={isPassed ? 'green' : 'red'}>
                {attempt.score ?? 0}%
              </Badge>
            </Group>

            <Progress value={attempt.score ?? 0} color={isPassed ? 'green' : 'red'} size="xl" />

            <Group justify="space-around">
              <Box style={{ textAlign: 'center' }}>
                <Text size="sm" c="dimmed">
                  Réponses correctes
                </Text>
                <Text size="xl" fw={700}>
                  {correctAnswersCount} / {totalAutoGradedQuestions}
                </Text>
              </Box>

              <Box style={{ textAlign: 'center' }}>
                <Group gap="xs" justify="center">
                  <IconClock size={20} />
                  <Text size="sm" c="dimmed">
                    Temps écoulé
                  </Text>
                </Group>
                <Text size="xl" fw={700}>
                  {timeSpentMinutes}:{timeSpentSeconds.toString().padStart(2, '0')}
                </Text>
              </Box>

              <Box style={{ textAlign: 'center' }}>
                <Text size="sm" c="dimmed">
                  Tentative
                </Text>
                <Text size="xl" fw={700}>
                  #{attempt.attemptNumber}
                </Text>
              </Box>
            </Group>
          </Stack>
        </Paper>

        {/* Question by Question Results */}
        <Box>
          <Title order={3} mb="md">
            Détails par question
          </Title>
          <Stack gap="md">
            {questionResults.map((result, index) => (
              <QuestionResultCard key={result.question.questionId} result={result} index={index} />
            ))}
          </Stack>
        </Box>

        {/* Actions */}
        <Group justify="center" mt="xl">
          <Button variant="default" onClick={() => {
            // Navigate back with state to force refresh
            if (courseId) {
              navigate(`/courses/${courseId}`, { state: { refresh: true } });
            } else {
              navigate(`/courses`);
            }
          }}>
            Retour au cours
          </Button>

          {/* Show next chapter button if quiz is passed and there's a next chapter */}
          {isPassed && nextChapter && !nextChapter.isLocked && (
            <Button
              color="green"
              onClick={() => {
                if (courseId) {
                  navigate(`/courses/${courseId}`, { state: { selectChapterId: nextChapter.chapterId } });
                }
              }}
              rightSection={<IconChevronRight size={16} />}
            >
              Chapitre suivant
            </Button>
          )}

          {/* Show retry button only if score is not 100% */}
          {(!isPassed || (attempt?.score && attempt.score < 100)) && (
            <Button onClick={() => {
              // Force a new attempt by navigating with state to bypass the redirect
              navigate(`/quiz/${quizId}`, { state: { forceNewAttempt: true } });
            }}>
              {isPassed ? 'Améliorer votre score' : 'Réessayer le quiz'}
            </Button>
          )}
        </Group>
      </Stack>
    </Container>
  );
}

// Component to display individual question result
function QuestionResultCard({ result, index }: { result: QuestionResult; index: number }) {
  const questionEditor = useCreateBlockNote({
    initialContent: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
    codeBlock,
  });

  useEffect(() => {
    if (result.question.content && questionEditor) {
      try {
        let blockNoteBlocks: any[] = [];
        try {
          const parsedData = JSON.parse(result.question.content);
          if (Array.isArray(parsedData)) {
            blockNoteBlocks = parsedData;
          } else if (parsedData && typeof parsedData === 'object' && parsedData.type) {
            blockNoteBlocks.push(parsedData);
          } else if (typeof parsedData === 'string') {
            blockNoteBlocks.push({
              type: 'paragraph',
              content: [{ type: 'text', text: parsedData }],
            });
          }
        } catch {
          blockNoteBlocks.push({
            type: 'paragraph',
            content: [{ type: 'text', text: result.question.content }],
          });
        }

        if (blockNoteBlocks.length > 0) {
          questionEditor.replaceBlocks(questionEditor.document, blockNoteBlocks as any);
        }
      } catch (err) {
        console.error('Error parsing question content:', err);
      }
    }
  }, [result.question.content, questionEditor]);

  // Disable editing on the question editor
  useEffect(() => {
    if (questionEditor) {
      questionEditor.isEditable = false;
    }
  }, [questionEditor]);

  const getStatusColor = () => {
    if (result.isCorrect === null) return 'gray';
    return result.isCorrect ? 'green' : 'red';
  };

  const getStatusIcon = () => {
    if (result.isCorrect === null) return null;
    return result.isCorrect ? <IconCheck size={24} /> : <IconX size={24} />;
  };

  const getStatusText = () => {
    if (result.isCorrect === null) return 'En attente de correction';
    return result.isCorrect ? 'Correct' : 'Incorrect';
  };

  const questionType = result.question.type?.toUpperCase() || '';

  return (
    <Paper p="lg" radius="md" style={{ borderLeft: `4px solid var(--mantine-color-${getStatusColor()}-6)` }}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Box flex={1}>
            <Group gap="xs" mb="sm">
              <Badge color={getStatusColor()} leftSection={getStatusIcon()}>
                Question {index + 1}
              </Badge>
              <Badge variant="light">{result.question.type}</Badge>
              <Text fw={600} c={getStatusColor()}>
                {getStatusText()}
              </Text>
            </Group>

            {/* Question Content */}
            <Box style={{ userSelect: 'text', pointerEvents: 'none' }}>
              <style>{`
                .bn-editor {
                  user-select: text !important;
                  pointer-events: none !important;
                }
                .bn-editor .bn-toolbar,
                .bn-editor .bn-side-menu,
                .bn-editor .bn-slash-menu,
                .bn-editor [role="toolbar"] {
                  display: none !important;
                }
                .bn-editor [contenteditable] {
                  caret-color: transparent !important;
                  cursor: default !important;
                }
                [contenteditable="false"] {
                  caret-color: transparent !important;
                  cursor: default !important;
                }
              `}</style>
              <BlockNoteView
                editor={questionEditor}
                theme="light"
                sideMenu={false}
                slashMenu={false}
                formattingToolbar={false}
                linkToolbar={false}
                editable={false}
              />
            </Box>
          </Box>
        </Group>

        {/* Show selected answers for MCQ/UNIQUECHOICE */}
        {(questionType === 'MCQ' || questionType === 'UNIQUECHOICE') && (
          <Box>
            <Text fw={600} size="sm" mb="xs">
              Votre réponse:
            </Text>
            <Stack gap="xs">
              {result.question.questionItems?.map((item) => {
                const isSelected = result.response.some((r) => r.questionItemId === item.questionItemId);
                const isCorrectAnswer = item.isRight;

                return (
                  <Paper
                    key={item.questionItemId}
                    p="sm"
                    style={{
                      backgroundColor: isSelected
                        ? isCorrectAnswer
                          ? '#d4f4dd'
                          : '#ffe0e0'
                        : isCorrectAnswer
                        ? '#fff3cd'
                        : '#f8f9fa',
                      border: `1px solid ${
                        isSelected
                          ? isCorrectAnswer
                            ? 'green'
                            : 'red'
                          : isCorrectAnswer
                          ? 'orange'
                          : '#dee2e6'
                      }`,
                    }}
                  >
                    <Group justify="space-between">
                      <OptionContent item={item} />
                      <Group gap="xs">
                        {isSelected && (
                          <Badge color={isCorrectAnswer ? 'green' : 'red'}>
                            Votre choix
                          </Badge>
                        )}
                        {isCorrectAnswer && (
                          <Badge color="green">
                            Bonne réponse
                          </Badge>
                        )}
                      </Group>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Show open response */}
        {questionType === 'OPENRESPONSE' && (
          <Box>
            <Text fw={600} size="sm" mb="xs">
              Votre réponse:
            </Text>
            <Paper
              p="md"
              style={{
                backgroundColor: result.isCorrect === true ? '#d4f4dd' : result.isCorrect === false ? '#ffe0e0' : '#f8f9fa',
                border: `1px solid ${result.isCorrect === true ? 'green' : result.isCorrect === false ? 'red' : '#dee2e6'}`
              }}
            >
              <Text>{result.response[0]?.responseContent || 'Aucune réponse fournie'}</Text>
            </Paper>
          </Box>
        )}

        {/* Show explanation if available */}
        {result.question.explanation && (
          <Box mt="md">
            <Alert color="blue" title="Explication">
              <Text size="sm">{result.question.explanation}</Text>
            </Alert>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

// Component to render option content with BlockNote
function OptionContent({ item }: { item: QuestionItem }) {
  const optionEditor = useCreateBlockNote({
    initialContent: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
    codeBlock,
  });

  useEffect(() => {
    if (item.content && optionEditor) {
      try {
        let blockNoteBlocks: any[] = [];
        try {
          const parsedData = JSON.parse(item.content);
          if (Array.isArray(parsedData)) {
            blockNoteBlocks = parsedData;
          } else if (parsedData && typeof parsedData === 'object' && parsedData.type) {
            blockNoteBlocks.push(parsedData);
          } else if (typeof parsedData === 'string') {
            blockNoteBlocks.push({
              type: 'paragraph',
              content: [{ type: 'text', text: parsedData }],
            });
          }
        } catch {
          blockNoteBlocks.push({
            type: 'paragraph',
            content: [{ type: 'text', text: item.content }],
          });
        }

        if (blockNoteBlocks.length > 0) {
          optionEditor.replaceBlocks(optionEditor.document, blockNoteBlocks as any);
        }
      } catch (err) {
        console.error('Error parsing option content:', err);
      }
    }
  }, [item.content, optionEditor]);

  // Disable editing on the option editor
  useEffect(() => {
    if (optionEditor) {
      optionEditor.isEditable = false;
    }
  }, [optionEditor]);

  return (
    <Box style={{ userSelect: 'text', pointerEvents: 'none' }}>
      <style>{`
        .bn-editor {
          user-select: text !important;
          pointer-events: none !important;
        }
        .bn-editor .bn-toolbar,
        .bn-editor .bn-side-menu,
        .bn-editor .bn-slash-menu,
        .bn-editor [role="toolbar"] {
          display: none !important;
        }
        .bn-editor [contenteditable] {
          caret-color: transparent !important;
          cursor: default !important;
        }
        [contenteditable="false"] {
          caret-color: transparent !important;
          cursor: default !important;
        }
      `}</style>
      <BlockNoteView
        editor={optionEditor}
        theme="light"
        sideMenu={false}
        slashMenu={false}
        formattingToolbar={false}
        linkToolbar={false}
        editable={false}
      />
    </Box>
  );
}

export default QuizResults;
