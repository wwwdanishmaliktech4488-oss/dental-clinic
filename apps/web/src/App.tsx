import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EnquiryForm } from './components/EnquiryForm';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { Treatments } from './pages/Treatments';
import { AdminFollowUps } from './pages/AdminFollowUps';
import { Privacy } from './pages/Privacy';
import { AdminReports } from './pages/AdminReports';
import { AdminTreatments } from './pages/AdminTreatments';

// Simple protected route wrapper
function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function PublicPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Demo Dental Clinic</h1>
          <a href="#enquire" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Book Now
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Modern dentistry for the whole family.
          </h2>
          <p className="text-lg text-gray-600">
            We provide comprehensive dental care in a comfortable, welcoming environment. 
            From routine checkups to advanced cosmetic treatments, our expert team is here for you.
          </p>
          <ul className="space-y-3 text-gray-700">
            <li>✓ Same-day emergency appointments</li>
            <li>✓ Free initial consultations</li>
            <li>✓ 0% finance options available</li>
          </ul>
        </div>

        <div id="enquire" className="md:sticky md:top-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Request an Appointment</h3>
          <EnquiryForm />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPage />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/treatments" element={<Treatments />} />
        <Route path="/admin/followups" element={<RequireAuth><AdminFollowUps /></RequireAuth>} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/admin/reports" element={<RequireAuth><AdminReports /></RequireAuth>} />
        <Route path="/admin/treatments" element={<RequireAuth><AdminTreatments /></RequireAuth>} />

        <Route 
          path="/admin/dashboard" 
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;