import './App.css'
import CourseList from '../pages/course/CourseList.tsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute.tsx';
import '@mantine/core/styles.layer.css'; // 1️⃣ Styles de Mantine
import 'mantine-datatable/styles.layer.css'; // 2️⃣ Styles de DataTable
import '../styles/layout.css'; // 3️⃣ Tes styles persos (overlay)
import UserList from '../pages/user/UserList.tsx';
import ChapterPage from '../pages/chapter/ChapterPage.tsx';;
import ChapterContentPage  from '../pages/chapter/ChapterContentPage.tsx'
import QuizList from '../pages/quiz/QuizList.tsx'
import QuizPage from "../pages/quiz/QuizPage.tsx";
import MiniProjectPage from '../pages/miniproject/MiniProjectPage.tsx';
import LoginPage from '../pages/auth/LoginPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<CourseList />} />
                  <Route path="/course" element={<CourseList />} />
                  <Route path="/user" element={<UserList />} />
                  <Route path="/chapter" element={<ChapterPage />} />
                  <Route path="/chapterContent/:chapterId" element={<ChapterContentPage />} />
                  <Route path="/quiz/:quizId" element={<QuizList/>}/>
                  <Route path="/quizPage" element={<QuizPage/>}/>
                  <Route path="/miniproject" element={<MiniProjectPage/>}/>
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App
