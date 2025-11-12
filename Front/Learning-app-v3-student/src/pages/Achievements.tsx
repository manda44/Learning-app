import { useEffect } from 'react';
import { Container, Card, Text, Grid, Badge, Progress, Group, SimpleGrid, Loader, Center, Alert, Tabs } from '@mantine/core';
import { IconTrophy, IconMedal, IconStar } from '@tabler/icons-react';
import useStudentStore from '../store/studentStore';
import { getUserInfo } from '../services/authService';

export function Achievements() {
  const { achievements, totalPoints, achievementsLoading, achievementsError, fetchAchievements, fetchStudentPoints } = useStudentStore();

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      fetchAchievements(userInfo.id);
      fetchStudentPoints();
    }
  }, [fetchAchievements, fetchStudentPoints]);

  const categories = {
    learning: achievements.filter(a => a.achievement?.name?.includes('Learning') || a.achievement?.name?.includes('Chapter')),
    quiz: achievements.filter(a => a.achievement?.name?.includes('Quiz') || a.achievement?.name?.includes('Score')),
    project: achievements.filter(a => a.achievement?.name?.includes('Project') || a.achievement?.name?.includes('Ticket')),
  };

  return (
    <div style={{ width: '100%', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Text size="xl" fw={700} mb="lg">Mes accomplissements</Text>
        <Text c="dimmed" size="sm">Débloquez des badges et gagnez des points en progressant</Text>
      </div>

      {/* Points Summary */}
      <Grid gutter="md" mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Points totaux</Text>
              <IconTrophy size={24} style={{ color: '#FFD700' }} />
            </Group>
            <Text size="xl" fw={700}>{totalPoints}</Text>
            <Progress value={Math.min((totalPoints / 1000) * 100, 100)} color="yellow" size="sm" mt="sm" />
            <Text size="xs" c="dimmed" mt="xs">{Math.min(totalPoints, 1000)} / 1000 pour niveau suivant</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Accomplissements</Text>
              <IconMedal size={24} style={{ color: '#4A9FD8' }} />
            </Group>
            <Text size="xl" fw={700}>{achievements.length}</Text>
            <Text size="sm" c="dimmed" mt="sm">Badges débloqués</Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group justify="space-between" mb="sm">
              <Text fw={500}>Rang</Text>
              <IconStar size={24} style={{ color: '#51CF66' }} />
            </Group>
            <Text size="xl" fw={700}>Bronze</Text>
            <Text size="sm" c="dimmed" mt="sm">Continuez à progresser</Text>
          </Card>
        </Grid.Col>
      </Grid>

      {achievementsLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : achievementsError ? (
        <Alert icon={<IconTrophy size={16} />} title="Erreur" color="red">
          {achievementsError}
        </Alert>
      ) : achievements.length === 0 ? (
        <Alert icon={<IconTrophy size={16} />} title="Aucun accomplissement encore" color="blue">
          Commencez à apprendre pour débloquer vos premiers badges et gagner des points!
        </Alert>
      ) : (
        <Tabs defaultValue="all">
          <Tabs.List>
            <Tabs.Tab value="all">Tous ({achievements.length})</Tabs.Tab>
            <Tabs.Tab value="learning">Apprentissage ({categories.learning.length})</Tabs.Tab>
            <Tabs.Tab value="quiz">Quiz ({categories.quiz.length})</Tabs.Tab>
            <Tabs.Tab value="project">Projets ({categories.project.length})</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="all" pt="xl">
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {achievements.map(achievement => (
                <Card key={achievement.studentAchievementId} shadow="sm" padding="lg" radius="md" withBorder style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: '#FFD700',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    <IconTrophy size={40} color="white" />
                  </div>
                  <Text fw={700} mb="xs">{achievement.achievement?.name || 'Badge'}</Text>
                  <Text size="sm" c="dimmed" mb="md">{achievement.achievement?.description}</Text>
                  <Group justify="space-between">
                    <Badge color="yellow">{achievement.achievement?.points || 0} pts</Badge>
                    <Text size="xs" c="dimmed">{new Date(achievement.unlockedDate).toLocaleDateString('fr-FR')}</Text>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="learning" pt="xl">
            {categories.learning.length === 0 ? (
              <Alert icon={<IconTrophy size={16} />} title="Aucun badge d'apprentissage" color="blue">
                Terminez des chapitres pour débloquer des badges d'apprentissage!
              </Alert>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                {categories.learning.map(achievement => (
                  <Card key={achievement.studentAchievementId} shadow="sm" padding="lg" radius="md" withBorder style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#4A9FD8',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <IconTrophy size={40} color="white" />
                    </div>
                    <Text fw={700} mb="xs">{achievement.achievement?.name || 'Badge'}</Text>
                    <Badge color="blue">{achievement.achievement?.points || 0} pts</Badge>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="quiz" pt="xl">
            {categories.quiz.length === 0 ? (
              <Alert icon={<IconTrophy size={16} />} title="Aucun badge quiz" color="blue">
                Réussissez des quiz pour débloquer des badges!
              </Alert>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                {categories.quiz.map(achievement => (
                  <Card key={achievement.studentAchievementId} shadow="sm" padding="lg" radius="md" withBorder style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#FF922B',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <IconTrophy size={40} color="white" />
                    </div>
                    <Text fw={700} mb="xs">{achievement.achievement?.name || 'Badge'}</Text>
                    <Badge color="orange">{achievement.achievement?.points || 0} pts</Badge>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="project" pt="xl">
            {categories.project.length === 0 ? (
              <Alert icon={<IconTrophy size={16} />} title="Aucun badge projet" color="blue">
                Terminez des projets pour débloquer des badges!
              </Alert>
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
                {categories.project.map(achievement => (
                  <Card key={achievement.studentAchievementId} shadow="sm" padding="lg" radius="md" withBorder style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#51CF66',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                      }}
                    >
                      <IconTrophy size={40} color="white" />
                    </div>
                    <Text fw={700} mb="xs">{achievement.achievement?.name || 'Badge'}</Text>
                    <Badge color="green">{achievement.achievement?.points || 0} pts</Badge>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>
        </Tabs>
      )}
    </div>
  );
}

export default Achievements;
