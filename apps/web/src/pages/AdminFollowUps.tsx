import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export function AdminFollowUps() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    apiRequest('/api/followups').then(data => setTasks(data.tasks));
  }, []);

  const exportData = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/enquiries/export`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enquiries.csv';
    a.click();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Follow-up Tasks</h2>
        <button onClick={exportData} className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-900">
          Export Enquiries (CSV)
        </button>
      </div>
      <div className="bg-white border rounded-lg divide-y">
        {tasks.map(task => (
          <div key={task.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">Follow up with {task.patient_name}</p>
              <p className="text-sm text-gray-500">Due: {new Date(task.due_at).toLocaleString()}</p>
              {task.notes && <p className="text-sm text-gray-600 mt-1">{task.notes}</p>}
            </div>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-xs font-bold">PENDING</span>
          </div>
        ))}
        {tasks.length === 0 && <p className="p-6 text-gray-500">No pending follow-ups.</p>}
      </div>
    </div>
  );
}