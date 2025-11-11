import {
    Grid,
    Card,
    Stack,
    Text,
    Group,
    ActionIcon,
    Tooltip,
    Badge,
    Box
} from '@mantine/core'
import {IconStar, IconClock} from '@tabler/icons-react';
import { IconEdit, IconTrash, IconArrowRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';



type ChapterCardElementProps = {
    title: string;
    chapterId: string | number;
    createdDate: string;
    description: string;
    color?: string;
    openModal: (id: string | number) => void;
    compact?: boolean;
};

export default function ChapterCardElement({
    title,
    chapterId,
    createdDate,
    description,
    color,
    openModal,
    compact = false
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
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: compact ? 6 : 4 }}>
            <Card
                shadow="sm"
                radius="xl"
                p={0}
                style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${gradientColors[color]} 100%)`,
                    minHeight: compact ? 240 : 400,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(0)',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-12px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }}
            >
                {/* Decorative Background Element */}
                <Box
                    style={{
                        position: 'absolute',
                        top: -40,
                        right: -40,
                        width: 120,
                        height: 120,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }}
                />

                {/* Action Buttons - Top Right */}
                <Group
                    gap={compact ? 4 : 6}
                    style={{
                        position: 'absolute',
                        top: compact ? 8 : 16,
                        right: compact ? 8 : 16,
                        zIndex: 10,
                    }}
                >
                    <Tooltip label="Modifier le chapitre" position="left">
                        <ActionIcon
                            color="white"
                            size={compact ? 'md' : 'lg'}
                            variant="light"
                            onClick={handleEdit}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 1)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                            }}
                        >
                            <IconEdit size={compact ? 14 : 18} color="#0D47A1" />
                        </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Supprimer le chapitre" position="left">
                        <ActionIcon
                            color="red"
                            size={compact ? 'md' : 'lg'}
                            variant="light"
                            onClick={handleDelete}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(8px)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)';
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 1)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                            }}
                        >
                            <IconTrash size={compact ? 14 : 18} color="#fa5252" />
                        </ActionIcon>
                    </Tooltip>
                </Group>

                {/* Main Content */}
                <Stack gap={compact ? 6 : 16} p={compact ? 'sm' : 'lg'} style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                    {/* Title */}
                    <div>
                        <Text
                            fw={700}
                            size={compact ? 'sm' : 'xl'}
                            style={{
                                color: 'white',
                                lineHeight: compact ? 1.2 : 1.3,
                                letterSpacing: '-0.5px'
                            }}
                        >
                            {title}
                        </Text>
                    </div>

                    {/* Description */}
                    {!compact && (
                        <Text
                            c="white"
                            size={compact ? 'xs' : 'sm'}
                            opacity={0.85}
                            style={{
                                flex: 1,
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: compact ? 2 : 4,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.5
                            }}
                        >
                            {description}
                        </Text>
                    )}

                    {/* Metadata */}
                    {!compact && (
                        <Group gap={8} style={{ marginTop: 'auto' }}>
                            <Badge
                                leftSection={<IconClock size={12} />}
                                variant="light"
                                size="sm"
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    border: 'none'
                                }}
                            >
                                {new Date(createdDate).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </Badge>
                        </Group>
                    )}
                </Stack>

                {/* Footer - Action Bar */}
                <Group
                    justify="space-between"
                    align="center"
                    p={compact ? 'xs' : 'lg'}
                    style={{
                        borderTop: 'rgba(255, 255, 255, 0.15) 1px solid',
                        backgroundColor: 'rgba(0, 0, 0, 0.05)',
                        position: 'relative',
                        zIndex: 1,
                        gap: compact ? 4 : undefined
                    }}
                >
                    {!compact && (
                        <Group gap={6} align="center" style={{ opacity: 0.7 }}>
                            <IconStar size={16} color="white" fill="white" />
                            <Text size="xs" c="white" fw={500}>Favoris</Text>
                        </Group>
                    )}
                    {compact && (
                        <IconStar size={14} color="white" fill="white" style={{ opacity: 0.7 }} />
                    )}
                    <Tooltip label="Voir le contenu du chapitre">
                        <ActionIcon
                            size={compact ? 'md' : 'lg'}
                            variant="light"
                            onClick={handleViewContent}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                            }}
                        >
                            <IconArrowRight size={compact ? 14 : 18} color="#0D47A1" />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Card>
        </Grid.Col>
    );
}