import { useEffect, useState } from 'react';
import { Container, Grid, Card, Text, Badge, Button, Group, Stack, Title } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import type { StudentProjectEnrollment } from '../services/miniProjectService';
import { getStudentEnrollments } from '../services/miniProjectService';

const MiniProjects = () => {
  const [enrollments, setEnrollments] = useState<StudentProjectEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const studentId = 1; // Static student ID for now
  const navigate = useNavigate();

  useEffect(() => {
    if (studentId) {
      loadEnrollments();
    }
  }, [studentId]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await getStudentEnrollments(studentId!);
      setEnrollments(data);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue';
      case 'completed': return 'green';
      case 'submitted': return 'yellow';
      default: return 'gray';
    }
  };

  if (loading) {
    return <Container><Text>Loading...</Text></Container>;
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Title order={1}>Mes Mini-Projets</Title>
        
        <Grid>
          {enrollments.map((enrollment) => (
            <Grid.Col key={enrollment.projectEnrollmentId} span={{ base: 12, sm: 6, md: 4 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Title order={3}>{enrollment.miniProject?.title}</Title>
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {enrollment.miniProject?.description}
                  </Text>
                  
                  <Group justify="apart">
                    <Badge color={getStatusColor(enrollment.status)}>
                      {enrollment.status}
                    </Badge>
                    <Text size="sm" fw={500}>
                      {enrollment.progressPercentage}%
                    </Text>
                  </Group>

                  <Text size="xs" c="dimmed">
                    {enrollment.ticketProgresses?.filter(tp => tp.status === 'completed' || tp.status === 'validated').length || 0} / {enrollment.ticketProgresses?.length || 0} tickets complétés
                  </Text>

                  <Button 
                    fullWidth 
                    onClick={() => navigate(`/mini-projects/${enrollment.miniProjectId}`)}
                  >
                    Voir le projet
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {enrollments.length === 0 && (
          <Card padding="xl">
            <Text ta="center" c="dimmed">
              Vous n'êtes inscrit à aucun mini-projet pour le moment.
            </Text>
          </Card>
        )}
      </Stack>
    </Container>
  );
};

export default MiniProjects;
