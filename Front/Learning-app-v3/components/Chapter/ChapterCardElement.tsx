import {
    Grid,
    Card,
    Stack,
    Text,
    Group,
    ActionIcon,
    Tooltip
} from '@mantine/core'
import {IconStar} from '@tabler/icons-react';
import { IconEdit, IconTrash, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';



type ChapterCardElementProps = {
    title: string;
    chapterId: string | number;
    createdDate: string;
    description: string;
    color?: string;
    openModal: (id: string | number) => void;
};

export default function ChapterCardElement({
    title,
    chapterId,
    createdDate,
    description,
    color,
    openModal
}: ChapterCardElementProps) {
    const navigate = useNavigate();

    if (!color || color.trim() === '') color = '#FFE259';
    const gradientColors: Record<string, string> = {
        "#2e2e2e": "#434343",
        "#868e96": "#adb5bd",
        "#fa5252": "#ff8787",
        "#e64980": "#f783ac",
        "#be4bdb": "#d0bfff",
        "#7950f2": "#a685ff",
        "#4c6ef5": "#748ffc",
        "#228be6": "#66d9e8",
        "#15aabf": "#3bc9db",
        "#12b886": "#51cf66",
        "#40c057": "#b2f2bb",
        "#82c91e": "#d8f5a2",
        "#fab005": "#ffd43b",
        "#fd7e14": "#ffa94d",
        "#FFE259" : "#FFA751"
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        openModal(chapterId);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        // TODO: Implement delete functionality
    };

    const handleViewContent = () => {
        navigate(`/chapterContent/${chapterId}`);
    };

    return(
        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <Card
                shadow="md"
                radius="lg"
                p="lg"
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${gradientColors[color]} 100%)`,
                    minHeight: 360,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    transform: 'translateY(0)',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                }}
            >
                {/* Action Buttons - Top Right */}
                <Group
                    gap={8}
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 10,
                    }}
                >
                    <Tooltip label="Modifier le chapitre" position="left">
                        <ActionIcon
                            color="white"
                            size="lg"
                            variant="light"
                            onClick={handleEdit}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <IconEdit size={18} color="#0D47A1" />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Supprimer le chapitre" position="left">
                        <ActionIcon
                            color="red"
                            size="lg"
                            variant="light"
                            onClick={handleDelete}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <IconTrash size={18} color="#fa5252" />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                {/* Main Content */}
                <Stack gap={12} style={{ flex: 1 }}>
                    {/* Title */}
                    <Text
                        fw={700}
                        size="lg"
                        style={{
                            color: 'white',
                            lineHeight: 1.4
                        }}
                    >
                        {title}
                    </Text>

                    {/* Description */}
                    <Text
                        c="white"
                        size="sm"
                        opacity={0.9}
                        style={{
                            flex: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {description}
                    </Text>

                    {/* Date */}
                    <Text
                        c="white"
                        size="xs"
                        opacity={0.7}
                    >
                        Créé le: {new Date(createdDate).toLocaleDateString('fr-FR')}
                    </Text>
                </Stack>

                {/* Footer - Star and View Button */}
                <Group
                    justify="space-between"
                    align="center"
                    style={{
                        marginTop: 'auto',
                        paddingTop: 12,
                        borderTop: 'rgba(255, 255, 255, 0.2) 1px solid'
                    }}
                >
                    <Group gap={4} align="center" opacity={0.6}>
                        <IconStar size={16} color="white" fill="white" />
                        <Text size="xs" c="white">Favoris</Text>
                    </Group>
                    <Tooltip label="Voir le contenu">
                        <ActionIcon
                            size="sm"
                            variant="light"
                            onClick={handleViewContent}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            }}
                        >
                            <IconArrowRight size={16} color="#0D47A1" />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Card>
        </Grid.Col>
    );
}