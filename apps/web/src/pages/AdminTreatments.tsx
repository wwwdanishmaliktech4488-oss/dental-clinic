import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export function AdminTreatments() {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [formData, setFormData] = useState({ name: '', description: '', pricingNote: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTreatments = () => {
    // Fetch all treatments (we need a route that returns published AND unpublished for admin)
    // For now, let's just fetch the public ones, but in production you'd fetch all
    fetch(`${import.meta.env.VITE_API_URL}/api/treatments`)
      .then(res => res.json())
      .then(data => setTreatments(data.treatments));
  };

  useEffect(() => { loadTreatments(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest('/api/treatments', {
        method: 'POST',
        body: JSON.stringify({ ...formData, published: true }),
      });
      setFormData({ name: '', description: '', pricingNote: '' });
      loadTreatments();
      alert('Treatment added successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 grid md:grid-cols-2 gap-8">
      {/* Add New Treatment */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Add New Treatment</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Treatment Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Pricing Note (Optional)</label>
            <input type="text" value={formData.pricingNote} onChange={e => setFormData({...formData, pricingNote: e.target.value})} className="w-full border p-2 rounded" placeholder="e.g. From £250" />
          </div>
          <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Publish Treatment'}
          </button>
        </form>
      </div>

      {/* Current Treatments */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Published Treatments</h2>
        <div className="bg-white border rounded-lg divide-y shadow-sm">
          {treatments.map(t => (
            <div key={t.id} className="p-4">
              <h4 className="font-bold">{t.name}</h4>
              <p className="text-sm text-gray-500 line-clamp-2">{t.description}</p>
            </div>
          ))}
          {treatments.length === 0 && <p className="p-4 text-gray-500">No treatments yet.</p>}
        </div>
      </div>
    </div>
  );
}