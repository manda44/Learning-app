import { Container, Paper, TextInput, PasswordInput, Button, Group, Stack, Center, Title, Text, Divider, ThemeIcon } from '@mantine/core';
import { IconSchool } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      // Redirection après succès
      navigate('/course');
    } catch (err) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Container size="md" style={{ width: '100%', maxWidth: '650px' }}>
        <Paper radius="lg" p={80} shadow="xl" style={{ backgroundColor: '#ffffff', minHeight: '750px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
          {/* Logo et titre */}
          <Center mb={30}>
            <Stack align="center" gap={15}>
              <ThemeIcon
                size={60}
                radius="md"
                variant="gradient"
                gradient={{ from: '#6366f1', to: '#a855f7' }}
              >
                <IconSchool size={36} />
              </ThemeIcon>
              <div>
                <Title order={2} size="h3" weight={700} align="center">
                  Mantinee
                </Title>
                <Text size="sm" color="dimmed" align="center">
                  Plateforme de modules en compliance
                </Text>
              </div>
            </Stack>
          </Center>

          <Divider my="lg" />

          {/* Bouton GitHub */}
          <Button
            fullWidth
            size="md"
            variant="filled"
            color="dark"
            leftSection={<span>🔗</span>}
            mb="lg"
          >
            Continuer avec GitHub
          </Button>

          <Divider
            label="ou"
            labelPosition="center"
            my="lg"
          />

          {/* Formulaire de connexion */}
          <form onSubmit={handleLogin}>
            <Stack gap="md">
              {error && (
                <Text color="red" size="sm" align="center">
                  {error}
                </Text>
              )}

              <TextInput
                label="Adresse email"
                placeholder="votre.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                size="md"
                disabled={loading}
              />

              <PasswordInput
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                size="md"
                disabled={loading}
                visibilityToggleButtonProps={{
                  srOnlyOnActive: true,
                }}
              />

              <Group justify="center">
                <Button
                  component="a"
                  href="#"
                  variant="subtle"
                  size="xs"
                  color="blue"
                >
                  Mot de passe oublié ?
                </Button>
              </Group>

              <Button
                fullWidth
                size="md"
                type="submit"
                loading={loading}
                disabled={loading}
              >
                Se connecter
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </div>
  );
}
