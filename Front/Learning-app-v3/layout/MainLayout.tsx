import { AppShell, Burger, Group, NavLink, Input } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MantineLogo } from '@mantinex/mantine-logo';
import {IconSearch, IconBrightnessDown, IconBell, IconMessageFilled, IconUserCircle } from '@tabler/icons-react';
import {
      IconSettings,
      IconPhoto,
      IconMessageCircle,
      IconTrash,
      IconArrowsLeftRight,
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
import { Link } from 'react-router-dom';
import {useGeneralStore} from '../store/generalStore';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure(true);
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
                                <Input placeholder="Search...." />
                        </Group>
                          <Group gap='md'>
                                <IconBrightnessDown size={28} stroke={1.5} />
                                <IconBell size={28} stroke={1.5} />
                                <IconMessageFilled size={28} stroke={1.5} />
                              <h5>Thomas Edison</h5>
                              <IconUserCircle size={28} stroke={1.5} />
                                <Menu shadow="md" width={200}>
                                      <Menu.Target>
                                            <IconChevronDown size={28} stroke={1.5} />
                                      </Menu.Target>

                                      <Menu.Dropdown>
                                            <Menu.Label>Application</Menu.Label>
                                            <Menu.Item leftSection={<IconSettings size={14} />}>
                                                  Settings
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconMessageCircle size={14} />}>
                                                  Messages
                                            </Menu.Item>
                                            <Menu.Item leftSection={<IconPhoto size={14} />}>
                                                  Gallery
                                            </Menu.Item>
                                            <Menu.Item
                                                  leftSection={<IconSearch size={14} />}
                                                  rightSection={
                                                        <Text size="xs" c="dimmed">
                                                              ⌘K
                                                        </Text>
                                                  }
                                            >
                                                  Search
                                            </Menu.Item>

                                            <Menu.Divider />

                                            <Menu.Label>Danger zone</Menu.Label>
                                            <Menu.Item
                                                  leftSection={<IconArrowsLeftRight size={14} />}
                                            >
                                                  Transfer my data
                                            </Menu.Item>
                                            <Menu.Item
                                                  color="red"
                                                  leftSection={<IconTrash size={14} />}
                                            >
                                                  Delete my account
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
