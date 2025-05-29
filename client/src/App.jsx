import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminDashboard from './components/admin/Dashboard';
import CreateSurvey from './components/admin/CreateSurvey';
import SurveyResults from './components/admin/SurveyResults';
import StudentSurvey from './components/student/StudentSurvey';
import ThankYou from './components/student/ThankYou';
import Navbar from './components/common/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Toaster position="top-right" />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create" element={<CreateSurvey />} />
            <Route path="/admin/results/:id" element={<SurveyResults />} />
            
            {/* Student Routes */}
            <Route path="/survey/:id" element={<StudentSurvey />} />
            <Route path="/thank-you" element={<ThankYou />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;