import {
    Grid,
    Card,
    Badge,
    Stack,
    Text,
    Group,
    Image,
    ActionIcon
} from '@mantine/core'
import {IconStar} from '@tabler/icons-react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';



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
    if (!color || color.trim() === '') color = '#FFE259';
    const gradientColors: Record<string, string> = {
        "#2e2e2e": "#434343",      // Gris foncé → Gris un peu plus clair
        "#868e96": "#adb5bd",      // Gris moyen → Gris clair
        "#fa5252": "#ff8787",      // Rouge vif → Rouge plus clair
        "#e64980": "#f783ac",      // Rose → Rose plus clair
        "#be4bdb": "#d0bfff",      // Violet → Violet pastel
        "#7950f2": "#a685ff",      // Violet foncé → Violet plus clair
        "#4c6ef5": "#748ffc",      // Bleu → Bleu plus clair
        "#228be6": "#66d9e8",      // Bleu foncé → Bleu cyan clair
        "#15aabf": "#3bc9db",      // Bleu turquoise → Turquoise plus clair
        "#12b886": "#51cf66",      // Vert → Vert lime
        "#40c057": "#b2f2bb",      // Vert clair → Vert pastel
        "#82c91e": "#d8f5a2",      // Vert-lime → Vert clair pastel
        "#fab005": "#ffd43b",      // Jaune → Jaune clair
        "#fd7e14": "#ffa94d",      // Orange → Orange plus clair
        "#FFE259" : "#FFA751"
    };
    return(
        <Grid.Col span={4}>
            <Link to={`/chapterContent/${chapterId}`} style={{ textDecoration: 'none' }}>
                <Card
                    shadow="md"
                    radius="lg"
                    p="xl"
                    style={{
                        background: `linear-gradient(135deg, ${color} 0%, ${gradientColors[color]} 100%)`,
                        minWidth: 300,
                        minHeight: 340,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Group
                        gap={8}
                        style={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                        }}
                    >
                        <ActionIcon
                            color="blue"
                            size="sm"
                            variant="transparent"
                            onClick={() => openModal(chapterId)}
                        >
                            <IconEdit size={14} />
                        </ActionIcon>
                        <ActionIcon
                            color="red"
                            size="sm"
                            variant="transparent"
                        >
                            <IconTrash size={14} />
                        </ActionIcon>
                    </Group>
                    <Stack gap={8}>
                        {/* Titre principal */}
                        <Text fw={700} size="xl" style={{ color: 'white' }}>
                            {title}
                        </Text>
                        {/* Sous-titres */}
                        <Text c="white" size="sm" mt={8} opacity={0.8}>
                            <span style={{ fontWeight: 500 }}>Crée le:  Créé le : {new Date(createdDate).toLocaleDateString('fr-FR')}</span>
                        </Text>
                        <Text c="white" size="sm" mt={8} opacity={0.8}>
                            <span style={{ fontWeight: 500 }}>{description}</span>
                        </Text>
                    </Stack>
                    {/* Footer : étoile Saved */}
                    <Group
                        gap={4}
                        align="center"
                        style={{
                            position: 'absolute',
                            left: 24,
                            bottom: 20,
                            opacity: 0.4,
                        }}
                    >
                        <IconStar size={18} />
                        <Text size="sm">Favoris</Text>
                    </Group>
                    {/* <Image
                        src="/lampe.png" // Mets ici le chemin réel de ton image de lampe
                        alt="Lamp"
                        style={{
                            position: 'absolute',
                            right: 24,
                            bottom: 10,
                            width: 110,
                            height: 'auto',
                            pointerEvents: 'none',
                        }}
                    /> */}
                </Card>
            </Link>
        </Grid.Col>        
    );
}