import { useRef, useEffect } from 'react';
import { Button, Grid, Paper, Text, ScrollArea, Box, TextInput, ActionIcon } from '@mantine/core';
import { IconCheck, IconEdit } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';

import chapterContentStates from '../../hooks/chapter/chapterContentStates';
import useChapterContentActions from '../../hooks/chapter/chapterContentActions';
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";


function ChapterContentPage() {
  const { chapterId } = useParams();
  const selectionRef = useRef(null);

  
  const breadCurmbs = [
    {
      title: 'Cours & contenus',
      href: '/course'
    },
    {
      title: 'Chapitres',
      href: '/chapter'
    }
  ]

  const {
    setBreadCrumb, content, setContent, chapters, setChapters,
    editor,navigate,isEditingTitle,setIsEditingTitle,
    chapterTitle,setChapterTitle,originalTitle,setOriginalTitle
  } = chapterContentStates();


  const {
    onSaveChapterContent,
    fetchContent,
    fetchChapters,
    onUpdateChapterTitle
  } = useChapterContentActions({
    state:{
      setContent,
      setChapters
    }
  });

  
  //#region useEffect
  useEffect(() => {
    setBreadCrumb(breadCurmbs as any);
    fetchChapters(Number(chapterId ?? 0));
  }, []);
  
  useEffect(() => {
    const loadContent = async () => {
      try {
        await fetchContent(Number(chapterId ?? 0));
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      }
    };

    loadContent();
  }, [chapterId]);

  // Mettre à jour l'éditeur quand le contenu est chargé
  useEffect(() => {
    if (content && editor && Array.isArray(content)) {
      editor.replaceBlocks(editor.document, content);
    }
  }, [content, editor]);

  // Mettre à jour le titre du chapitre quand les chapitres sont chargés
  useEffect(() => {
    const currentChapter = chapters.find(chapter => chapter.chapterId === Number(chapterId));
    if (currentChapter) {
      setChapterTitle(currentChapter.title);
      setOriginalTitle(currentChapter.title);
    }
  }, [chapters, chapterId, setChapterTitle]);
  //#endregion useEffect

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    if (!chapterTitle?.trim()) {
      setChapterTitle(originalTitle);
      return;
    }
    try {
      if (chapterTitle && chapterTitle.trim() !== '') {
        await onUpdateChapterTitle(Number(chapterId ?? 0), chapterTitle ?? "");
        console.log('Titre sauvegardé avec succès');
        fetchChapters(Number(chapterId ?? 0));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du titre:', error);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Grid gutter="md" style={{ height: '100vh', padding: '20px' }}>
        {/* Éditeur au centre */}
        <Grid.Col span={9} style={{ position: 'relative' }}>
          <div
            style={{
              height: '100%',
              overflow: 'auto'
            }}
            ref={selectionRef}
          >
            {/* Titre du chapitre éditable */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '20px',
                position: 'relative',
                maxWidth: 'fit-content'
              }}
              onMouseEnter={(e) => {
                const editBtn = e.currentTarget.querySelector('.edit-btn') as HTMLElement;
                if (editBtn) editBtn.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                const editBtn = e.currentTarget.querySelector('.edit-btn') as HTMLElement;
                if (editBtn) editBtn.style.opacity = '0';
              }}
            >
              {isEditingTitle ? (
                <TextInput
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.currentTarget.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                  size="xl"
                  style={{ fontSize: '50px', fontWeight: 700, minWidth: '300px' }}
                  autoFocus
                />
              ) : (
                <Text size="xl" fw={700} style={{ fontSize: '50px' }}>
                  {chapterTitle}
                </Text>
              )}
              <ActionIcon
                className="edit-btn"
                variant="subtle"
                onClick={() => setIsEditingTitle(true)}
                style={{ 
                  opacity: 0, 
                  transition: 'opacity 0.2s',
                  marginLeft: '8px'
                }}
              >
                <IconEdit size={18} />
              </ActionIcon>
            </div>
            
            <BlockNoteView editor={editor} theme="light" />
            
            {/* Bouton Valider */}
            <div style={{ textAlign: 'center', padding: '30px' }}>
              <Button 
                onClick={() =>{onSaveChapterContent(Number(chapterId ?? 0), editor.document);}}
                leftSection={<IconCheck size={18} />}
                size="lg"
                color="green"
                radius="xl"
              >
                Valider le contenu
              </Button>
            </div>
          </div>
        </Grid.Col>
        
        {/* Liste des chapitres à gauche */}
        <Grid.Col span={3}>
          <Paper shadow="sm" p="md" style={{ height: '100%' }}>
            <Text size="lg" fw={600} mb="md">Chapitres</Text>
            <ScrollArea style={{ height: 'calc(100% - 40px)' }}>
              {chapters.map((chapter) => (
                <Box
                  key={chapter.chapterId}
                  onClick={() => {
                    navigate(`/chapterContent/${chapter.chapterId}`);
                    onSaveChapterContent(Number(chapterId ?? 0), editor.document);
                    handleTitleSave();
                  }}
                  p="sm"
                  mb="xs"
                  style={{
                    backgroundColor: chapter.chapterId === Number(chapterId) ? '#e7f5ff' : 'transparent',
                    borderRadius: '8px',
                    border: chapter.chapterId === Number(chapterId) ? '2px solid #228be6' : '1px solid #e9ecef',
                    cursor: 'pointer'
                  }}
                >
                  <Text size="sm" fw={chapter.chapterId === Number(chapterId) ? 600 : 400}>
                    {chapter.title}
                  </Text>
                </Box>
              ))}
            </ScrollArea>
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default ChapterContentPage;