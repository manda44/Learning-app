import { useState, useEffect } from 'react';
import { Container, Card, Text, Button, Badge, Group, SimpleGrid, Loader, Center, Alert, Progress, Box } from '@mantine/core';
import { IconBook, IconTrophy, IconClock, IconBriefcase, IconPlayerPlay, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useStudentStore from '../store/studentStore';
import { getUserInfo } from '../services/authService';
import { courseService } from '../services/courseService';

const COURSE_COLORS: { [key: string]: { bg: string; icon: React.ReactNode } } = {
  'Python': { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '🐍' },
  'JavaScript': { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', icon: '📘' },
  'Web': { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', icon: '🌐' },
  'Database': { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', icon: '🗄️' },
  'React': { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', icon: '⚛️' },
  'Git': { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', icon: '🔗' },
};

export function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Mon Étudiant');
  const [selectedFilter, setSelectedFilter] = useState('Tous les cours');
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

  const { coursesWithEnrollment, enrollments, fetchAllCoursesWithEnrollment, coursesLoading, coursesError, fetchStudentPoints } = useStudentStore();

  useEffect(() => {
    const userInfo = getUserInfo();
    // Fetch all courses with enrollment status from API (Student ID = 1)
    const STUDENT_ID = 1;
    fetchAllCoursesWithEnrollment(STUDENT_ID);

    if (userInfo) {
      setUserName(userInfo.firstName + ' ' + userInfo.lastName);
      fetchStudentPoints();
    }
  }, [fetchAllCoursesWithEnrollment, fetchStudentPoints]);

  useEffect(() => {
    if (selectedFilter === 'Tous les cours') {
      setFilteredCourses(coursesWithEnrollment);
    } else if (selectedFilter === 'En cours') {
      setFilteredCourses(coursesWithEnrollment.filter(c => c.isEnrolled && c.status === 'active'));
    } else if (selectedFilter === 'Non commencés') {
      setFilteredCourses(coursesWithEnrollment.filter(c => !c.isEnrolled));
    } else if (selectedFilter === 'Terminés') {
      setFilteredCourses(coursesWithEnrollment.filter(c => c.isEnrolled && c.status === 'completed'));
    } else {
      setFilteredCourses(coursesWithEnrollment.filter(c => c.title.includes(selectedFilter)));
    }
  }, [selectedFilter, coursesWithEnrollment]);

  const getCourseColor = (title: string) => {
    for (const [key, value] of Object.entries(COURSE_COLORS)) {
      if (title.includes(key)) {
        return value;
      }
    }
    return { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', icon: '📚' };
  };

  const getEnrollmentStatus = (courseId: number) => {
    const course = coursesWithEnrollment.find(c => c.courseId === courseId);
    if (!course || !course.isEnrolled) return { status: 'notEnrolled', progress: 0 };
    return { status: course.status || 'active', progress: course.progressPercentage || 0 };
  };

  const handleStartCourse = async (courseId: number) => {
    try {
      setEnrollingCourseId(courseId);
      const userInfo = getUserInfo();
      const STUDENT_ID = userInfo?.id || 1;

      // Enroll in the course
      await courseService.enrollInCourse(STUDENT_ID, courseId);

      // Refresh the courses list
      await fetchAllCoursesWithEnrollment(STUDENT_ID);

      // Navigate to course view
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Erreur lors de l\'inscription au cours');
    } finally {
      setEnrollingCourseId(null);
    }
  };

  const filterOptions = ['Tous les cours', 'En cours', 'Non commencés', 'Terminés', 'Python', 'JavaScript', 'Web'];

  return (
    <Container size="xl" py="xl" fluid style={{ maxWidth: '100%', paddingLeft: 0, paddingRight: 0 }}>
      {/* Welcome Banner */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #4A9FD8 0%, #2E7CB8 100%)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px',
          color: 'white',
          marginLeft: '16px',
          marginRight: '16px',
        }}
      >
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={700} mb="xs">
              Bienvenue, {userName} ! 👋
            </Text>
            <Text size="sm" c="rgba(255,255,255,0.9)">
              Continuez votre parcours d'apprentissage. Vous avez 2 cours en cours et 3 nouveaux qui disponibles.
            </Text>
          </div>
        </Group>
      </Box>

      {/* Statistics Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '32px' }}>
        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0' }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500} size="sm" c="dimmed">COURS EN COURS</Text>
            <IconBook size={24} style={{ color: '#4A9FD8' }} />
          </Group>
          <Text size="xl" fw={700}>{enrollments.filter(e => e.status === 'active').length}</Text>
          <Text size="xs" c="dimmed">2 à terminer cette semaine</Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0' }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500} size="sm" c="dimmed">QUIZ RÉUSSIS</Text>
            <IconTrophy size={24} style={{ color: '#51CF66' }} />
          </Group>
          <Text size="xl" fw={700}>18</Text>
          <Text size="xs" c="dimmed">Score moyen: 87%</Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0' }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500} size="sm" c="dimmed">MINI-PROJETS</Text>
            <IconBriefcase size={24} style={{ color: '#FF922B' }} />
          </Group>
          <Text size="xl" fw={700}>4</Text>
          <Text size="xs" c="dimmed">2 en cours</Text>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0' }}>
          <Group justify="space-between" mb="sm">
            <Text fw={500} size="sm" c="dimmed">TEMPS D'ÉTUDE</Text>
            <IconClock size={24} style={{ color: '#A78BFA' }} />
          </Group>
          <Text size="xl" fw={700}>45h</Text>
          <Text size="xs" c="dimmed">Ce mois-ci</Text>
        </Card>
      </SimpleGrid>

      {/* Quick Actions */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md" style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '32px' }}>
        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Group gap="md">
            <div style={{ fontSize: '24px' }}>🤖</div>
            <div>
              <Text fw={500}>Assistant IA</Text>
              <Text size="xs" c="dimmed">Posez une question</Text>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Group gap="md">
            <div style={{ fontSize: '24px' }}>✅</div>
            <div>
              <Text fw={500}>Quiz disponibles</Text>
              <Text size="xs" c="dimmed">3 nouveaux quizs</Text>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Group gap="md">
            <div style={{ fontSize: '24px' }}>🔗</div>
            <div>
              <Text fw={500}>Git Repositories</Text>
              <Text size="xs" c="dimmed">Gérez vos projets</Text>
            </div>
          </Group>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" style={{ border: '1px solid #e0e0e0', cursor: 'pointer', transition: 'all 0.2s' }}>
          <Group gap="md">
            <div style={{ fontSize: '24px' }}>📈</div>
            <div>
              <Text fw={500}>Progression</Text>
              <Text size="xs" c="dimmed">Voir mes stats</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Filter Tabs */}
      <Box style={{ paddingLeft: '16px', paddingRight: '16px', marginBottom: '24px' }}>
        <Group gap="xs" wrap="wrap">
          {filterOptions.map((filter) => (
            <Button
              key={filter}
              size="sm"
              variant={selectedFilter === filter ? 'filled' : 'default'}
              color={selectedFilter === filter ? 'blue' : 'gray'}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
            </Button>
          ))}
        </Group>
      </Box>

      {/* Courses Grid */}
      <Box style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        <Text size="lg" fw={700} mb="lg">Mes Cours Disponibles</Text>

        {coursesLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : coursesError ? (
          <Alert color="red" title="Erreur">
            {coursesError}
          </Alert>
        ) : filteredCourses.length === 0 ? (
          <Alert color="blue" title="Aucun cours">
            Aucun cours ne correspond à votre recherche.
          </Alert>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {filteredCourses.map((course) => {
              const enrollment = getEnrollmentStatus(course.courseId);
              const colors = getCourseColor(course.title);

              return (
                <Card key={course.courseId} shadow="sm" padding="0" radius="md" withBorder style={{ overflow: 'hidden' }}>
                  {/* Course Header with Gradient */}
                  <Box
                    style={{
                      background: colors.bg,
                      height: '160px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                    }}
                  >
                    {colors.icon}
                  </Box>

                  {/* Course Info */}
                  <Box p="lg">
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} size="sm" lineClamp={2}>
                        {course.title}
                      </Text>
                      <Badge
                        size="sm"
                        color={enrollment.status === 'completed' ? 'green' : enrollment.status === 'active' ? 'blue' : 'gray'}
                      >
                        {enrollment.status === 'notEnrolled' ? 'NOUVEAU' : enrollment.status === 'active' ? 'EN COURS' : 'TERMINÉ'}
                      </Badge>
                    </Group>

                    <Text size="xs" c="dimmed" mb="md" lineClamp={2}>
                      {course.description}
                    </Text>

                    {/* Progress Bar */}
                    {enrollment.status !== 'notEnrolled' && (
                      <>
                        <Group justify="space-between" mb="xs">
                          <Text size="xs" fw={500}>Progression</Text>
                          <Text size="xs" fw={600}>{enrollment.progress}%</Text>
                        </Group>
                        <Progress value={enrollment.progress} color="blue" size="sm" mb="md" />
                      </>
                    )}

                    {/* Course Meta */}
                    <Group gap="xs" mb="md">
                      <Text size="xs" c="dimmed">
                        📚 {course.duration || 20} heures
                      </Text>
                      <Text size="xs" c="dimmed">
                        ⏱️ {Math.ceil((course.duration || 20) * 1.5)} h 30min
                      </Text>
                    </Group>

                    {/* Action Buttons */}
                    {enrollment.status === 'notEnrolled' ? (
                      <Button
                        fullWidth
                        size="md"
                        color="blue"
                        variant="filled"
                        leftSection={<IconPlayerPlay size={18} />}
                        rightSection={<IconArrowRight size={18} />}
                        loading={enrollingCourseId === course.courseId}
                        onClick={() => handleStartCourse(course.courseId)}
                      >
                        Commencer
                      </Button>
                    ) : enrollment.status === 'completed' ? (
                      <Button
                        fullWidth
                        size="md"
                        color="green"
                        variant="filled"
                        leftSection={<IconPlayerPlay size={18} />}
                        rightSection={<IconArrowRight size={18} />}
                        onClick={() => navigate(`/courses/${course.courseId}`)}
                      >
                        Revoir
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        size="md"
                        color="blue"
                        variant="filled"
                        leftSection={<IconPlayerPlay size={18} />}
                        rightSection={<IconArrowRight size={18} />}
                        onClick={() => navigate(`/courses/${course.courseId}`)}
                      >
                        Continuer
                      </Button>
                    )}
                  </Box>
                </Card>
              );
            })}
          </SimpleGrid>
        )}
      </Box>
    </Container>
  );
}

export default Dashboard;
