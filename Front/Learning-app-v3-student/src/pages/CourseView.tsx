import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Button, Title, Text, Loader, Center, Alert, Badge, Progress, Group, Stack, Paper, Grid, ScrollArea } from '@mantine/core';
import { IconChevronRight, IconLock, IconCheck, IconFileText } from '@tabler/icons-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { codeBlock } from '@blocknote/code-block';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import courseService from '../services/courseService';
import type { ChapterDetail } from '../services/courseService';
import chapterProgressService, { type ChapterWithLockStatus } from '../services/chapterProgressService';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export function CourseView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId } = useParams<{ courseId: string }>();
  const [chapters, setChapters] = useState<ChapterWithLockStatus[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [chapterDetail, setChapterDetail] = useState<ChapterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = 1; // Static student ID for now

  // Create read-only editor for displaying chapter content
  // BlockNote requires at least one block in initialContent
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: 'paragraph',
        content: [],
      },
    ],
    codeBlock,
  });

  // Function to fetch chapters (reusable, memoized)
  const fetchChapters = useCallback(async () => {
    try {
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      // Fetch chapters with lock status
      const chaptersData = await chapterProgressService.getChaptersWithLockStatus(parseInt(courseId), studentId);
      setChapters(chaptersData);

      // Select first unlocked chapter by default if no chapter is selected
      if (!selectedChapterId) {
        const firstUnlocked = chaptersData.find(c => !c.isLocked);
        if (firstUnlocked) {
          setSelectedChapterId(firstUnlocked.chapterId);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapters');
    }
  }, [courseId, studentId, selectedChapterId]);

  // Fetch all chapters with lock status on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchChapters();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chapters');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // Handle navigation state (refresh and selectChapterId)
  useEffect(() => {
    const state = location.state as any;
    if (state?.refresh || state?.selectChapterId) {
      // Refresh chapters to get updated lock status
      fetchChapters().then(() => {
        // After refreshing, select the chapter if specified
        if (state?.selectChapterId) {
          setSelectedChapterId(state.selectChapterId);
        }
      });
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, fetchChapters]);

  // Refetch chapters when window regains focus (e.g., returning from quiz)
  useEffect(() => {
    const handleFocus = () => {
      fetchChapters();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchChapters]);

  // Fetch chapter details when selected chapter changes
  useEffect(() => {
    const fetchChapterDetail = async () => {
      if (!selectedChapterId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await courseService.getChapterDetailWithContent(selectedChapterId, studentId);
        setChapterDetail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chapter');
      } finally {
        setLoading(false);
      }
    };

    fetchChapterDetail();
  }, [selectedChapterId]);

  // Update editor content when chapter detail is loaded
  useEffect(() => {
    if (chapterDetail?.contentBlocks && editor) {
      try {
        // The content blocks contain BlockNote data stored as JSON strings
        let blockNoteBlocks: any[] = [];

        // If we have content blocks, parse them
        if (chapterDetail.contentBlocks.length > 0) {
          chapterDetail.contentBlocks.forEach((block) => {
            try {
              // The data field contains the actual BlockNote block data
              if (block.data) {
                // Try to parse as JSON first (it's likely stored as JSON string)
                let parsedData: any;
                try {
                  parsedData = JSON.parse(block.data);
                } catch {
                  // If it's not JSON, it might be a plain string or already parsed
                  parsedData = block.data;
                }

                // If it's an array of blocks (entire document), use it directly
                if (Array.isArray(parsedData)) {
                  blockNoteBlocks = parsedData;
                }
                // If it's a single block object with type and content
                else if (parsedData && typeof parsedData === 'object' && parsedData.type) {
                  blockNoteBlocks.push(parsedData);
                }
                // Otherwise, wrap as a paragraph
                else if (typeof parsedData === 'string') {
                  blockNoteBlocks.push({
                    type: 'paragraph',
                    content: [{ type: 'text', text: parsedData }],
                  });
                }
              }
            } catch (err) {
              console.error('Error parsing individual block:', err, block);
            }
          });
        }

        // If we parsed any blocks, update the editor
        if (blockNoteBlocks.length > 0) {
          editor.replaceBlocks(editor.document, blockNoteBlocks as any);
        }
      } catch (err) {
        console.error('Error parsing chapter content:', err);
      }
    }
  }, [chapterDetail, editor]);

  // Disable editing on the editor after content is loaded
  useEffect(() => {
    if (editor && chapterDetail) {
      // Disable all contenteditable elements
      const editableElements = document.querySelectorAll('[contenteditable]');
      editableElements.forEach((el) => {
        el.setAttribute('contenteditable', 'false');
        el.setAttribute('spellcheck', 'false');
        // Remove focus and blur handlers that cause cursor to appear
        el.removeAttribute('onblur');
        el.removeAttribute('onfocus');
        // Prevent all editing events
        el.addEventListener('keydown', (e) => e.preventDefault());
        el.addEventListener('paste', (e) => e.preventDefault());
        el.addEventListener('click', (e) => {
          (e.target as HTMLElement).blur();
        });
        el.addEventListener('focus', (e) => {
          (e.target as HTMLElement).blur();
        });
      });
      // Disable spellcheck on the entire editor container
      const editorContainer = document.querySelector('.bn-editor');
      if (editorContainer) {
        editorContainer.setAttribute('spellcheck', 'false');
      }
    }
  }, [editor, chapterDetail]);

  if (loading && chapters.length === 0) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error && chapters.length === 0) {
    return (
      <Container py="xl">
        <Alert color="red" title="Error">
          {error}
        </Alert>
        <Button mt="md" onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </Container>
    );
  }

  const currentChapterIndex = chapters.findIndex((c) => c.chapterId === selectedChapterId);

  return (
    <Box style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Grid gutter="md" style={{ flex: 1, margin: 0 }}>
        {/* Chapters Sidebar */}
        <Grid.Col span={{ base: 12, md: 3 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Paper shadow="sm" p="md" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '16px' }}>
            <Title order={3} mb="lg" style={{ marginBottom: '16px' }}>
              Chapitres
            </Title>
            <ScrollArea style={{ flex: 1 }}>
              <Stack gap="xs" pr="lg">
                {chapters.map((chapter) => (
                  <React.Fragment key={`fragment-${chapter.chapterId}`}>
                    {/* Chapter Card */}
                    <Paper
                      key={`chapter-${chapter.chapterId}`}
                      p="md"
                      radius="md"
                      style={{
                        cursor: chapter.isLocked ? 'not-allowed' : 'pointer',
                        border: selectedChapterId === chapter.chapterId ? '2px solid #4A9FD8' : '1px solid #e0e0e0',
                        backgroundColor: chapter.isLocked
                          ? '#f5f5f5'
                          : selectedChapterId === chapter.chapterId
                          ? '#f0f7ff'
                          : 'white',
                        opacity: chapter.isLocked ? 0.6 : 1,
                        transition: 'all 0.2s',
                      }}
                      onClick={() => {
                        if (!chapter.isLocked) {
                          setSelectedChapterId(chapter.chapterId);
                        }
                      }}
                    >
                      <Group justify="space-between" align="flex-start" mb="xs">
                        <div style={{ flex: 1 }}>
                          <Group gap="xs">
                            {chapter.isLocked && <IconLock size={16} color="#666" />}
                            {chapter.isCompleted && <IconCheck size={16} color="green" />}
                            <Text fw={500} size="sm">
                              {chapter.order}. {chapter.title}
                            </Text>
                          </Group>
                          {chapter.description && (
                            <Text size="xs" c="dimmed" mt="xs">
                              {chapter.description}
                            </Text>
                          )}
                        </div>
                        {selectedChapterId === chapter.chapterId && !chapter.isLocked && (
                          <IconChevronRight size={20} style={{ color: '#4A9FD8', flexShrink: 0 }} />
                        )}
                      </Group>

                      {chapter.progressPercentage > 0 && (
                        <>
                          <Progress value={chapter.progressPercentage} size="sm" mb="xs" />
                          <Text size="xs" c="dimmed">
                            {chapter.progressPercentage}% complété
                          </Text>
                        </>
                      )}

                      {chapter.isLocked && (
                        <Text size="xs" c="red" mt="xs">
                          Terminez le quiz précédent pour débloquer
                        </Text>
                      )}
                    </Paper>

                    {/* Quiz Card (after chapter) */}
                    {chapter.hasQuiz && chapter.quizId && (
                      <Paper
                        key={`quiz-${chapter.quizId}`}
                        p="md"
                        radius="md"
                        style={{
                          cursor: chapter.quizLocked ? 'not-allowed' : 'pointer',
                          marginLeft: '16px',
                          border: '1px solid #ffe066',
                          backgroundColor: chapter.quizLocked ? '#f5f5f5' : '#fffbf0',
                          opacity: chapter.quizLocked ? 0.6 : 1,
                          transition: 'all 0.2s',
                        }}
                        onClick={() => {
                          if (!chapter.quizLocked) {
                            navigate(`/quiz/${chapter.quizId}`);
                          }
                        }}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Group gap="xs" align="flex-start">
                            {chapter.quizLocked ? (
                              <IconLock size={20} color="#666" style={{ flexShrink: 0, marginTop: '2px' }} />
                            ) : (
                              <IconFileText size={20} style={{ color: '#f59f00', flexShrink: 0, marginTop: '2px' }} />
                            )}
                            <div>
                              <Group gap="xs">
                                <Text fw={500} size="sm">
                                  Quiz
                                </Text>
                                {chapter.quizPassed && <IconCheck size={16} color="green" />}
                              </Group>
                              {chapter.lastQuizScore !== null && chapter.lastQuizScore !== undefined && (
                                <Badge size="sm" color={chapter.quizPassed ? 'green' : 'gray'} mt="xs">
                                  Dernier score: {chapter.lastQuizScore}%
                                </Badge>
                              )}
                            </div>
                          </Group>
                          {!chapter.quizLocked && (
                            <IconChevronRight size={20} style={{ color: '#f59f00', flexShrink: 0 }} />
                          )}
                        </Group>
                        {chapter.quizLocked && (
                          <Text size="xs" c="red" mt="xs">
                            Terminez le chapitre pour débloquer le quiz
                          </Text>
                        )}
                      </Paper>
                    )}
                  </React.Fragment>
                ))}
              </Stack>
            </ScrollArea>
          </Paper>
        </Grid.Col>

        {/* Content Area with BlockNote */}
        <Grid.Col span={{ base: 12, md: 9 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '16px' }}>
          {loading ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : error ? (
            <Alert color="red" title="Error">
              {error}
            </Alert>
          ) : chapterDetail ? (
            <Box style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Chapter Header */}
              <Box
                style={{
                  background: chapterDetail.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                <Title order={2} c="white" mb="xs">
                  {chapterDetail.order}. {chapterDetail.title}
                </Title>
                {chapterDetail.description && (
                  <Text c="rgba(255,255,255,0.9)" size="sm">
                    {chapterDetail.description}
                  </Text>
                )}
                {chapterDetail.studentProgress && (
                  <Box mt="lg">
                    <Group justify="space-between" mb="xs">
                      <Text size="sm" fw={500}>
                        Progression
                      </Text>
                      <Text size="sm" fw={500}>
                        {chapterDetail.studentProgress.progressPercentage}%
                      </Text>
                    </Group>
                    <Progress value={chapterDetail.studentProgress.progressPercentage} color="white" size="md" />
                  </Box>
                )}
              </Box>

              {/* BlockNote Content Area */}
              <Box
                style={{
                  flex: 1,
                  overflow: 'auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                }}
              >
                {chapterDetail.contentBlocks.length === 0 ? (
                  <Center py="xl">
                    <Alert color="blue" title="Aucun contenu">
                      Ce chapitre n'a pas de contenu pour le moment.
                    </Alert>
                  </Center>
                ) : (
                  <Box p="xl" style={{ userSelect: 'text' }}>
                    <style>{`
                      /* Make editor content selectable */
                      .bn-editor {
                        user-select: text !important;
                        -webkit-user-select: text !important;
                      }

                      /* Hide all editor UI elements */
                      .bn-editor .bn-toolbar,
                      .bn-editor .bn-side-menu,
                      .bn-editor .bn-slash-menu,
                      .bn-editor [role="toolbar"] {
                        display: none !important;
                      }

                      /* Style code blocks with syntax highlighting */
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

                      /* Syntax highlighting colors */
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

                      /* Ensure all text is selectable */
                      .bn-block,
                      .bn-inline-content,
                      .bn-editor * {
                        user-select: text !important;
                        -webkit-user-select: text !important;
                      }

                      /* Remove text cursor (caret) */
                      .bn-editor {
                        caret-color: transparent !important;
                      }

                      /* Remove spell check underlines (red wavy lines) */
                      .bn-editor [contenteditable] {
                        caret-color: transparent !important;
                      }

                      /* Remove spell check marks */
                      ::-webkit-spelling-error-background {
                        background: transparent !important;
                        text-decoration: none !important;
                      }

                      /* Disable spell check outline */
                      .bn-block:focus,
                      .bn-inline-content:focus {
                        outline: none !important;
                        caret-color: transparent !important;
                      }

                      /* Hide contenteditable cursor completely */
                      [contenteditable="false"] {
                        caret-color: transparent !important;
                      }

                      [contenteditable="false"]::selection {
                        background: rgba(0, 0, 0, 0.1) !important;
                      }
                    `}</style>
                    <BlockNoteView
                      editor={editor}
                      theme="light"
                      sideMenu={false}
                      slashMenu={false}
                      formattingToolbar={false}
                      linkToolbar={false}
                    />
                  </Box>
                )}
              </Box>

              {/* Mark as Completed Button */}
              {chapterDetail && selectedChapterId && !chapters.find(c => c.chapterId === selectedChapterId)?.isCompleted && (
                <Box mt="lg">
                  <Button
                    fullWidth
                    size="md"
                    color="green"
                    leftSection={<IconCheck size={18} />}
                    onClick={async () => {
                      try {
                        await chapterProgressService.markChapterAsCompleted(studentId, selectedChapterId);
                        // Refresh chapters
                        const chaptersData = await chapterProgressService.getChaptersWithLockStatus(parseInt(courseId!), studentId);
                        setChapters(chaptersData);
                      } catch (err) {
                        console.error('Failed to mark chapter as completed:', err);
                      }
                    }}
                  >
                    Marquer comme terminé
                  </Button>
                </Box>
              )}

              {/* Navigation Buttons */}
              <Group justify="space-between" mt="xl" pt="xl" style={{ borderTop: '1px solid #e0e0e0', flexShrink: 0 }}>
                <Button
                  variant="default"
                  onClick={() => {
                    if (currentChapterIndex > 0) {
                      setSelectedChapterId(chapters[currentChapterIndex - 1].chapterId);
                    }
                  }}
                  disabled={currentChapterIndex === 0}
                >
                  Chapitre Précédent
                </Button>
                {/* Show quiz button if chapter has a quiz, otherwise show next chapter button */}
                {selectedChapterId && chapters.find(c => c.chapterId === selectedChapterId)?.hasQuiz &&
                 chapters.find(c => c.chapterId === selectedChapterId)?.quizId ? (
                  <Button
                    color="orange"
                    onClick={() => {
                      const currentChapter = chapters.find(c => c.chapterId === selectedChapterId);
                      if (currentChapter?.quizId) {
                        navigate(`/quiz/${currentChapter.quizId}`);
                      }
                    }}
                    disabled={chapters.find(c => c.chapterId === selectedChapterId)?.quizLocked}
                    rightSection={<IconChevronRight size={16} />}
                  >
                    {chapters.find(c => c.chapterId === selectedChapterId)?.quizLocked
                      ? 'Quiz verrouillé'
                      : 'Commencer le quiz'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      if (currentChapterIndex < chapters.length - 1) {
                        setSelectedChapterId(chapters[currentChapterIndex + 1].chapterId);
                      }
                    }}
                    disabled={currentChapterIndex === chapters.length - 1}
                    rightSection={<IconChevronRight size={16} />}
                  >
                    Chapitre Suivant
                  </Button>
                )}
              </Group>
            </Box>
          ) : (
            <Center py="xl">
              <Alert color="blue" title="Aucun chapitre sélectionné">
                Sélectionnez un chapitre pour voir son contenu.
              </Alert>
            </Center>
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
}

export default CourseView;
