import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Progress,
  Group,
  Stack,
  ThemeIcon,
  Badge,
  SimpleGrid,
  Paper,
  Loader,
  Center,
  Alert,
  Tabs,
  Table,
  RingProgress,
} from '@mantine/core';
import {
  IconBook,
  IconTrophy,
  IconClock,
  IconChartBar,
  IconBrain,
  IconFlame,
  IconTarget,
  IconTrendingUp,
  IconAlertCircle,
  IconCheck,
  IconChecks,
  IconAward,
} from '@tabler/icons-react';
import { getUserInfo } from '../services/authService';
import statisticsService, { type StudentOverview, type MonthlyActivity, type CourseProgress, type QuizPerformance, type ChapterProgression, type TimeSpent } from '../services/statisticsService';

// Simple Chart Components (Fallback if Recharts not available)
const SimpleBarChart = ({ data, label }: { data: MonthlyActivity[], label: string }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.completed, d.attempted)));

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
      {data.slice(0, 6).map((item, idx) => (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '150px' }}>
            <div
              style={{
                width: '16px',
                height: `${(item.completed / maxValue) * 150}px`,
                backgroundColor: '#3b82f6',
                borderRadius: '4px 4px 0 0',
              }}
              title={`Completed: ${item.completed}`}
            />
            <div
              style={{
                width: '16px',
                height: `${(item.attempted / maxValue) * 150}px`,
                backgroundColor: '#d1d5db',
                borderRadius: '4px 4px 0 0',
              }}
              title={`Attempted: ${item.attempted}`}
            />
          </div>
          <Text size="xs" mt="sm" fw={500}>{item.month}</Text>
        </div>
      ))}
    </div>
  );
};

