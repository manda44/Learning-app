import { Container, Paper, TextInput, PasswordInput, Button, Group, Stack, Center, Title, Text, Divider } from '@mantine/core';
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
      background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
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
              <img
                src="/logos/dtc-logo.jpg"
                alt="Learning App Logo"
                style={{ width: '100px', height: '100px', borderRadius: '12px' }}
              />
              <div>
                <Title order={2} size="h3" weight={700} align="center" style={{ color: '#0D47A1' }}>
                  Learning App
                </Title>
                <Text size="sm" color="dimmed" align="center">
                  Plateforme d'apprentissage en ligne
                </Text>
              </div>
            </Stack>
          </Center>

          <Divider my="lg" style={{ borderColor: '#4A9FD8' }} />

          {/* Bouton GitHub */}
          <Button
            fullWidth
            size="md"
            variant="filled"
            color="orange"
            leftSection={<span>🔗</span>}
            mb="lg"
          >
            Continuer avec GitHub
          </Button>

          <Divider
            label="ou"
            labelPosition="center"
            my="lg"
            style={{ borderColor: '#E8F4FD' }}
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
