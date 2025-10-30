import {
    Group,
    Modal,
    Text,
    Button
} from '@mantine/core';
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'
import { useConfirmModalStore } from '../store/modalStore';

export default function ConfirmMessage(){
      const {isOpen,closeModal,message,action} = useConfirmModalStore();
    
    const handleConfirm = async() => {
        await action();
        closeModal();
    };

  return (
    <Modal
      opened={isOpen}
      onClose={closeModal}
      title="Confirmation"
      centered
    >
      <Text mb="md">{message}</Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={closeModal}>
          Annuler
        </Button>
        <Button color="red" onClick={handleConfirm}>
          Confirmer
        </Button>
      </Group>
    </Modal>
  );
}