import {Group,Modal} from '@mantine/core';
import { IconCircleCheck, IconExclamationCircle } from '@tabler/icons-react'
import { useModalStore } from '../store/modalStore';

export default function NotificationMessage(){
      const {isOpen,closeModal,type,message} = useModalStore();
      const color = type === "success" ? "green" : "red";
      const icon = type === "success" ? <IconCircleCheck size={20} /> : <IconExclamationCircle size={20} />;
      
      return (
            <Modal opened={isOpen} onClose={closeModal} withCloseButton={false} styles={{
                  body: {
                        backgroundColor: color
                  },
                }}>
                  <Group>
                        {icon}
                        {message}
                  </Group>
            </Modal>
      )
}