const SimplePieChart = ({ data }: { data: QuizPerformance[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <svg width="150" height="150" style={{ borderRadius: '50%' }}>
        {data.map((item, idx) => {
          const sliceAngle = (item.value / total) * 360;
          const startAngle = (currentAngle * Math.PI) / 180;
          const endAngle = ((currentAngle + sliceAngle) * Math.PI) / 180;

          const x1 = 75 + 75 * Math.cos(startAngle);
          const y1 = 75 + 75 * Math.sin(startAngle);
          const x2 = 75 + 75 * Math.cos(endAngle);
          const y2 = 75 + 75 * Math.sin(endAngle);

          const largeArc = sliceAngle > 180 ? 1 : 0;
          const pathData = [
            `M 75 75`,
            `L ${x1} ${y1}`,
            `A 75 75 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          currentAngle += sliceAngle;

          return (
            <path key={idx} d={pathData} fill={item.fill} stroke="white" strokeWidth="2" />
          );
        })}
      </svg>

      <Stack gap="xs">
        {data.map((item, idx) => (
          <Group key={idx} gap="xs">
            <div style={{ width: '12px', height: '12px', backgroundColor: item.fill, borderRadius: '2px' }} />
            <Text size="sm">{item.name}: {item.value}</Text>
          </Group>
        ))}
      </Stack>
    </div>
  );
};

export default function Statistics() {
  const [user, setUser] = useState<any>(null);
  const [overview, setOverview] = useState<StudentOverview | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyActivity[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformance[]>([]);
  const [chapterProgression, setChapterProgression] = useState<ChapterProgression[]>([]);
  const [timeSpent, setTimeSpent] = useState<TimeSpent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        const userInfo = getUserInfo();
        if (!userInfo) {
          setError('Utilisateur non connecté');
          return;
        }

        setUser(userInfo);

        const [overviewData, monthlyActivityData, courseProgressData, quizPerfData, chapterProgData, timeSpentData] =
          await Promise.all([
            statisticsService.getStudentOverview(userInfo.id),
            statisticsService.getMonthlyActivityData(userInfo.id),
            statisticsService.getCourseProgressData(userInfo.id),
            statisticsService.getQuizPerformanceData(userInfo.id),
            statisticsService.getChapterProgressionData(userInfo.id),
            statisticsService.getTimeSpentData(userInfo.id),
          ]);

        setOverview(overviewData);
        setMonthlyData(monthlyActivityData);
        setCourseProgress(courseProgressData);
        setQuizPerformance(quizPerfData);
        setChapterProgression(chapterProgData);
        setTimeSpent(timeSpentData);
      } catch (err) {
        console.error('Error loading statistics:', err);
        setError('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();
  }, []);

  if (loading) {
    return (
      <Container py="xl">
        <Center py="xl">
          <Loader />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!overview) {
    return (
      <Container py="xl">
        <Center py="xl">
          <Text>Aucune donnée de statistique disponible</Text>
        </Center>
      </Container>
    );
  }

  return (
    <div style={{ width: '100%', padding: '1rem' }} className="statistics-container">
      {/* En-tête */}
      <div style={{ marginBottom: '32px' }}>
        <Text size="xl" fw={700} mb="xs">
          Mes Statistiques d'Apprentissage
        </Text>
        <Text size="sm" c="dimmed">
          Suivez votre progression et visualisez vos performances
        </Text>
      </div>

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} mb="xl">
        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm" c="dimmed">
              Taux de Complétion
            </Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconTarget size={18} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            {overview.completionRate.toFixed(1)}%
          </Text>
          <Progress value={overview.completionRate} mt="md" color="blue" />
        </Card>

        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm" c="dimmed">
              Score Moyen Quiz
            </Text>
            <ThemeIcon color="green" variant="light" size="lg" radius="md">
              <IconTrophy size={18} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            {overview.averageQuizScore}%
          </Text>
          <Progress value={overview.averageQuizScore} mt="md" color="green" />
        </Card>

        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm" c="dimmed">
              Heures d'Étude
            </Text>
            <ThemeIcon color="orange" variant="light" size="lg" radius="md">
              <IconClock size={18} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            {overview.totalStudyHours}h
          </Text>
          <Text size="xs" c="dimmed" mt="md">
            Temps total investi
          </Text>
        </Card>

        <Card withBorder radius="lg" p="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm" c="dimmed">
              Cours Actifs
            </Text>
            <ThemeIcon color="purple" variant="light" size="lg" radius="md">
              <IconBook size={18} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            {overview.activeCourses}/{overview.totalCourses}
          </Text>
          <Text size="xs" c="dimmed" mt="md">
            En cours
          </Text>
        </Card>
      </SimpleGrid>

      {/* Main Stats */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
              Statistiques Générales
            </Text>
            <Stack gap="md">
              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Chapitres Complétés</Text>
                  <Badge size="lg" color="blue">
                    {overview.completedChapters}/{overview.totalChapters}
                  </Badge>
                </Group>
                <Progress value={(overview.completedChapters / overview.totalChapters) * 100} />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Quiz Réussis</Text>
                  <Badge size="lg" color="green">
                    {overview.passedQuizzes}/{overview.totalQuizzes}
                  </Badge>
                </Group>
                <Progress value={overview.totalQuizzes > 0 ? (overview.passedQuizzes / overview.totalQuizzes) * 100 : 0} color="green" />
              </div>

              <div>
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Cours Complétés</Text>
                  <Badge size="lg" color="purple">
                    {overview.completedCourses}/{overview.totalCourses}
                  </Badge>
                </Group>
                <Progress value={overview.totalCourses > 0 ? (overview.completedCourses / overview.totalCourses) * 100 : 0} color="purple" />
              </div>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
              Performance par Catégorie
            </Text>
            <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SimplePieChart data={quizPerformance} />
            </div>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Tabs for detailed views */}
      <Tabs defaultValue="activity" color="blue" radius="lg">
        <Tabs.List>
          <Tabs.Tab leftSection={<IconFlame size={14} />} value="activity">
            Activité Mensuelle
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconBrain size={14} />} value="courses">
            Progression des Cours
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconClock size={14} />} value="time">
            Temps Investi
          </Tabs.Tab>
          <Tabs.Tab leftSection={<IconChartBar size={14} />} value="chapters">
            Progression des Chapitres
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="activity" pt="xl">
          <Card withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
              Activité Mensuelle
            </Text>
            <div style={{ overflowX: 'auto' }}>
              <SimpleBarChart data={monthlyData} label="Activité mensuelle" />
            </div>
            <Group justify="center" mt="lg" gap="xl">
              <Group gap="xs">
                <div style={{ width: '16px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '2px' }} />
                <Text size="sm">Complétés</Text>
              </Group>
              <Group gap="xs">
                <div style={{ width: '16px', height: '16px', backgroundColor: '#d1d5db', borderRadius: '2px' }} />
                <Text size="sm">Tentés</Text>
              </Group>
            </Group>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="courses" pt="xl">
          <Card withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
              Progression des Cours
            </Text>
            <Stack gap="md">
              {courseProgress.map((course, idx) => (
                <div key={idx}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Badge color={course.color} variant="light" size="lg">
                        {course.status}
                      </Badge>
                      <Text size="sm" fw={500}>
                        {course.name}
                      </Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {course.progress}%
                    </Text>
                  </Group>
                  <Progress value={course.progress} color={course.color} />
                </div>
              ))}
            </Stack>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="time" pt="xl">
          <Card withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
              Temps Investi par Cours
            </Text>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Cours</Table.Th>
                  <Table.Th align="right">Temps</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {timeSpent.map((item, idx) => (
                  <Table.Tr key={idx}>
                    <Table.Td>{item.course}</Table.Td>
                    <Table.Td align="right">
                      <Badge color="blue" variant="light">
                        {item.hours}h {item.minutes}m
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        </Tabs.Panel>

        <Tabs.Panel value="chapters" pt="xl">
          <Card withBorder radius="lg" p="lg">
            <Text fw={600} size="lg" mb="md">
              Progression des Chapitres
            </Text>
            <Stack gap="md">
              {chapterProgression.slice(0, 8).map((chapter, idx) => (
                <div key={idx}>
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      {chapter.status === 'completed' ? (
                        <ThemeIcon color="green" size="sm" radius="xl">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      ) : (
                        <ThemeIcon color="gray" size="sm" radius="xl">
                          <IconChecks size={12} />
                        </ThemeIcon>
                      )}
                      <Text size="sm" fw={500}>
                        {chapter.name}
                      </Text>
                    </Group>
                    <Text size="sm" fw={600}>
                      {chapter.progress}%
                    </Text>
                  </Group>
                  <Progress value={chapter.progress} color={chapter.status === 'completed' ? 'green' : 'blue'} />
                </div>
              ))}
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
