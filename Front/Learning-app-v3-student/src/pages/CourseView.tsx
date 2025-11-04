import { useState, useEffect } from 'react';
import { Container, Box, Button, Title, Text, Loader, Center, Alert, Badge, Progress, Group, Stack, Paper, Grid, ScrollArea } from '@mantine/core';
import { IconChevronRight, IconFileText } from '@tabler/icons-react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { codeBlock } from '@blocknote/code-block';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import courseService from '../services/courseService';
import type { ChapterDetail, CourseNavItem, ChapterListItem, QuizItem } from '../services/courseService';
import { isChapter, isQuiz } from '../services/courseService';
import { useNavigate, useParams } from 'react-router-dom';

export function CourseView() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [navItems, setNavItems] = useState<CourseNavItem[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
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

  // Fetch all chapters and quizzes in the course on mount
  useEffect(() => {
    const fetchNavItems = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!courseId) {
          throw new Error('Course ID is required');
        }
        const data = await courseService.getCourseChaptersWithContent(parseInt(courseId), studentId);
        setNavItems(data);
        // Select first chapter by default
        if (data.length > 0) {
          const firstChapter = data.find(item => isChapter(item));
          if (firstChapter && isChapter(firstChapter)) {
            setSelectedChapterId(firstChapter.chapterId);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chapters');
      } finally {
        setLoading(false);
      }
    };

    fetchNavItems();
  }, [courseId]);

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

  if (loading && navItems.length === 0) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (error && navItems.length === 0) {
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

  const chapters = navItems.filter(isChapter);
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
                {navItems.map((item) => {
                  if (isChapter(item)) {
                    return (
                      <Paper
                        key={`chapter-${item.chapterId}`}
                        p="md"
                        radius="md"
                        style={{
                          cursor: 'pointer',
                          border: selectedChapterId === item.chapterId ? '2px solid #4A9FD8' : '1px solid #e0e0e0',
                          backgroundColor: selectedChapterId === item.chapterId ? '#f0f7ff' : 'white',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => {
                          setSelectedChapterId(item.chapterId);
                          setSelectedQuizId(null);
                        }}
                      >
                        <Group justify="space-between" align="flex-start" mb="xs">
                          <div>
                            <Text fw={500} size="sm">
                              {item.order}. {item.title}
                            </Text>
                            <Text size="xs" c="dimmed" mt="xs">
                              {item.contentCount} bloc{item.contentCount !== 1 ? 's' : ''}
                            </Text>
                          </div>
                          {selectedChapterId === item.chapterId && (
                            <IconChevronRight size={20} style={{ color: '#4A9FD8', flexShrink: 0 }} />
                          )}
                        </Group>

                        {item.studentProgress && (
                          <>
                            <Progress value={item.studentProgress.progressPercentage} size="sm" mb="xs" />
                            <Text size="xs" c="dimmed">
                              {item.studentProgress.progressPercentage}% complété
                            </Text>
                          </>
                        )}

                        {item.hasQuiz && (
                          <Badge size="sm" color="blue" mt="xs">
                            Quiz disponible
                          </Badge>
                        )}
                      </Paper>
                    );
                  } else if (isQuiz(item)) {
                    return (
                      <Paper
                        key={`quiz-${item.quizId}`}
                        p="md"
                        radius="md"
                        style={{
                          cursor: 'pointer',
                          marginLeft: '16px',
                          border: selectedQuizId === item.quizId ? '2px solid #f59f00' : '1px solid #ffe066',
                          backgroundColor: selectedQuizId === item.quizId ? '#fff9e6' : '#fffbf0',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => {
                          setSelectedQuizId(item.quizId);
                          setSelectedChapterId(null);
                          navigate(`/quiz/${item.quizId}`);
                        }}
                      >
                        <Group justify="space-between" align="flex-start">
                          <Group gap="xs" align="flex-start">
                            <IconFileText size={20} style={{ color: '#f59f00', flexShrink: 0, marginTop: '2px' }} />
                            <div>
                              <Text fw={500} size="sm">
                                Quiz: {item.title}
                              </Text>
                              <Text size="xs" c="dimmed" mt="xs">
                                Succès requis: {item.successPercentage}%
                              </Text>
                            </div>
                          </Group>
                          {selectedQuizId === item.quizId && (
                            <IconChevronRight size={20} style={{ color: '#f59f00', flexShrink: 0 }} />
                          )}
                        </Group>
                      </Paper>
                    );
                  }
                })}
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
