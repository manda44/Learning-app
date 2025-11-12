import { useEffect } from 'react';
import { Container, Card, Text, Button, Badge, Progress, Group, Grid, Loader, Center, Alert, Tabs } from '@mantine/core';
import { IconBook, IconChecks, IconClock } from '@tabler/icons-react';
import useStudentStore from '../store/studentStore';
import { getUserInfo } from '../services/authService';

export function MyCourses() {
  const { enrollments, coursesLoading, coursesError, fetchStudentCourses } = useStudentStore();

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo && userInfo.id) {
      fetchStudentCourses(userInfo.id);
    }
  }, []);

  const activeCourses = enrollments.filter(e => e.status === 'active');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  const renderCourseCard = (enrollment: any) => (
    <Card key={enrollment.enrollmentId} shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section withBorder inheritPadding py="md" style={{ backgroundColor: '#f0f7ff' }}>
        <Group justify="space-between">
          <Text fw={700} lineClamp={2}>{enrollment.course?.title || 'Cours sans titre'}</Text>
          <Badge
            color={enrollment.status === 'completed' ? 'green' : 'blue'}
            variant="light"
          >
            {enrollment.status === 'completed' ? 'Terminé' : 'En cours'}
          </Badge>
        </Group>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Group justify="space-between" mb="sm">
          <Text size="sm">Progression</Text>
          <Text size="sm" fw={600}>{enrollment.progress}%</Text>
        </Group>
        <Progress value={enrollment.progress} color={enrollment.progress === 100 ? 'green' : 'blue'} size="md" mb="md" />

        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <Text size="sm" c="dimmed">📅 {new Date(enrollment.enrollmentDate).toLocaleDateString('fr-FR')}</Text>
          </Group>
        </Group>
      </Card.Section>

      <Card.Section inheritPadding py="md" style={{ borderTop: '1px solid #eee' }}>
        <Group grow>
          <Button variant="light" color="blue" size="sm">
            Continuer
          </Button>
        </Group>
      </Card.Section>
    </Card>
  );

  return (
    <div style={{ width: '100%', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Text size="xl" fw={700} mb="lg">Mes cours</Text>
        <Text c="dimmed" size="sm">Suivez vos apprentissages et consultez votre progression</Text>
      </div>

      {coursesLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : coursesError ? (
        <Alert icon={<IconBook size={16} />} title="Erreur" color="red">
          {coursesError}
        </Alert>
      ) : enrollments.length === 0 ? (
        <Alert icon={<IconBook size={16} />} title="Aucun cours inscrit" color="blue">
          Vous n'êtes inscrit à aucun cours. <Button component="a" href="/courses" variant="subtle">S'inscrire à un cours</Button>
        </Alert>
      ) : (
        <Tabs defaultValue="active">
          <Tabs.List>
            <Tabs.Tab value="active" leftSection={<IconClock size={14} />}>
              En cours ({activeCourses.length})
            </Tabs.Tab>
            <Tabs.Tab value="completed" leftSection={<IconChecks size={14} />}>
              Terminés ({completedCourses.length})
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="active" pt="xl">
            {activeCourses.length === 0 ? (
              <Alert icon={<IconBook size={16} />} title="Aucun cours en cours">
                Commencez votre apprentissage en vous inscrivant à un cours!
              </Alert>
            ) : (
              <Grid gutter="md">
                {activeCourses.map(enrollment => (
                  <Grid.Col key={enrollment.enrollmentId} span={{ base: 12, sm: 6, md: 4 }}>
                    {renderCourseCard(enrollment)}
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="completed" pt="xl">
            {completedCourses.length === 0 ? (
              <Alert icon={<IconBook size={16} />} title="Aucun cours terminé">
                Continuez à apprendre pour terminer vos cours!
              </Alert>
            ) : (
              <Grid gutter="md">
                {completedCourses.map(enrollment => (
                  <Grid.Col key={enrollment.enrollmentId} span={{ base: 12, sm: 6, md: 4 }}>
                    {renderCourseCard(enrollment)}
                  </Grid.Col>
                ))}
              </Grid>
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </div>
  );
}

export default MyCourses;
