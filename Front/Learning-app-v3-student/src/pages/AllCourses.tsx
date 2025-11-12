import { useState, useEffect } from 'react';
import { Container, Card, Text, Button, Badge, Group, Input, Select, SimpleGrid, Loader, Center, Alert } from '@mantine/core';
import { IconSearch, IconBook } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import useStudentStore from '../store/studentStore';
import type { CourseWithEnrollment } from '../services/courseService';

export function AllCourses() {
  const navigate = useNavigate();
  // Fixed StudentId = 1 for static enrollment display
  const STUDENT_ID = 1;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithEnrollment[]>([]);
  const { coursesWithEnrollment, coursesLoading, coursesError, fetchAllCoursesWithEnrollment, enrollCourse } = useStudentStore();
  const [enrollingId, setEnrollingId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch all courses with enrollment status for student ID 1
    // Always fetch fresh from API, don't use cached data
    fetchAllCoursesWithEnrollment(STUDENT_ID);
  }, [STUDENT_ID, fetchAllCoursesWithEnrollment]);

  useEffect(() => {
    let filtered = coursesWithEnrollment;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        course =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by level
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  }, [coursesWithEnrollment, searchQuery, selectedLevel]);

  const isEnrolled = (courseId: number) => {
    const course = coursesWithEnrollment.find(c => c.courseId === courseId);
    return course?.isEnrolled ?? false;
  };

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    try {
      await enrollCourse(STUDENT_ID, courseId);
    } finally {
      setEnrollingId(null);
    }
  };

  return (
    <div style={{ width: '100%', padding: '1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Text size="xl" fw={700} mb="lg">Tous les cours disponibles</Text>
        <Text c="dimmed" size="sm">Découvrez et inscrivez-vous à nos cours</Text>
      </div>

      {/* Filters */}
      <Card shadow="sm" padding="lg" radius="md" withBorder mb="xl">
        <Group grow>
          <Input
            placeholder="Rechercher un cours..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />
          <Select
            placeholder="Filtrer par niveau"
            clearable
            searchable
            data={[
              { value: 'Beginner', label: 'Débutant' },
              { value: 'Intermediate', label: 'Intermédiaire' },
              { value: 'Advanced', label: 'Avancé' },
            ]}
            value={selectedLevel}
            onChange={setSelectedLevel}
          />
        </Group>
      </Card>

      {/* Error Display */}
      {coursesError && (
        <Alert icon={<IconBook size={16} />} title="Erreur" color="red" mb="xl">
          {coursesError}
        </Alert>
      )}

      {/* Loading State */}
      {coursesLoading ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : filteredCourses.length === 0 ? (
        <Alert icon={<IconBook size={16} />} title="Aucun cours trouvé" color="blue">
          Aucun cours ne correspond à vos critères de recherche.
        </Alert>
      ) : (
        /* Courses Grid */
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {filteredCourses.map(course => (
            <Card key={course.courseId} shadow="sm" padding="lg" radius="md" withBorder style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Course Image or Placeholder */}
              <Card.Section withBorder inheritPadding py="md" style={{ backgroundColor: '#f0f7ff', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {course.image ? (
                  <img src={course.image} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <IconBook size={64} color="#4A9FD8" />
                )}
              </Card.Section>

              <Card.Section inheritPadding py="md" style={{ flex: 1 }}>
                <Group justify="space-between" mb="xs">
                  <Text fw={700} lineClamp={2}>{course.title}</Text>
                  <Badge color="blue" variant="light">{course.level}</Badge>
                </Group>
                <Text size="sm" c="dimmed" lineClamp={3} mb="md">
                  {course.description}
                </Text>
                <Group justify="space-between" mt="md">
                  <Group gap="xs">
                    <Text size="sm" c="dimmed">📚 {course.duration} heures</Text>
                  </Group>
                </Group>
              </Card.Section>

              <Card.Section inheritPadding py="md" style={{ borderTop: '1px solid #eee' }}>
                <Group grow>
                  {isEnrolled(course.courseId) ? (
                    <Button fullWidth color="blue" onClick={() => navigate(`/courses/${course.courseId}`)}>
                      Continuer
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      color="blue"
                      onClick={() => handleEnroll(course.courseId)}
                      loading={enrollingId === course.courseId}
                    >
                      S'inscrire
                    </Button>
                  )}
                  <Button fullWidth color="gray" variant="light" onClick={() => navigate(`/courses/${course.courseId}`)}>
                    Voir
                  </Button>
                </Group>
              </Card.Section>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}

export default AllCourses;
