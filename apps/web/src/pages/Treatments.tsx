import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Treatments() {
  const [treatments, setTreatments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/treatments`)
      .then(res => res.json())
      .then(data => setTreatments(data.treatments));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Our Treatments</h1>
        <Link to="/" className="text-blue-600 hover:underline">← Back to Home</Link>
      </div>
      <div className="grid gap-6">
        {treatments.map(t => (
          <div key={t.id} className="border p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-2">{t.name}</h2>
            <p className="text-gray-600">{t.description}</p>
            {t.pricing_note && <p className="text-sm font-medium text-blue-600 mt-4">{t.pricing_note}</p>}
          </div>
        ))}
        {treatments.length === 0 && <p className="text-gray-500">No treatments published yet.</p>}
      </div>
    </div>
  );
}