import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Grid,
  Text,
  Button,
  Group,
  Stack,
  Avatar,
  TextInput,
  PasswordInput,
  Select,
  Textarea,
  Badge,
  Divider,
  Alert,
  SimpleGrid,
  Card,
  Progress,
  ThemeIcon,
  Center,
} from '@mantine/core';
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconShield,
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconX,
  IconBook,
  IconTrophy,
  IconAward,
} from '@tabler/icons-react';
import { getUserInfo } from '../services/authService';
import useStudentStore from '../store/studentStore';
import type { User } from '../../types/User';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { enrollments } = useStudentStore();

  // Load user info on mount
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setUser(userInfo);
      setFormData({
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phone: '',
        address: '',
        bio: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setMessage({ type: 'error', text: 'Le prénom et le nom sont obligatoires' });
        setIsSaving(false);
        return;
      }

      // Simulate API call - in real scenario, call your backend API
      // const response = await updateUserProfile(user?.userId, formData);

      // For now, update localStorage
      const updatedUser = {
        ...user!,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      };

      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });

      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Tous les champs de mot de passe sont obligatoires' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call - in real scenario, call your backend API
      // const response = await changePassword(user?.userId, formData.currentPassword, formData.newPassword);

      setMessage({ type: 'success', text: 'Mot de passe changé avec succès' });
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du changement de mot de passe' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <Container py="xl">
        <Center py="xl">
          <Text>Chargement du profil...</Text>
        </Center>
      </Container>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const courseProgress = enrollments.length > 0
    ? Math.round((enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100)
    : 0;

  return (
    <Container size="lg" py="xl">
      {/* Messages d'alerte */}
      {message && (
        <Alert
          icon={message.type === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
          color={message.type === 'success' ? 'green' : 'red'}
          mb="md"
        >
          {message.text}
        </Alert>
      )}

      {/* En-tête avec profil */}
      <Paper p="xl" radius="lg" withBorder mb="xl" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar
              size={80}
              radius="xl"
              color="blue"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              {getInitials(user.firstName, user.lastName)}
            </Avatar>
            <Stack gap="xs">
              <Text size="lg" fw={700} c="white">
                {user.firstName} {user.lastName}
              </Text>
              <Group gap="xs">
                <Badge color="white" c="blue" size="lg">
                  {user.roles?.[0]?.roleName || 'Étudiant'}
                </Badge>
              </Group>
              <Text size="sm" c="rgba(255,255,255,0.8)">
                Membre depuis {user.creationDate ? new Date(user.creationDate).toLocaleDateString('fr-FR') : 'N/A'}
              </Text>
            </Stack>
          </Group>
          {!isEditing && (
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => setIsEditing(true)}
              color="white"
              c="blue"
            >
              Modifier le profil
            </Button>
          )}
        </Group>
      </Paper>

      {/* Statistiques */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} mb="xl">
        <Card withBorder radius="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm" c="dimmed">
              Cours suivis
            </Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconBook size={18} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            {enrollments.length}
          </Text>
          <Progress value={courseProgress} mt="md" />
          <Text size="xs" c="dimmed" mt="xs">
            {Math.round(courseProgress)}% complétés
          </Text>
        </Card>

        <Card withBorder radius="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm" c="dimmed">
              Badges gagnés
            </Text>
            <ThemeIcon color="yellow" variant="light" size="lg" radius="md">
              <IconTrophy size={18} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            0
          </Text>
          <Text size="xs" c="dimmed" mt="md">
            Continuez vos efforts !
          </Text>
        </Card>

        <Card withBorder radius="lg">
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm" c="dimmed">
              Points totaux
            </Text>
            <ThemeIcon color="green" variant="light" size="lg" radius="md">
              <IconAward size={18} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            0
          </Text>
          <Text size="xs" c="dimmed" mt="md">
            À accumuler
          </Text>
        </Card>
      </SimpleGrid>

      <Grid>
        {/* Informations personnelles */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="lg" withBorder>
            <Group justify="space-between" mb="lg">
              <Group gap="xs">
                <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                  <IconUser size={18} />
                </ThemeIcon>
                <Text fw={600} size="lg">
                  Informations personnelles
                </Text>
              </Group>
            </Group>

            <Stack gap="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Prénom"
                    placeholder="Votre prénom"
                    icon={<IconUser size={16} />}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.currentTarget.value)}
                    disabled={!isEditing}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label="Nom"
                    placeholder="Votre nom"
                    icon={<IconUser size={16} />}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.currentTarget.value)}
                    disabled={!isEditing}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                label="Email"
                placeholder="votre.email@example.com"
                icon={<IconMail size={16} />}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.currentTarget.value)}
                disabled={!isEditing}
              />

              <TextInput
                label="Téléphone (optionnel)"
                placeholder="+33 6 XX XX XX XX"
                icon={<IconPhone size={16} />}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.currentTarget.value)}
                disabled={!isEditing}
              />

              <TextInput
                label="Adresse (optionnel)"
                placeholder="Votre adresse"
                icon={<IconMapPin size={16} />}
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.currentTarget.value)}
                disabled={!isEditing}
              />

              <Textarea
                label="Biographie (optionnel)"
                placeholder="Parlez de vous..."
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.currentTarget.value)}
                disabled={!isEditing}
                rows={4}
              />

              {isEditing && (
                <Group justify="flex-end" pt="md">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    leftSection={<IconX size={16} />}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    loading={isSaving}
                    leftSection={<IconCheck size={16} />}
                  >
                    Enregistrer
                  </Button>
                </Group>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Sécurité */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="lg" withBorder>
            <Group gap="xs" mb="lg">
              <ThemeIcon color="red" variant="light" size="lg" radius="md">
                <IconShield size={18} />
              </ThemeIcon>
              <Text fw={600} size="lg">
                Sécurité
              </Text>
            </Group>

            <Stack gap="md">
              <Alert icon={<IconAlertCircle size={16} />} color="yellow">
                Changez régulièrement votre mot de passe pour la sécurité de votre compte.
              </Alert>

              <Divider />

              <Text fw={600} size="sm">
                Changer le mot de passe
              </Text>

              <PasswordInput
                label="Mot de passe actuel"
                placeholder="Entrez votre mot de passe actuel"
                value={formData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.currentTarget.value)}
              />

              <PasswordInput
                label="Nouveau mot de passe"
                placeholder="Entrez un nouveau mot de passe (min. 8 caractères)"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.currentTarget.value)}
              />

              <PasswordInput
                label="Confirmer le mot de passe"
                placeholder="Confirmez le nouveau mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.currentTarget.value)}
              />

              <Button
                onClick={handleChangePassword}
                loading={isSaving}
                color="red"
                variant="light"
              >
                Changer le mot de passe
              </Button>

              <Divider />

              <Text fw={600} size="sm">
                Authentification à deux facteurs
              </Text>
              <Button variant="outline" disabled>
                Activer l'authentification 2FA (Bientôt disponible)
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Préférences */}
      <Paper p="lg" radius="lg" withBorder mt="xl">
        <Group gap="xs" mb="lg">
          <IconUser size={18} />
          <Text fw={600} size="lg">
            Préférences
          </Text>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Langue"
              placeholder="Sélectionnez une langue"
              data={[
                { value: 'fr', label: 'Français' },
                { value: 'en', label: 'English' },
              ]}
              defaultValue="fr"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label="Notifications par email"
              placeholder="Sélectionnez une fréquence"
              data={[
                { value: 'all', label: 'Toutes les notifications' },
                { value: 'important', label: 'Important seulement' },
                { value: 'none', label: 'Aucune notification' },
              ]}
              defaultValue="all"
            />
          </Grid.Col>
        </Grid>

        <Group justify="flex-end" pt="md">
          <Button>Enregistrer les préférences</Button>
        </Group>
      </Paper>
    </Container>
  );
}
