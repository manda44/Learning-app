import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Grid,
  Avatar,
  Progress
} from '@mantine/core';
import {
  IconUsers,
  IconBook,
  IconBriefcase,
  IconCheck
} from '@tabler/icons-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data
const dashboardStats = {
  totalUsers: 156,
  activeCourses: 23,
  miniProjects: 89,
  validatedTickets: 342
};

const userProgressionData = [
  { month: 'Jan', active: 65, completed: 30 },
  { month: 'Fev', active: 70, completed: 35 },
  { month: 'Mar', active: 75, completed: 38 },
  { month: 'Avr', active: 80, completed: 42 },
  { month: 'Mai', active: 85, completed: 45 },
  { month: 'Jun', active: 88, completed: 50 },
  { month: 'Jul', active: 90, completed: 52 }
];

const monthlyActivityData = [
  { month: 'Lun', completions: 45, incomplete: 20 },
  { month: 'Mar', completions: 55, incomplete: 18 },
  { month: 'Mer', completions: 40, incomplete: 25 },
  { month: 'Jeu', completions: 65, incomplete: 15 },
  { month: 'Ven', completions: 75, incomplete: 12 },
  { month: 'Sam', completions: 25, incomplete: 30 },
  { month: 'Dim', completions: 20, incomplete: 35 }
];

const popularCourses = [
  { name: 'JavaScript Avancé', progress: 85, color: 'blue' },
  { name: 'React Fundamentals', progress: 77, color: 'green' },
  { name: 'Node.js Backend', progress: 58, color: 'yellow' },
  { name: 'Git & GitHub', progress: 95, color: 'cyan' }
];

interface StatCardProps {
  value: number | string;
  label: string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard = ({ value, label, icon, color = 'blue' }: StatCardProps) => (
  <Card withBorder padding="md" radius="md" className="stat-card">
    <Group justify="apart" mb="md">
      <Stack gap={0} flex={1}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
          {label}
        </Text>
        <Text size="xl" fw={700} c={color}>
          {value}
        </Text>
      </Stack>
      <Avatar
        color={color}
        radius="md"
        size="lg"
        style={{ backgroundColor: `var(--mantine-color-${color}-6)` }}
      >
        {icon}
      </Avatar>
    </Group>
  </Card>
);

const AdminDashboard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Container size="100%" py="xl" px="lg">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1} size="h2" mb="xs">
            Tableau de bord
          </Title>
          <Text c="dimmed">Aperçu des statistiques et activités de la plateforme</Text>
        </div>

        {/* Stats Cards */}
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              value={dashboardStats.totalUsers}
              label="Utilisateurs totaux"
              icon={<IconUsers size={20} />}
              color="blue"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              value={dashboardStats.activeCourses}
              label="Cours actifs"
              icon={<IconBook size={20} />}
              color="green"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              value={dashboardStats.miniProjects}
              label="Mini-projets créés"
              icon={<IconBriefcase size={20} />}
              color="orange"
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard
              value={dashboardStats.validatedTickets}
              label="Tickets résolus"
              icon={<IconCheck size={20} />}
              color="teal"
            />
          </Grid.Col>
        </Grid>

        {/* Charts Section */}
        <Grid gutter="lg">
          {/* Progression des utilisateurs */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Title order={3} size="h4" mb="lg">
                Progression des utilisateurs
              </Title>
              {mounted && (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={userProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="active"
                      stroke="#4294ff"
                      strokeWidth={2}
                      name="Étudiants actif"
                      dot={{ fill: '#4294ff', r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="completed"
                      stroke="#51cf66"
                      strokeWidth={2}
                      name="Cours complétés"
                      dot={{ fill: '#51cf66', r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>
          </Grid.Col>

          {/* Cours populaires */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card withBorder padding="lg" radius="md" h="100%">
              <Title order={3} size="h4" mb="lg">
                Cours populaires
              </Title>
              <Stack gap="md">
                {popularCourses.map((course, index) => (
                  <div key={index}>
                    <Group justify="apart" mb={4}>
                      <Text size="sm" fw={500}>
                        {course.name}
                      </Text>
                      <Text size="sm" fw={600} c={course.color}>
                        {course.progress}%
                      </Text>
                    </Group>
                    <Progress value={course.progress} color={course.color} size="md" radius="md" />
                  </div>
                ))}
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Monthly Activity */}
        <Card withBorder padding="lg" radius="md">
          <Title order={3} size="h4" mb="lg">
            Activité mensuelle
          </Title>
          {mounted && (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <Legend />
                <Bar dataKey="completions" fill="#4294ff" name="Complétion" />
                <Bar dataKey="incomplete" fill="#51cf66" name="Non complétés" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </Stack>
    </Container>
  );
};

export default AdminDashboard;
