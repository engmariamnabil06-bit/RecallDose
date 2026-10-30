import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Problem from "./components/Problem";
import Method from "./components/Method";
import DailyDose from "./components/DailyDose";
import ExamSimulator from "./components/ExamSimulator";
import WeakSpots from "./components/WeakSpots";
import MistakeBank from "./components/MistakeBank";
import Progress from "./components/Progress";
import DrRecall from "./components/DrRecall";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Recall from "./pages/Recall";
import RecallSession from "./pages/RecallSession";
import PharmaMemoryLab from "./pages/PharmaMemoryLab";
import AITutor from "./pages/AITutor";
import CurriculumExplorer from "./pages/CurriculumExplorer";
import StudyTools from "./pages/StudyTools";
import UploadAndOCR from "./pages/UploadAndOCR";
import {
  DailyDosePage,
  ExamsPage,
  MistakesPage,
  ProfilePage,
  ProgressPage,
  RecallTwinPage,
  ReviewSchedulePage,
  WeakSpotsPage,
} from "./pages/Insights";

import "./styles/globals.css";
import "./styles/insights.css";

const LandingPage = () => {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Hero />
        <Problem />
        <Method />
        <DailyDose />
        <ExamSimulator />
        <WeakSpots />
        <MistakeBank />
        <Progress />
        <DrRecall />
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route path="/curriculum" element={<ProtectedRoute><CurriculumExplorer /></ProtectedRoute>} />
        <Route path="/ai-tutor" element={<ProtectedRoute><AITutor /></ProtectedRoute>} />
        <Route path="/study-tools" element={<ProtectedRoute><StudyTools /></ProtectedRoute>} />
        <Route path="/upload-ocr" element={<ProtectedRoute><UploadAndOCR /></ProtectedRoute>} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/recall"
  element={
    <ProtectedRoute>
      <Recall />
    </ProtectedRoute>
  }
/>
<Route
          path="/pharma-memory"
          element={
            <ProtectedRoute>
              <PharmaMemoryLab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-dose"
          element={<ProtectedRoute><DailyDosePage /></ProtectedRoute>}
        />
        <Route
          path="/progress"
          element={<ProtectedRoute><ProgressPage /></ProtectedRoute>}
        />
        <Route
          path="/weak-spots"
          element={<ProtectedRoute><WeakSpotsPage /></ProtectedRoute>}
        />
        <Route
          path="/mistakes"
          element={<ProtectedRoute><MistakesPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/dr-recall"
          element={<ProtectedRoute><RecallTwinPage /></ProtectedRoute>}
        />
        <Route
          path="/exams"
          element={<ProtectedRoute><ExamsPage /></ProtectedRoute>}
        />
        <Route path="/review-schedule" element={<ProtectedRoute><ReviewSchedulePage /></ProtectedRoute>} />
<Route
  path="/recall/session"
  element={
    <ProtectedRoute>
      <RecallSession />
    </ProtectedRoute>
  }
/>
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;