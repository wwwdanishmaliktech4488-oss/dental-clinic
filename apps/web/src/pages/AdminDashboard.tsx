import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { LogOut, User, Mail, Phone, Calendar, BarChart2, Activity } from 'lucide-react';

interface Enquiry {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const data = await apiRequest('/api/enquiries');
        setEnquiries(data.enquiries);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEnquiries();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiRequest(`/api/enquiries/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setEnquiries(enquiries.map(e => e.id === id ? { ...e, status: newStatus } : e));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'converted': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const newCount = enquiries.filter(e => e.status === 'new').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Demo Clinic</h1>
            <p className="text-xs text-gray-500 mt-1">Staff Portal</p>
          </div>
          
          <nav className="p-4 space-y-2">
            <a href="/admin/dashboard" className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
              <User className="w-5 h-5" />
              <span>Enquiries</span>
            </a>
            <a href="/admin/followups" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
              <Calendar className="w-5 h-5" />
              <span>Follow-ups & Export</span>
            </a>
            <a href="/admin/reports" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
              <BarChart2 className="w-5 h-5" />
              <span>Analytics & Reports</span>
            </a>
            <a href="/admin/treatments" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors">
              <Activity className="w-5 h-5" />
              <span>Manage Treatments</span>
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button onClick={handleLogout} className="flex items-center space-x-3 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors w-full">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enquiries Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">Manage patient requests and follow-ups.</p>
          </div>
        </header>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Total Enquiries</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{enquiries.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">New (Unread)</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{newCount}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Conversion Rate</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {enquiries.length > 0 
                ? Math.round((enquiries.filter(e => e.status === 'converted').length / enquiries.length) * 100) 
                : 0}%
            </p>
          </div>
        </div>

        {/* Enquiries List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Recent Requests</h3>
          </div>
          
          <div className="divide-y divide-gray-100">
            {loading ? (
               <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : enquiries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No enquiries found yet.</div>
            ) : (
              enquiries.map((enquiry) => (
                <div key={enquiry.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{enquiry.full_name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(enquiry.status)}`}>
                        {enquiry.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 space-y-1 md:space-y-0 md:space-x-6">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {enquiry.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {enquiry.phone || 'Not provided'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(enquiry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 md:ml-6">
                    <select
                      value={enquiry.status}
                      onChange={(e) => handleStatusChange(enquiry.id, e.target.value)}
                      className="block w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="follow_up_required">Follow-up Required</option>
                      <option value="appointment_requested">Appointment Requested</option>
                      <option value="converted">Converted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}