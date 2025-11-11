import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentLayout } from '../layout/StudentLayout';
import '@mantine/core/styles.layer.css'; // 1️⃣ Styles de Mantine
import 'mantine-datatable/styles.layer.css'; // 2️⃣ Styles de DataTable
import '../styles/layout.css'; // 3️⃣ Tes styles persos (overlay)

// Pages étudiantes
import Dashboard from './pages/Dashboard';
import AllCourses from './pages/AllCourses';
import MyCourses from './pages/MyCourses';
import Achievements from './pages/Achievements';
import CourseView from './pages/CourseView';
import Quiz from './pages/Quiz';
import QuizResults from './pages/QuizResults';
import MiniProjects from './pages/MiniProjects';
import MiniProjectView from './pages/MiniProjectView';

// Placeholder pages (à implémenter)
const QuizList = () => <div style={{ padding: '20px' }}><h1>Quiz & Exercices</h1></div>;
const Projects = () => <div style={{ padding: '20px' }}><h1>Mes projets</h1></div>;
const Chat = () => <div style={{ padding: '20px' }}><h1>Chat IA</h1></div>;
const Notifications = () => <div style={{ padding: '20px' }}><h1>Notifications</h1></div>;
const Settings = () => <div style={{ padding: '20px' }}><h1>Paramètres</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes étudiantes avec StudentLayout */}
        <Route
          path="/dashboard"
          element={
            <StudentLayout breadcrumbs={[{ title: 'Tableau de bord', href: '/dashboard' }]}>
              <Dashboard />
            </StudentLayout>
          }
        />
        <Route
          path="/courses"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Mes cours', href: '/courses' },
              { title: 'Tous les cours', href: '/courses' }
            ]}>
              <AllCourses />
            </StudentLayout>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Mes cours', href: '/courses' },
              { title: 'Contenu du cours', href: '/courses/:courseId' }
            ]}>
              <CourseView />
            </StudentLayout>
          }
        />
        <Route
          path="/my-courses"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Mes cours', href: '/my-courses' },
              { title: 'Mes inscriptions', href: '/my-courses' }
            ]}>
              <MyCourses />
            </StudentLayout>
          }
        />
        <Route
          path="/quiz"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Quiz & Exercices', href: '/quiz' }
            ]}>
              <QuizList />
            </StudentLayout>
          }
        />
        <Route
          path="/quiz/:quizId"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Quiz & Exercices', href: '/quiz' },
              { title: 'Quiz', href: '/quiz/:quizId' }
            ]}>
              <Quiz />
            </StudentLayout>
          }
        />
        <Route
          path="/quiz/:quizId/results/:attemptId"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Quiz & Exercices', href: '/quiz' },
              { title: 'Résultats', href: '/quiz/:quizId/results/:attemptId' }
            ]}>
              <QuizResults />
            </StudentLayout>
          }
        />
        <Route
          path="/exercises"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Quiz & Exercices', href: '/exercises' },
              { title: 'Exercices pratiques', href: '/exercises' }
            ]}>
              <QuizList />
            </StudentLayout>
          }
        />
        <Route
          path="/projects"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Mes projets', href: '/projects' }
            ]}>
              <Projects />
            </StudentLayout>
          }
        />
        <Route
          path="/mini-projects"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Mini-projets', href: '/mini-projects' }
            ]}>
              <MiniProjects />
            </StudentLayout>
          }
        />
        <Route
          path="/mini-projects/:projectId"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Mini-projets', href: '/mini-projects' },
              { title: 'Projet', href: '/mini-projects/:projectId' }
            ]}>
              <MiniProjectView />
            </StudentLayout>
          }
        />
        <Route
          path="/achievements"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Mes accomplissements', href: '/achievements' }
            ]}>
              <Achievements />
            </StudentLayout>
          }
        />
        <Route
          path="/chat"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Chat IA', href: '/chat' }
            ]}>
              <Chat />
            </StudentLayout>
          }
        />
        <Route
          path="/notifications"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Notifications', href: '/notifications' }
            ]}>
              <Notifications />
            </StudentLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <StudentLayout breadcrumbs={[
              { title: 'Paramètres', href: '/settings' }
            ]}>
              <Settings />
            </StudentLayout>
          }
        />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
