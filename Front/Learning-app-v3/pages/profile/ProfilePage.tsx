import { useState, useEffect } from 'react';
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Card,
  Avatar,
  Badge,
  Button,
  TextInput,
  Modal,
  Divider,
  Paper,
  Grid,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import { IconEdit, IconCamera, IconMail, IconPhone, IconMapPin, IconCalendar, IconLogout } from '@tabler/icons-react';
import { getUserInfo, logoutUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  firstName: string;
  lastName: string;
  email?: string;
  role?: string;
  avatar?: string;
  joinDate?: string;
  phone?: string;
  location?: string;
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      // Determine role based on email domain or default to "Utilisateur"
      const role = 'Administrateur';

      const profile: UserProfile = {
        firstName: userInfo.firstName || 'Utilisateur',
        lastName: userInfo.lastName || '',
        email: userInfo.email || 'email@example.com',
        role: role,
        joinDate: new Date().toLocaleDateString('fr-FR'),
        phone: '+33 6 12 34 56 78',
        location: 'Paris, France'
      };
      setUserProfile(profile);
      setFormData(profile);
    }
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const handleEditSubmit = () => {
    // Update profile logic here
    setUserProfile({ ...formData });
    setEditModalOpen(false);
  };

  if (!userProfile) {
    return (
      <Container py="xl">
        <Text>Chargement...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Paper shadow="md" radius="lg" p="xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Group justify="space-between" align="flex-start">
            <Group gap="lg" align="flex-start">
              <div style={{ position: 'relative' }}>
                <Avatar
                  src={userProfile.avatar}
                  size={120}
                  radius={120}
                  name={`${userProfile.firstName} ${userProfile.lastName}`}
                  color="blue"
                  style={{
                    border: '4px solid white',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }}
                />
                <Tooltip label="Changer la photo">
                  <ActionIcon
                    size="lg"
                    radius="xl"
                    variant="filled"
                    color="white"
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <IconCamera size={20} color="#667eea" stroke={2} />
                  </ActionIcon>
                </Tooltip>
              </div>
              <Stack gap="xs">
                <div>
                  <Title size="h2" c="white">
                    {userProfile.firstName} {userProfile.lastName}
                  </Title>
                  <Text size="lg" c="rgba(255,255,255,0.9)" fw={500}>
                    {userProfile.role}
                  </Text>
                </div>
                <Group gap="xs">
                  <Badge size="lg" variant="light" c="white" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                    Membre depuis {userProfile.joinDate?.split(' ')[2]}
                  </Badge>
                </Group>
              </Stack>
            </Group>
            <Tooltip label="Modifier le profil">
              <ActionIcon
                size="lg"
                radius="xl"
                variant="light"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                onClick={() => setEditModalOpen(true)}
              >
                <IconEdit size={24} stroke={2} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>

        {/* Profile Information Grid */}
        <Grid gutter="lg">
          {/* Contact Information */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" radius="lg" padding="lg">
              <Stack gap="lg">
                <div>
                  <Title order={3} mb="lg" fw={600}>
                    Informations de contact
                  </Title>
                  <Divider />
                </div>

                <Group gap="md">
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconMail size={24} color="white" />
                  </div>
                  <Stack gap={2}>
                    <Text size="sm" c="dimmed" fw={500}>EMAIL</Text>
                    <Text fw={500}>{userProfile.email}</Text>
                  </Stack>
                </Group>

                <Group gap="md">
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconPhone size={24} color="white" />
                  </div>
                  <Stack gap={2}>
                    <Text size="sm" c="dimmed" fw={500}>TÉLÉPHONE</Text>
                    <Text fw={500}>{userProfile.phone}</Text>
                  </Stack>
                </Group>

                <Group gap="md">
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconMapPin size={24} color="white" />
                  </div>
                  <Stack gap={2}>
                    <Text size="sm" c="dimmed" fw={500}>LOCALISATION</Text>
                    <Text fw={500}>{userProfile.location}</Text>
                  </Stack>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Account Information */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" radius="lg" padding="lg">
              <Stack gap="lg">
                <div>
                  <Title order={3} mb="lg" fw={600}>
                    Informations du compte
                  </Title>
                  <Divider />
                </div>

                <Group gap="md">
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconCalendar size={24} color="white" />
                  </div>
                  <Stack gap={2}>
                    <Text size="sm" c="dimmed" fw={500}>DATE D'INSCRIPTION</Text>
                    <Text fw={500}>{userProfile.joinDate}</Text>
                  </Stack>
                </Group>

                <Group gap="md">
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Badge size="lg" variant="light" style={{ color: 'white' }}>
                      {userProfile.role?.charAt(0).toUpperCase()}
                    </Badge>
                  </div>
                  <Stack gap={2}>
                    <Text size="sm" c="dimmed" fw={500}>RÔLE</Text>
                    <Text fw={500}>{userProfile.role}</Text>
                  </Stack>
                </Group>

                <Divider my="lg" />

                <Button
                  fullWidth
                  color="red"
                  variant="light"
                  leftSection={<IconLogout size={18} />}
                  onClick={handleLogout}
                  size="md"
                >
                  Se déconnecter
                </Button>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Edit Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Modifier le profil"
        size="lg"
        centered
      >
        <Stack gap="lg">
          <TextInput
            label="Prénom"
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.currentTarget.value })}
            placeholder="Votre prénom"
          />
          <TextInput
            label="Nom"
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.currentTarget.value })}
            placeholder="Votre nom"
          />
          <TextInput
            label="Email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.currentTarget.value })}
            placeholder="votre.email@example.com"
          />
          <TextInput
            label="Téléphone"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.currentTarget.value })}
            placeholder="+33 6 12 34 56 78"
          />
          <TextInput
            label="Localisation"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.currentTarget.value })}
            placeholder="Votre localisation"
          />
          <Group justify="flex-end" gap="md">
            <Button variant="light" onClick={() => setEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSubmit}>
              Enregistrer
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
