import { AppShell, Burger, Group, NavLink, Input, ActionIcon, useMantineColorScheme, Modal, Stack, TextInput, Button, PasswordInput, Notification } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {IconSearch, IconBrightnessDown, IconBell, IconMessageFilled, IconUserCircle, IconLogout, IconSun, IconMoon } from '@tabler/icons-react';
import {
      IconSettings,
      IconUser as IconUserProfile,
      IconMessageCircle,
      IconLock,
      IconChevronDown,
      IconLayoutDashboard,
      IconVocabulary,
      IconUser,
      IconChartDots2,
      IconBrandTrello,
      IconSettingsCog,
      IconSchool,
      IconCheckupList,
} from '@tabler/icons-react';
import { Menu,Text, Container, Anchor, Breadcrumbs } from '@mantine/core';
import ModalMessage from '../components/ModalMessages.tsx';
import ConfirmMessage from '../components/ConfirmMessage.tsx';
import { NotificationBell } from '../components/NotificationBell';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {useGeneralStore} from '../store/generalStore';
import { getUserInfo, logoutUser, changePassword } from '../services/authService';
import { useState, useEffect } from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Utilisateur');
  const [userId, setUserId] = useState<number>(0);
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // Password change modal state
  const [passwordModalOpened, setPasswordModalOpened] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordFormErrors, setPasswordFormErrors] = useState<Record<string, string>>({});
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // Initialize drawer state from localStorage
  const [opened, setOpened] = useState<boolean>(() => {
    const stored = localStorage.getItem('navbarOpened');
    return stored ? JSON.parse(stored) : true;
  });

  // Initialize color scheme from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('appColorScheme');
    if (saved === 'dark' || saved === 'light') {
      setColorScheme(saved);
    }
  }, []);

  // Update localStorage when drawer state changes
  const handleToggle = () => {
    const newState = !opened;
    setOpened(newState);
    localStorage.setItem('navbarOpened', JSON.stringify(newState));
  };

  // Handle theme toggle
  const handleThemeToggle = () => {
    const nextScheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(nextScheme);
    localStorage.setItem('appColorScheme', nextScheme);
  };

  // Get NavLink styling based on active state and theme
  const getNavLinkStyle = (active: boolean) => ({
    backgroundColor: active
      ? (colorScheme === 'dark' ? '#2d2d2d' : '#E8F4FD')
      : 'transparent',
    borderRadius: '8px',
    color: active
      ? (colorScheme === 'dark' ? '#4A9FD8' : '#0D47A1')
      : (colorScheme === 'dark' ? '#CCCCCC' : 'inherit'),
    fontWeight: active ? 600 : 400,
    transition: 'all 0.2s ease'
  });

  // Récupérer les informations de l'utilisateur au chargement
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setUserName(`${userInfo.firstName} ${userInfo.lastName}`);
      setUserId(userInfo.userId);
    }
  }, []);

  // Handle password change form submission
  const handlePasswordChangeSubmit = async () => {
    const errors: Record<string, string> = {};

    // Validation
    if (!passwordFormData.currentPassword) {
      errors.currentPassword = 'Le mot de passe actuel est requis';
    }
    if (!passwordFormData.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe est requis';
    }
    if (passwordFormData.newPassword.length < 8) {
      errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    if (passwordFormData.currentPassword === passwordFormData.newPassword) {
      errors.newPassword = 'Le nouveau mot de passe doit être différent du mot de passe actuel';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordFormErrors(errors);
      return;
    }

    // Call backend API to change password
    setPasswordChangeLoading(true);
    try {
      const response = await changePassword(
        passwordFormData.currentPassword,
        passwordFormData.newPassword,
        passwordFormData.confirmPassword
      );

      if (response.success) {
        setPasswordChangeSuccess(true);

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setPasswordChangeSuccess(false);
        }, 5000);

        // Close modal and reset form
        setTimeout(() => {
          setPasswordModalOpened(false);
          setPasswordFormData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setPasswordFormErrors({});
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe';
      setPasswordFormErrors({
        submit: errorMessage
      });
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const handlePasswordModalClose = () => {
    setPasswordModalOpened(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordFormErrors({});
  };

  // Fonction de déconnexion
  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  // Check if a path is active
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const breadcrumbs = useGeneralStore(state => state.breadCrumb).map((item, index) => (
            <Anchor component={Link} to={item.href} key={index}>
                  {item.title}
            </Anchor>
      ));
  return (
      <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
            layout="alt"
      >
            <AppShell.Header style={{
              background: colorScheme === 'dark'
                ? 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(90deg, #FFFFFF 0%, #F0F7FF 100%)',
              borderBottom: colorScheme === 'dark' ? '2px solid #3d3d3d' : '2px solid #E8F4FD',
              transition: 'all 0.3s ease'
            }}>
                  <Group h="100%" px="md" justify='space-between'>
                        <Group>
                              <Burger opened={opened} onClick={handleToggle} hiddenFrom="sm" size="sm" />
                              <IconSearch size={24} stroke={1.5} style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }} />
                                <Input placeholder="Rechercher..." styles={{ input: { background: colorScheme === 'dark' ? '#2d2d2d' : '#FFFFFF', color: colorScheme === 'dark' ? '#FFFFFF' : '#000000', borderColor: colorScheme === 'dark' ? '#3d3d3d' : '#E8F4FD' } }} />
                        </Group>
                          <Group gap='md'>
                                <ActionIcon
                                  onClick={handleThemeToggle}
                                  size={28}
                                  variant="subtle"
                                  title={colorScheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                                >
                                  {colorScheme === 'dark' ? <IconSun size={28} stroke={1.5} color="#FFD700" /> : <IconMoon size={28} stroke={1.5} />}
                                </ActionIcon>
                                {userId > 0 && <NotificationBell userId={userId} />}
                                <IconMessageFilled size={28} stroke={1.5} style={{ cursor: 'pointer', color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }} />
                              <Group gap='xs'>
                                <IconUserCircle size={28} stroke={1.5} style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }} />
                                <div>
                                  <Text size="sm" fw={500} style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}>{userName}</Text>
                                </div>
                              </Group>
                                <Menu shadow="md" width={250}>
                                      <Menu.Target>
                                            <IconChevronDown size={28} stroke={1.5} style={{ cursor: 'pointer', color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }} />
                                      </Menu.Target>

                                      <Menu.Dropdown>
                                            <Menu.Label>Mon compte</Menu.Label>
                                            <Menu.Item
                                                  leftSection={<IconUserProfile size={14} />}
                                                  onClick={() => navigate('/profile')}
                                            >
                                                  Mon profil
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconSettings size={14} />}>
                                                  Paramètres
                                            </Menu.Item>
                                            <Menu.Item
                                                  leftSection={<IconLock size={14} />}
                                                  onClick={() => setPasswordModalOpened(true)}
                                            >
                                                  Changer le mot de passe
                                            </Menu.Item>

                                            <Menu.Divider />

                                            <Menu.Label>Notifications</Menu.Label>
                                            <Menu.Item leftSection={<IconBell size={14} />}>
                                                  Mes notifications
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconMessageCircle size={14} />}>
                                                  Messages
                                            </Menu.Item>

                                            <Menu.Divider />

                                            <Menu.Item
                                                  color="red"
                                                  leftSection={<IconLogout size={14} />}
                                                  onClick={handleLogout}
                                            >
                                                  Se déconnecter
                                            </Menu.Item>
                                      </Menu.Dropdown>
                                </Menu>
                        </Group>
                  </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md" style={{
              background: colorScheme === 'dark'
                ? 'linear-gradient(180deg, #1a1a1a 0%, #242424 100%)'
                : 'linear-gradient(180deg, #F8FBFF 0%, #F0F7FF 100%)',
              transition: 'all 0.3s ease'
            }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: '20px',
                      padding: '8px',
                      background: colorScheme === 'dark'
                        ? 'linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)'
                        : 'linear-gradient(135deg, #E8F4FD 0%, #FFFFFF 100%)',
                      borderRadius: '12px',
                      border: colorScheme === 'dark' ? '1px solid #4d4d4d' : '1px solid #D0E8F5',
                      transition: 'all 0.3s ease'
                    }}>
                      <img
                        src="/logos/dtc-logo.jpg"
                        alt="Learning App Logo"
                        style={{ width: '45px', height: '45px', borderRadius: '8px' }}
                      />
                    </div>
                    <NavLink
                          component={Link}
                          to="/dashboard"
                          label="Tableau de bord"
                          leftSection={<IconLayoutDashboard size={26} stroke={1.5} />}
                          active={isActive('/dashboard') || isActive('/')}
                          style={getNavLinkStyle(isActive('/dashboard') || isActive('/'))}
                          mt='lg'
                    />
                    <NavLink
                          label="Cours & contenus"
                          leftSection={<IconVocabulary size={26} stroke={1.5} />}
                          childrenOffset={28}
                          defaultOpened={isActive('/course') || isActive('/chapter') || isActive('/quizPage')}
                    >
                          <NavLink
                                component={Link}
                                to="/course"
                                label="Cours"
                                active={isActive('/course')}
                                style={getNavLinkStyle(isActive('/course'))}
                          />
                          <NavLink
                                component={Link}
                                to="/chapter"
                                label="Chapitres"
                                active={isActive('/chapter')}
                                style={getNavLinkStyle(isActive('/chapter'))}
                          />
                          <NavLink
                                component={Link}
                                to="/quizPage"
                                label="Quiz"
                                active={isActive('/quizPage')}
                                style={getNavLinkStyle(isActive('/quizPage'))}
                          />
                    </NavLink>
                    
                    <NavLink
                          label="Utilisateurs & roles"
                          leftSection={<IconUser size={26} stroke={1.5} />}
                          childrenOffset={28}
                          defaultOpened={isActive('/user')}
                    >
                          <NavLink
                                component={Link}
                                to="/user"
                                label="Utilisateurs"
                                active={isActive('/user')}
                                style={getNavLinkStyle(isActive('/user'))}
                          />
                          <NavLink href="#required-for-focus" label="Profils & acces" />
                    </NavLink>
                    <NavLink
                          component={Link}
                          to="/enrollments"
                          label="Inscriptions étudiants"
                          leftSection={<IconSchool size={26} stroke={1.5} />}
                          active={isActive('/enrollments')}
                          style={getNavLinkStyle(isActive('/enrollments'))}
                    />
                    <NavLink
                          label="Mini-projets & tickets"
                          leftSection={<IconBrandTrello size={26} stroke={1.5} />}
                          childrenOffset={28}
                          defaultOpened={isActive('/miniproject') || isActive('/validation')}
                    >
                          <NavLink
                                component={Link}
                                to="/miniproject"
                                label="Mini-projets"
                                active={isActive('/miniproject')}
                                style={getNavLinkStyle(isActive('/miniproject'))}
                          />
                          <NavLink
                                component={Link}
                                to="/validation"
                                label="Validation des tickets"
                                active={isActive('/validation')}
                                style={getNavLinkStyle(isActive('/validation'))}
                          />
                          <NavLink label="Git / Repos crees" href="#required-for-focus" />
                    </NavLink>
                    <NavLink
                          href="#required-for-focus"
                          label="Suivi et statistiques"
                          leftSection={<IconChartDots2 size={26} stroke={1.5} />}
                    />
                    <NavLink
                          href="#required-for-focus"
                          label="Notifications"
                          leftSection={<IconBell size={26} stroke={1.5} />}
                    />
                    <NavLink
                          href="#required-for-focus"
                          label="Paramètres généraux"
                          leftSection={<IconSettingsCog size={26} stroke={1.5} />}
                          childrenOffset={28}
                    >
                          <NavLink href="#required-for-focus" label="Catégories de cours" />
                          <NavLink label="Tags/ niveaux / compétences" href="#required-for-focus" />
                          <NavLink label="Paramètres Git" href="#required-for-focus" />
                    </NavLink>
                   
            </AppShell.Navbar>
              <AppShell.Main>
                    <Breadcrumbs m='sm'>{breadcrumbs}</Breadcrumbs>
                    <Container fluid mih='50dvh' p='lg' style={{ borderRadius: '5px'}}>
                          {children}
                    </Container>
              </AppShell.Main>
              <ModalMessage/>
              <ConfirmMessage/>

              {/* Password Change Modal */}
              <Modal
                opened={passwordModalOpened}
                onClose={handlePasswordModalClose}
                title="Changer le mot de passe"
                size="sm"
                centered
                closeOnClickOutside={false}
              >
                <Stack gap="lg">
                  {passwordChangeSuccess && (
                    <Notification
                      title="Succès"
                      color="green"
                      withCloseButton={false}
                      autoClose={3000}
                    >
                      Votre mot de passe a été changé avec succès. ✓
                    </Notification>
                  )}
                  {passwordFormErrors.submit && (
                    <Notification
                      title="Erreur"
                      color="red"
                      withCloseButton={true}
                      onClose={() => setPasswordFormErrors({ ...passwordFormErrors, submit: '' })}
                    >
                      {passwordFormErrors.submit}
                    </Notification>
                  )}
                  <PasswordInput
                    label="Mot de passe actuel"
                    placeholder="Entrez votre mot de passe actuel"
                    value={passwordFormData.currentPassword}
                    onChange={(e) => {
                      setPasswordFormData({ ...passwordFormData, currentPassword: e.currentTarget.value });
                      if (passwordFormErrors.currentPassword) {
                        setPasswordFormErrors({ ...passwordFormErrors, currentPassword: '' });
                      }
                    }}
                    error={passwordFormErrors.currentPassword}
                    withAsterisk
                    disabled={passwordChangeLoading}
                  />

                  <PasswordInput
                    label="Nouveau mot de passe"
                    placeholder="Entrez votre nouveau mot de passe"
                    value={passwordFormData.newPassword}
                    onChange={(e) => {
                      setPasswordFormData({ ...passwordFormData, newPassword: e.currentTarget.value });
                      if (passwordFormErrors.newPassword) {
                        setPasswordFormErrors({ ...passwordFormErrors, newPassword: '' });
                      }
                    }}
                    error={passwordFormErrors.newPassword}
                    withAsterisk
                    description="Minimum 8 caractères"
                    disabled={passwordChangeLoading}
                  />

                  <PasswordInput
                    label="Confirmer le mot de passe"
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={passwordFormData.confirmPassword}
                    onChange={(e) => {
                      setPasswordFormData({ ...passwordFormData, confirmPassword: e.currentTarget.value });
                      if (passwordFormErrors.confirmPassword) {
                        setPasswordFormErrors({ ...passwordFormErrors, confirmPassword: '' });
                      }
                    }}
                    error={passwordFormErrors.confirmPassword}
                    withAsterisk
                    disabled={passwordChangeLoading}
                  />

                  <Group justify="flex-end" gap="md" mt="xl">
                    <Button variant="light" onClick={handlePasswordModalClose} disabled={passwordChangeLoading}>
                      Annuler
                    </Button>
                    <Button onClick={handlePasswordChangeSubmit} loading={passwordChangeLoading}>
                      Mettre à jour
                    </Button>
                  </Group>
                </Stack>
              </Modal>
      </AppShell>
  );
}
