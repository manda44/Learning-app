import { useState, useEffect } from 'react';
import { Container, Box, Button, Title, Text, Loader, Center, Alert, Group, Stack, Paper, Radio, Checkbox, Textarea } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import { codeBlock } from '@blocknote/code-block';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import quizService, { type Question, type QuestionItem } from '../services/quizService';

// Component to render a single option/answer choice
function OptionItem({
  item,
  isChecked,
  onChange,
  isMultipleChoice = true
}: {
  item: QuestionItem;
  isChecked: boolean;
  onChange: () => void;
  isMultipleChoice?: boolean;
}) {
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
    <Group justify="flex-start" align="flex-start" mb="sm">
      {isMultipleChoice ? (
        <Checkbox
          checked={isChecked}
          onChange={onChange}
          mr="md"
          size="md"
          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
        />
      ) : (
        <Radio
          checked={isChecked}
          onChange={onChange}
          mr="md"
          size="md"
          style={{ alignSelf: 'flex-start', marginTop: '8px' }}
        />
      )}
      <Box
        flex={1}
        style={{
          border: '1px solid #dee2e6',
          borderLeft: '4px solid #28a745',
          borderRadius: '4px',
          backgroundColor: '#fafafa',
        }}
        p="md"
      >
        <Box p="xl" style={{ userSelect: 'text', pointerEvents: 'none' }}>
          <style>{`
            .bn-editor {
              user-select: text !important;
              -webkit-user-select: text !important;
              pointer-events: none !important;
            }
            .bn-editor .bn-toolbar,
            .bn-editor .bn-side-menu,
            .bn-editor .bn-slash-menu,
            .bn-editor [role="toolbar"] {
              display: none !important;
            }
            .bn-code-block {
              background-color: #282c34 !important;
              border: 1px solid #3e4451 !important;
              border-radius: 6px !important;
              font-family: 'Monaco', 'Menlo', 'Courier New', monospace !important;
              font-size: 13px !important;
              line-height: 1.5 !important;
              color: #abb2bf !important;
              margin: 12px 0 !important;
              overflow-x: auto !important;
              user-select: text !important;
              -webkit-user-select: text !important;
            }
            .hljs-string { color: #98c379; }
            .hljs-number { color: #d19a66; }
            .hljs-literal { color: #56b6c2; }
            .hljs-attr { color: #e06c75; }
            .hljs-title { color: #61afef; }
            .hljs-keyword { color: #c678dd; }
            .hljs-built_in { color: #61afef; }
            .hljs-comment { color: #5c6370; font-style: italic; }
            .hljs-name { color: #e06c75; }
            .hljs-tag { color: #e06c75; }
            .hljs-variable { color: #e06c75; }
            .bn-block,
            .bn-inline-content,
            .bn-editor * {
              user-select: text !important;
              -webkit-user-select: text !important;
            }
            .bn-editor {
              caret-color: transparent !important;
            }
            .bn-editor [contenteditable] {
              caret-color: transparent !important;
              cursor: default !important;
            }
            ::-webkit-spelling-error-background {
              background: transparent !important;
              text-decoration: none !important;
            }
            .bn-block:focus,
            .bn-inline-content:focus {
              outline: none !important;
              caret-color: transparent !important;
            }
            [contenteditable="false"] {
              caret-color: transparent !important;
              cursor: default !important;
            }
            [contenteditable="false"]::selection {
              background: rgba(0, 0, 0, 0.1) !important;
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
      </Box>
    </Group>
  );
}

export function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quizId } = useParams<{ quizId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);

  // Create read-only editor for question content
  const questionEditor = useCreateBlockNote({
    initialContent: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
    codeBlock,
  });

  // Fetch quiz questions (no quiz attempt created until submission)
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!quizId) {
          throw new Error('Quiz ID is required');
        }

        // Use static student ID for now
        const studentId = 1;

        // Check if user explicitly wants to start a new attempt
        const forceNewAttempt = location.state?.forceNewAttempt;

        // Check if there's a PASSED attempt (only redirect for passed quizzes)
        // Failed quizzes should allow retry without redirection
        const previousAttempts = await quizService.getStudentQuizAttempts(studentId, parseInt(quizId));
        const passedAttempt = previousAttempts
          .filter(a => a.status === 'passed')
          .sort((a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime())[0];

        // Only redirect if there's a passed attempt AND user didn't explicitly ask for a new attempt
        if (passedAttempt && !forceNewAttempt) {
          // Redirect to the passed attempt results (unless forcing new to improve score)
          navigate(`/quiz/${quizId}/results/${passedAttempt.quizAttemptId}`, { replace: true });
          return;
        }

        // Clear the forceNewAttempt state after using it
        if (forceNewAttempt) {
          navigate(location.pathname, { replace: true, state: {} });
        }

        // Fetch questions
        const data = await quizService.getQuizQuestions(parseInt(quizId));
        setQuestions(data);

        // Initialize answers object
        const initialAnswers: { [questionId: number]: any } = {};
        data.forEach((q) => {
          // Initialize MCQ with empty array, others with null
          if (q.type === 'MCQ' || q.type === 'multiple_choice') {
            initialAnswers[q.questionId] = [];
          } else {
            initialAnswers[q.questionId] = null;
          }
        });
        setAnswers(initialAnswers);

        // Set start time for duration tracking
        setStartTime(Date.now());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [quizId, navigate, location]);

  // Update editor content when current question changes
  useEffect(() => {
    if (questions.length > 0 && questionEditor) {
      try {
        const currentQuestion = questions[currentQuestionIndex];
        let blockNoteBlocks: any[] = [];

        if (currentQuestion.content) {
          try {
            const parsedData = JSON.parse(currentQuestion.content);
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
              content: [{ type: 'text', text: currentQuestion.content }],
            });
          }
        }

        if (blockNoteBlocks.length > 0) {
          questionEditor.replaceBlocks(questionEditor.document, blockNoteBlocks as any);
        }
      } catch (err) {
        console.error('Error parsing question content:', err);
      }
    }
  }, [currentQuestionIndex, questions, questionEditor]);

  // Disable editing on the editor
  useEffect(() => {
    if (questionEditor) {
      questionEditor.isEditable = false;
    }
  }, [questionEditor]);

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

  if (questions.length === 0) {
    return (
      <Container py="xl">
        <Alert color="blue" title="Aucune question">
          Ce quiz n'a pas de questions pour le moment.
        </Alert>
        <Button mt="md" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasNextQuestion = currentQuestionIndex < questions.length - 1;
  const hasPreviousQuestion = currentQuestionIndex > 0;

  const handleAnswerChange = (value: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.questionId]: value,
    });
  };

  const handleSubmitQuiz = async () => {
    try {
      setSubmitting(true);
      setError(null);

      if (!quizId) {
        throw new Error('Quiz ID is required');
      }

      // Use static student ID for now
      const studentId = 1;

      // Calculate time spent in seconds
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

      // Format answers for submission
      const formattedAnswers = questions.map((question) => {
        const answer = answers[question.questionId];
        const questionType = question.type?.toUpperCase() || '';

        if (questionType === 'MCQ' || questionType === 'MULTIPLE_CHOICE') {
          return {
            questionId: question.questionId,
            questionItemIds: Array.isArray(answer) ? answer : [],
            responseContent: undefined,
          };
        } else if (questionType === 'UNIQUECHOICE' || questionType === 'TRUE_FALSE') {
          return {
            questionId: question.questionId,
            questionItemIds: answer ? [answer] : [],
            responseContent: undefined,
          };
        } else if (questionType === 'OPENRESPONSE' || questionType === 'SHORT_ANSWER') {
          return {
            questionId: question.questionId,
            questionItemIds: undefined,
            responseContent: answer || '',
          };
        }

        return {
          questionId: question.questionId,
          questionItemIds: [],
          responseContent: '',
        };
      });

      // Create quiz attempt and submit in one call
      const result = await quizService.submitQuizAttempt(
        studentId,
        parseInt(quizId),
        formattedAnswers,
        timeSpentSeconds
      );

      // Navigate to results page
      navigate(`/quiz/${quizId}/results/${result.quizAttemptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const allQuestionsAnswered = () => {
    return questions.every((question) => {
      const answer = answers[question.questionId];
      const questionType = question.type?.toUpperCase() || '';

      if (questionType === 'MCQ' || questionType === 'MULTIPLE_CHOICE') {
        return Array.isArray(answer) && answer.length > 0;
      } else if (questionType === 'UNIQUECHOICE' || questionType === 'TRUE_FALSE') {
        return answer !== null && answer !== undefined;
      } else if (questionType === 'OPENRESPONSE' || questionType === 'SHORT_ANSWER') {
        return answer && answer.trim().length > 0;
      }

      return false;
    });
  };

  const renderQuestionContent = () => {
    return (
      <Paper p="lg" mb="lg" style={{ backgroundColor: '#fafafa' }}>
        <Text fw={500} mb="md">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </Text>
        <Box p="xl" style={{ userSelect: 'text', pointerEvents: 'none' }}>
          <style>{`
            .bn-editor {
              user-select: text !important;
              -webkit-user-select: text !important;
              pointer-events: none !important;
            }
            .bn-editor .bn-toolbar,
            .bn-editor .bn-side-menu,
            .bn-editor .bn-slash-menu,
            .bn-editor [role="toolbar"] {
              display: none !important;
            }
            .bn-code-block {
              background-color: #282c34 !important;
              border: 1px solid #3e4451 !important;
              border-radius: 6px !important;
              font-family: 'Monaco', 'Menlo', 'Courier New', monospace !important;
              font-size: 13px !important;
              line-height: 1.5 !important;
              color: #abb2bf !important;
              margin: 12px 0 !important;
              overflow-x: auto !important;
              user-select: text !important;
              -webkit-user-select: text !important;
            }
            .hljs-string { color: #98c379; }
            .hljs-number { color: #d19a66; }
            .hljs-literal { color: #56b6c2; }
            .hljs-attr { color: #e06c75; }
            .hljs-title { color: #61afef; }
            .hljs-keyword { color: #c678dd; }
            .hljs-built_in { color: #61afef; }
            .hljs-comment { color: #5c6370; font-style: italic; }
            .hljs-name { color: #e06c75; }
            .hljs-tag { color: #e06c75; }
            .hljs-variable { color: #e06c75; }
            .bn-block,
            .bn-inline-content,
            .bn-editor * {
              user-select: text !important;
              -webkit-user-select: text !important;
            }
            .bn-editor {
              caret-color: transparent !important;
            }
            .bn-editor [contenteditable] {
              caret-color: transparent !important;
              cursor: default !important;
            }
            ::-webkit-spelling-error-background {
              background: transparent !important;
              text-decoration: none !important;
            }
            .bn-block:focus,
            .bn-inline-content:focus {
              outline: none !important;
              caret-color: transparent !important;
            }
            [contenteditable="false"] {
              caret-color: transparent !important;
              cursor: default !important;
            }
            [contenteditable="false"]::selection {
              background: rgba(0, 0, 0, 0.1) !important;
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
      </Paper>
    );
  };

  const renderAnswerOptions = () => {
    // Handle different question types from backend (MCQ, UNIQUECHOICE, OPENRESPONSE)
    const questionType = currentQuestion.type?.toUpperCase() || '';

    if (questionType === 'MCQ' || questionType === 'MULTIPLE_CHOICE') {
      return (
        <Stack gap="md" mb="lg">
          {currentQuestion.questionItems && currentQuestion.questionItems.length > 0 ? (
            currentQuestion.questionItems.map((item: QuestionItem) => (
              <OptionItem
                key={item.questionItemId}
                item={item}
                isChecked={Array.isArray(answers[currentQuestion.questionId]) && answers[currentQuestion.questionId].includes(item.questionItemId)}
                onChange={() => {
                  const currentAnswers = Array.isArray(answers[currentQuestion.questionId]) ? answers[currentQuestion.questionId] : [];
                  if (currentAnswers.includes(item.questionItemId)) {
                    handleAnswerChange(currentAnswers.filter((id: number) => id !== item.questionItemId));
                  } else {
                    handleAnswerChange([...currentAnswers, item.questionItemId]);
                  }
                }}
                isMultipleChoice={true}
              />
            ))
          ) : (
            <Alert color="yellow" title="Aucune option">
              Aucune option de réponse disponible pour cette question.
            </Alert>
          )}
        </Stack>
      );
    } else if (questionType === 'UNIQUECHOICE' || questionType === 'TRUE_FALSE') {
      return (
        <Stack gap="md" mb="lg">
          {currentQuestion.questionItems && currentQuestion.questionItems.length > 0 ? (
            currentQuestion.questionItems.map((item: QuestionItem) => (
              <OptionItem
                key={item.questionItemId}
                item={item}
                isChecked={answers[currentQuestion.questionId] === item.questionItemId}
                onChange={() => {
                  handleAnswerChange(item.questionItemId);
                }}
                isMultipleChoice={false}
              />
            ))
          ) : (
            <Alert color="yellow" title="Aucune option">
              Aucune option de réponse disponible pour cette question.
            </Alert>
          )}
        </Stack>
      );
    } else if (questionType === 'OPENRESPONSE' || questionType === 'SHORT_ANSWER') {
      return (
        <Textarea
          label="Votre réponse"
          placeholder="Entrez votre réponse ici..."
          minRows={4}
          value={answers[currentQuestion.questionId] || ''}
          onChange={(e) => handleAnswerChange(e.currentTarget.value)}
          mb="lg"
        />
      );
    }

    // Fallback for unknown type
    return (
      <Alert color="red" title="Type de question inconnu">
        Type de question non supporté: {currentQuestion.type}
      </Alert>
    );
  };

  return (
    <Container py="xl" size="lg">
      <Stack gap="xl">
        <Box>
          <Group justify="space-between" align="center" mb="lg">
            <Title order={2}>Quiz</Title>
            <Text c="dimmed" size="sm">
              Question {currentQuestionIndex + 1} / {questions.length}
            </Text>
          </Group>
        </Box>

        {renderQuestionContent()}

        <Box>
          <Text fw={500} mb="md">
            Votre réponse:
          </Text>
          {renderAnswerOptions()}
        </Box>

        {/* Navigation Buttons */}
        <Group justify="space-between" mt="xl" pt="xl" style={{ borderTop: '1px solid #e0e0e0' }}>
          <Button
            variant="default"
            leftSection={<IconChevronLeft size={16} />}
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={!hasPreviousQuestion || submitting}
          >
            Précédente
          </Button>

          <Group gap="xs">
            <Button variant="default" color="gray" onClick={() => navigate(-1)} disabled={submitting}>
              Fermer le quiz
            </Button>
            {allQuestionsAnswered() && (
              <Button
                color="green"
                onClick={handleSubmitQuiz}
                loading={submitting}
              >
                Soumettre le quiz
              </Button>
            )}
          </Group>

          <Button
            rightSection={<IconChevronRight size={16} />}
            onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
            disabled={!hasNextQuestion || submitting}
          >
            Suivante
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}

export default Quiz;
