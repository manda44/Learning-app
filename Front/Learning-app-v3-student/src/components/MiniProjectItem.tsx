import { Paper, Group, Text } from '@mantine/core';
import { IconBriefcase, IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import type { MiniProjectBasic } from '../services/miniProjectService';

interface MiniProjectItemProps {
  miniProject: MiniProjectBasic;
}

export function MiniProjectItem({ miniProject }: MiniProjectItemProps) {
  const navigate = useNavigate();

  return (
    <Paper
      p="md"
      radius="md"
      style={{
        cursor: 'pointer',
        border: '1px solid #51cf66',
        backgroundColor: '#f0fff4',
        transition: 'all 0.2s',
      }}
      onClick={() => {
        navigate(`/mini-projects/${miniProject.miniProjectId}`);
      }}
    >
      <Group justify="space-between" align="flex-start">
        <Group gap="xs" align="flex-start">
          <IconBriefcase size={20} style={{ color: '#51cf66', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <Text fw={500} size="sm">
              Mini-Projet
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {miniProject.title}
            </Text>
          </div>
        </Group>
        <IconChevronRight size={20} style={{ color: '#51cf66', flexShrink: 0 }} />
      </Group>
    </Paper>
  );
}
