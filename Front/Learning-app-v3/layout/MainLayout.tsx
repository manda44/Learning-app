import { AppShell, Burger, Group, NavLink, Input, ActionIcon, useMantineColorScheme } from '@mantine/core';
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
} from '@tabler/icons-react';
import { Menu,Text, Container, Anchor, Breadcrumbs } from '@mantine/core';
import ModalMessage from '../components/ModalMessages.tsx';
import ConfirmMessage from '../components/ConfirmMessage.tsx';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {useGeneralStore} from '../store/generalStore';
import { getUserInfo, logoutUser } from '../services/authService';
import { useState, useEffect } from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Utilisateur');
  const { colorScheme, setColorScheme } = useMantineColorScheme();

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
    }
  }, []);

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
                                <IconBell size={28} stroke={1.5} style={{ cursor: 'pointer', color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }} />
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
                                            <Menu.Item leftSection={<IconUserProfile size={14} />}>
                                                  Mon profil
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconSettings size={14} />}>
                                                  Paramètres
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconLock size={14} />}>
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
                          href="#required-for-focus"
                          label="Tableau de bord"
                          leftSection={<IconLayoutDashboard size={26} stroke={1.5} />}
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
                          label="Mini-projets & tickets"
                          leftSection={<IconBrandTrello size={26} stroke={1.5} />}
                          childrenOffset={28}
                          defaultOpened={isActive('/miniproject')}
                    >
                          <NavLink
                                component={Link}
                                to="/miniproject"
                                label="Mini-projets"
                                active={isActive('/miniproject')}
                                style={getNavLinkStyle(isActive('/miniproject'))}
                          />
                          <NavLink label="Tickets" href="#required-for-focus" />
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
      </AppShell>
  );
}
