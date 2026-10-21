import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export function AdminReports() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiRequest('/api/dashboard/reports').then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading reports...</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Clinic Reports</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Status Breakdown */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Enquiries by Status</h3>
          <ul className="space-y-3">
            {data.byStatus.map((row: any) => (
              <li key={row.status} className="flex justify-between items-center border-b pb-2">
                <span className="capitalize text-gray-600">{row.status.replace(/_/g, ' ')}</span>
                <span className="font-bold text-blue-600">{row.count}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Treatment Breakdown */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Enquiries by Treatment</h3>
          <ul className="space-y-3">
            {data.byTreatment.map((row: any) => (
              <li key={row.name} className="flex justify-between items-center border-b pb-2">
                <span className="text-gray-600">{row.name}</span>
                <span className="font-bold text-blue-600">{row.count}</span>
              </li>
            ))}
            {data.byTreatment.length === 0 && <p className="text-gray-500 text-sm">No treatments added yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}