import { Box, Center, Loader, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';

export function Quiz() {
  const { quizId } = useParams<{ quizId: string }>();

  return (
    <Box style={{ height: 'calc(100vh - 100px)', display: 'flex' }}>
      <Center style={{ flex: 1 }}>
        <Box style={{ textAlign: 'center' }}>
          <Text size="xl" fw={500} mb="md">
            Quiz #{quizId}
          </Text>
          <Text c="dimmed">
            Cette page de quiz sera bientôt disponible
          </Text>
        </Box>
      </Center>
    </Box>
  );
}

export default Quiz;
