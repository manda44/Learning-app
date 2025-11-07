# Instructions d'intégration du système de verrouillage

## Modifications à faire dans CourseView.tsx

### 1. Modifier les imports (lignes 1-12)

Remplacer:
```typescript
import { IconChevronRight, IconFileText } from '@tabler/icons-react';
import courseService from '../services/courseService';
import type { ChapterDetail, CourseNavItem } from '../services/courseService';
import { isChapter, isQuiz } from '../services/courseService';
```

Par:
```typescript
import { IconChevronRight, IconFileText, IconLock, IconCheck } from '@tabler/icons-react';
import courseService from '../services/courseService';
import type { ChapterDetail } from '../services/courseService';
import chapterProgressService, { type ChapterWithLockStatus } from '../services/chapterProgressService';
import quizService, { type StudentQuizAttempt } from '../services/quizService';
```

### 2. Modifier les states (lignes 14-22)

Remplacer:
```typescript
const [navItems, setNavItems] = useState<CourseNavItem[]>([]);
```

Par:
```typescript
const [chapters, setChapters] = useState<ChapterWithLockStatus[]>([]);
const [quizAttempts, setQuizAttempts] = useState<{ [quizId: number]: StudentQuizAttempt }>({});
```

### 3. Modifier le useEffect de chargement (lignes 38-64)

Remplacer tout le contenu du useEffect par:
```typescript
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!courseId) {
        throw new Error('Course ID is required');
      }

      // Fetch chapters with lock status
      const chaptersData = await chapterProgressService.getChaptersWithLockStatus(parseInt(courseId), studentId);
      setChapters(chaptersData);

      // Fetch quiz attempts for all quizzes
      const attempts: { [quizId: number]: StudentQuizAttempt } = {};
      for (const chapter of chaptersData) {
        if (chapter.quizId) {
          try {
            const quizAttemptsData = await quizService.getStudentQuizAttempts(studentId, chapter.quizId);
            // Get the most recent attempt
            if (quizAttemptsData.length > 0) {
              const latestAttempt = quizAttemptsData.sort((a, b) =>
                new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()
              )[0];
              attempts[chapter.quizId] = latestAttempt;
            }
          } catch (err) {
            console.error(`Failed to fetch attempts for quiz ${chapter.quizId}:`, err);
          }
        }
      }
      setQuizAttempts(attempts);

      // Select first unlocked chapter by default
      const firstUnlocked = chaptersData.find(c => !c.isLocked);
      if (firstUnlocked) {
        setSelectedChapterId(firstUnlocked.chapterId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chapters');
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [courseId]);
```

### 4. Modifier l'affichage des chapitres dans la sidebar (lignes 203-250)

Remplacer la boucle `navItems.map` par:
```typescript
{chapters.map((chapter) => (
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
        setSelectedQuizId(null);
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

    {chapter.hasQuiz && (
      <Group gap="xs" mt="xs">
        <Badge
          size="sm"
          color={chapter.quizPassed ? 'green' : 'blue'}
          leftSection={chapter.quizPassed ? <IconCheck size={12} /> : undefined}
        >
          {chapter.quizPassed ? 'Quiz réussi' : 'Quiz disponible'}
        </Badge>
        {chapter.quizId && quizAttempts[chapter.quizId] && (
          <Badge size="sm" color="gray">
            {quizAttempts[chapter.quizId].score}%
          </Badge>
        )}
      </Group>
    )}

    {chapter.isLocked && (
      <Text size="xs" c="red" mt="xs">
        Terminez le quiz précédent pour débloquer
      </Text>
    )}
  </Paper>
))}
```

### 5. Supprimer l'affichage séparé des quiz

Les quiz ne sont plus affichés séparément dans la sidebar, ils sont maintenant intégrés dans les chapitres avec les badges.

### 6. Ajouter un bouton "Marquer comme terminé" en bas du contenu (après le BlockNoteView)

Ajouter après la fermeture du Box contenant le BlockNoteView:
```typescript
{chapterDetail && !chapters.find(c => c.chapterId === selectedChapterId)?.isCompleted && (
  <Box mt="xl" p="md">
    <Button
      fullWidth
      size="lg"
      onClick={async () => {
        try {
          await chapterProgressService.markChapterAsCompleted(studentId, selectedChapterId!);
          // Refresh chapters
          const chaptersData = await chapterProgressService.getChaptersWithLockStatus(parseInt(courseId!), studentId);
          setChapters(chaptersData);
        } catch (err) {
          console.error('Failed to mark chapter as completed:', err);
        }
      }}
    >
      <IconCheck size={18} style={{ marginRight: '8px' }} />
      Marquer comme terminé
    </Button>
  </Box>
)}
```

### 7. Modifier le code de navigation (lignes 190-191)

Remplacer:
```typescript
const chapters = navItems.filter(isChapter);
const currentChapterIndex = chapters.findIndex((c) => c.chapterId === selectedChapterId);
```

Par:
```typescript
const currentChapterIndex = chapters.findIndex((c) => c.chapterId === selectedChapterId);
```

## Résumé des changements

1. ✅ Les chapitres verrouillés affichent un cadenas et ne sont pas cliquables
2. ✅ Un message indique qu'il faut terminer le quiz précédent
3. ✅ Les chapitres terminés affichent une coche verte
4. ✅ Le pourcentage du dernier quiz tenté est affiché sur le badge du quiz
5. ✅ Un badge vert "Quiz réussi" apparaît quand le quiz est passé
6. ✅ Un bouton "Marquer comme terminé" permet de compléter un chapitre
7. ✅ La liste se rafraîchit automatiquement après avoir marqué un chapitre comme terminé

## Test

1. Démarrer le backend: `cd Back/LearningApp && dotnet run`
2. Démarrer le frontend: `cd Front/Learning-app-v3-student && npm run dev`
3. Accéder à un cours et vérifier que:
   - Le premier chapitre est déverrouillé
   - Les autres chapitres sont verrouillés avec un cadenas
   - Après avoir réussi un quiz, le chapitre suivant se déverrouille
   - Le score du dernier quiz s'affiche sur le badge
