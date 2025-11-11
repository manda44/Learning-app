import { AppShell, Burger, Group, NavLink, Input, ActionIcon, useMantineColorScheme } from '@mantine/core';
import {
  IconSearch,
  IconBell,
  IconMessageFilled,
  IconUserCircle,
  IconLogout,
  IconSun,
  IconMoon,
  IconHome,
  IconBook,
  IconBookmark,
  IconTrophy,
  IconClipboardList,
  IconSettings,
  IconChevronDown,
  IconChartBar,
  IconBrandOpenai,
} from '@tabler/icons-react';
import { Menu, Text, Container, Anchor, Breadcrumbs } from '@mantine/core';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserInfo, logoutUser } from '../src/services/authService';

interface BreadcrumbItem {
  title: string;
  href: string;
}

interface StudentLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function StudentLayout({ children, breadcrumbs = [] }: StudentLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('Étudiant');
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  // Initialize drawer state from localStorage
  const [opened, setOpened] = useState<boolean>(() => {
    const stored = localStorage.getItem('studentNavbarOpened');
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
    localStorage.setItem('studentNavbarOpened', JSON.stringify(newState));
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

  const breadcrumbElements = breadcrumbs.map((item, index) => (
    <Anchor component={Link} to={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
      layout="alt"
    >
      <AppShell.Header
        style={{
          background: colorScheme === 'dark'
            ? 'linear-gradient(90deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(90deg, #FFFFFF 0%, #F0F7FF 100%)',
          borderBottom: colorScheme === 'dark' ? '2px solid #3d3d3d' : '2px solid #E8F4FD',
          transition: 'all 0.3s ease'
        }}
      >
        <Group h="100%" px="md" justify='space-between'>
          <Group>
            <Burger opened={opened} onClick={handleToggle} hiddenFrom="sm" size="sm" />
            <IconSearch size={24} stroke={1.5} style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }} />
            <Input
              placeholder="Rechercher un cours..."
              styles={{
                input: {
                  background: colorScheme === 'dark' ? '#2d2d2d' : '#FFFFFF',
                  color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
                  borderColor: colorScheme === 'dark' ? '#3d3d3d' : '#E8F4FD'
                }
              }}
            />
          </Group>
          <Group gap='md'>
            <ActionIcon
              onClick={handleThemeToggle}
              size={28}
              variant="subtle"
              title={colorScheme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {colorScheme === 'dark' ? (
                <IconSun size={28} stroke={1.5} color="#FFD700" />
              ) : (
                <IconMoon size={28} stroke={1.5} />
              )}
            </ActionIcon>
            <IconBell
              size={28}
              stroke={1.5}
              style={{ cursor: 'pointer', color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}
            />
            <IconMessageFilled
              size={28}
              stroke={1.5}
              style={{ cursor: 'pointer', color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}
            />
            <Group gap='xs'>
              <IconUserCircle
                size={28}
                stroke={1.5}
                style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}
              />
              <div>
                <Text size="sm" fw={500} style={{ color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}>
                  {userName}
                </Text>
              </div>
            </Group>
            <Menu shadow="md" width={250}>
              <Menu.Target>
                <IconChevronDown
                  size={28}
                  stroke={1.5}
                  style={{ cursor: 'pointer', color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }}
                />
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Mon compte</Menu.Label>
                <Menu.Item leftSection={<IconUserCircle size={14} />}>
                  Mon profil
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Mes paramètres
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Apprentissage</Menu.Label>
                <Menu.Item leftSection={<IconBookmark size={14} />}>
                  Mes favoris
                </Menu.Item>
                <Menu.Item leftSection={<IconTrophy size={14} />}>
                  Mes badges
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

      <AppShell.Navbar
        p="md"
        style={{
          background: colorScheme === 'dark'
            ? 'linear-gradient(180deg, #1a1a1a 0%, #242424 100%)'
            : 'linear-gradient(180deg, #F8FBFF 0%, #F0F7FF 100%)',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          style={{
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
          }}
        >
          <img
            src="/logos/dtc-logo.jpg"
            alt="Learning App Logo"
            style={{ width: '45px', height: '45px', borderRadius: '8px' }}
          />
        </div>

        {/* Navigation principale pour étudiant */}
        <NavLink
          component={Link}
          to="/dashboard"
          label="Accueil"
          leftSection={<IconHome size={26} stroke={1.5} />}
          active={isActive('/dashboard')}
          style={getNavLinkStyle(isActive('/dashboard'))}
          mt='lg'
        />

        <NavLink
          component={Link}
          to="/my-courses"
          label="Mes Cours"
          leftSection={<IconBook size={26} stroke={1.5} />}
          active={isActive('/my-courses') || isActive('/courses') || isActive('/chapter')}
          style={getNavLinkStyle(isActive('/my-courses') || isActive('/courses') || isActive('/chapter'))}
          rightSection={
            <Text size="sm" fw={700} c="white" style={{ backgroundColor: '#4A9FD8', padding: '2px 8px', borderRadius: '12px' }}>
              5
            </Text>
          }
        />

        <NavLink
          component={Link}
          to="/quiz"
          label="Quiz"
          leftSection={<IconClipboardList size={26} stroke={1.5} />}
          active={isActive('/quiz') || isActive('/exercises')}
          style={getNavLinkStyle(isActive('/quiz') || isActive('/exercises'))}
        />

        <NavLink
          component={Link}
          to="/mini-projects"
          label="Mini-projets"
          leftSection={<IconTrophy size={26} stroke={1.5} />}
          active={isActive('/mini-projects')}
          style={getNavLinkStyle(isActive('/mini-projects'))}
        />

        <NavLink
          component={Link}
          to="/achievements"
          label="Mes Statistiques"
          leftSection={<IconChartBar size={26} stroke={1.5} />}
          active={isActive('/achievements')}
          style={getNavLinkStyle(isActive('/achievements'))}
        />

        {/* Separator */}
        <div style={{ height: '1px', backgroundColor: colorScheme === 'dark' ? '#3d3d3d' : '#E8F4FD', margin: '1rem 0' }} />

        {/* Lower Menu Items */}
        <NavLink
          component={Link}
          to="/chat"
          label="Chat IA"
          leftSection={<IconBrandOpenai size={26} stroke={1.5} />}
          active={isActive('/chat')}
          style={getNavLinkStyle(isActive('/chat'))}
        />

        <NavLink
          component={Link}
          to="/notifications"
          label="Notifications"
          leftSection={<IconBell size={26} stroke={1.5} />}
          active={isActive('/notifications')}
          style={getNavLinkStyle(isActive('/notifications'))}
        />

        <NavLink
          component={Link}
          to="/settings"
          label="Paramètres"
          leftSection={<IconSettings size={26} stroke={1.5} />}
          active={isActive('/settings')}
          style={getNavLinkStyle(isActive('/settings'))}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Breadcrumbs m='sm'>{breadcrumbElements}</Breadcrumbs>
        <Container fluid mih='50dvh' p='lg' style={{ borderRadius: '5px' }}>
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
