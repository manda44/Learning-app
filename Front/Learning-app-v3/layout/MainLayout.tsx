import { AppShell, Burger, Group, NavLink, Input } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MantineLogo } from '@mantinex/mantine-logo';
import {IconSearch, IconBrightnessDown, IconBell, IconMessageFilled, IconUserCircle, IconLogout } from '@tabler/icons-react';
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
import { Link, useNavigate } from 'react-router-dom';
import {useGeneralStore} from '../store/generalStore';
import { getUserInfo, logoutUser } from '../services/authService';
import { useState, useEffect } from 'react';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure(true);
  const [userName, setUserName] = useState<string>('Utilisateur');
  const navigate = useNavigate();

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
            <AppShell.Header>
                  <Group h="100%" px="md" justify='space-between'>
                        <Group>
                              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                              <IconSearch size={24} stroke={1.5} />
                                <Input placeholder="Rechercher..." />
                        </Group>
                          <Group gap='md'>
                                <IconBrightnessDown size={28} stroke={1.5} style={{ cursor: 'pointer' }} />
                                <IconBell size={28} stroke={1.5} style={{ cursor: 'pointer' }} />
                                <IconMessageFilled size={28} stroke={1.5} style={{ cursor: 'pointer' }} />
                              <Group gap='xs'>
                                <IconUserCircle size={28} stroke={1.5} />
                                <div>
                                  <Text size="sm" fw={500}>{userName}</Text>
                                </div>
                              </Group>
                                <Menu shadow="md" width={250}>
                                      <Menu.Target>
                                            <IconChevronDown size={28} stroke={1.5} style={{ cursor: 'pointer' }} />
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
            <AppShell.Navbar p="md">
                    <MantineLogo size={30}/>
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
                    >
                          <NavLink
                                component={Link}
                                to="/course"
                                label="Cours" />
                          <NavLink
                                component={Link}
                                to="/chapter"
                                label="Chapitres" />
                          <NavLink
                                component={Link}
                                to="/quizPage"
                                label="Quiz" />
                    </NavLink>
                    
                    <NavLink
                          href="#required-for-focus"
                          label="Utilisateurs & roles"
                          leftSection={<IconUser size={26} stroke={1.5} />}
                          childrenOffset={28}
                    >
                          <NavLink 
                          component={Link}
                          to="/user"
                          label="Utilisateurs" />
                          <NavLink href="#required-for-focus" label="Profils & acces" />
                    </NavLink>
                    <NavLink
                          label="Mini-projets & tickets"
                          leftSection={<IconBrandTrello size={26} stroke={1.5} />}
                          childrenOffset={28}
                    >
                          <NavLink
                                component={Link}
                                to="/miniproject"
                                label="Mini-projets" />
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
