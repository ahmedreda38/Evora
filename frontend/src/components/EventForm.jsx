import { useState, useRef } from 'react';
import { Calendar, MapPin, Users, DollarSign, Type, AlignLeft, Globe, Tag, Eye, ImagePlus, X } from 'lucide-react';

const CATEGORIES = ['Conference','Technology','Workshop','Healthcare','Design','Music','Sports','Business','Education','Networking'];

export default function EventForm({ initialData = {}, onSubmit, submitLabel = 'Create Event', loading = false }) {
  const [form, setForm] = useState({
    name: initialData.name || '',
    category: initialData.category || 'Conference',
    description: initialData.description || '',
    location: initialData.location || '',
    is_online: initialData.is_online || false,
    start_date: initialData.start_date ? initialData.start_date.slice(0, 16) : '',
    end_date: initialData.end_date ? initialData.end_date.slice(0, 16) : '',
    capacity: initialData.capacity || 100,
    price: initialData.price || 0,
    is_published: initialData.is_published ?? false,
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.image_url || null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be under 2MB' }));
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'Only JPEG, PNG, WebP, GIF allowed' }));
      return;
    }
    setErrors(prev => { const { image, ...rest } = prev; return rest; });
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.location || form.location.length < 3) e.location = 'Location must be at least 3 characters';
    if (!form.start_date) e.start_date = 'Start date is required';
    if (!form.end_date) e.end_date = 'End date is required';
    if (form.start_date && form.end_date && new Date(form.end_date) <= new Date(form.start_date)) e.end_date = 'End must be after start';
    if (form.capacity < 1) e.capacity = 'Capacity must be at least 1';
    if (form.price < 0) e.price = 'Price cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      capacity: parseInt(form.capacity),
      price: parseFloat(form.price),
    };
    onSubmit(payload, imageFile);
  };

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const inputClass = (field) => `w-full px-4 py-3 rounded-xl border ${errors[field] ? 'border-red-300 bg-red-50/50' : 'border-gray-200'} focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Type className="w-5 h-5 mr-2" /> Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Event Name *</label>
            <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className={inputClass('name')} placeholder="e.g. Evora Tech Summit 2026" maxLength={100} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button type="button" key={cat} onClick={() => update('category', cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${form.category === cat ? 'bg-primary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} className={`${inputClass('description')} min-h-[120px] resize-y`} placeholder="Tell attendees what to expect..." maxLength={1000} />
            <p className="text-xs text-gray-400 mt-1">{form.description.length}/1000</p>
          </div>
        </div>
      </section>

      {/* Background Image Upload */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><ImagePlus className="w-5 h-5 mr-2" /> Background Image</h3>
        <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageSelect} className="hidden" />
        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 group">
            <img src={imagePreview} alt="Event preview" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white text-primary px-4 py-2 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors">Change</button>
              <button type="button" onClick={removeImage} className="bg-red-500 text-white p-2 rounded-xl hover:bg-red-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors group cursor-pointer">
            <ImagePlus className="w-10 h-10 mx-auto mb-3 text-gray-300 group-hover:text-primary transition-colors" />
            <p className="text-sm font-medium text-gray-500 group-hover:text-primary">Click to upload a background image</p>
            <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP, GIF • Max 2MB</p>
          </button>
        )}
        {errors.image && <p className="text-red-500 text-xs mt-2">{errors.image}</p>}
      </section>

      {/* Location */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2" /> Location</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Venue / Address *</label>
            <input type="text" value={form.location} onChange={e => update('location', e.target.value)} className={inputClass('location')} placeholder="e.g. Cairo International Convention Centre" />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" checked={form.is_online} onChange={e => update('is_online', e.target.checked)} />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
            </div>
            <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium text-gray-700">This is an online event</span></div>
          </label>
        </div>
      </section>

      {/* Schedule */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2" /> Schedule</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Start Date & Time *</label>
            <input type="datetime-local" value={form.start_date} onChange={e => update('start_date', e.target.value)} className={inputClass('start_date')} />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">End Date & Time *</label>
            <input type="datetime-local" value={form.end_date} onChange={e => update('end_date', e.target.value)} className={inputClass('end_date')} />
            {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
          </div>
        </div>
      </section>

      {/* Capacity & Pricing */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Users className="w-5 h-5 mr-2" /> Capacity & Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Max Capacity *</label>
            <input type="number" min="1" value={form.capacity} onChange={e => update('capacity', e.target.value)} className={inputClass('capacity')} />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">Ticket Price ($)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} className={inputClass('price')} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            {parseFloat(form.price) === 0 && <p className="text-xs text-green-600 mt-1 font-medium">🎉 Free event!</p>}
          </div>
        </div>
      </section>

      {/* Publishing */}
      <section>
        <h3 className="text-lg font-bold text-primary mb-4 flex items-center"><Eye className="w-5 h-5 mr-2" /> Publishing</h3>
        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          <div className="relative">
            <input type="checkbox" className="sr-only peer" checked={form.is_published} onChange={e => update('is_published', e.target.checked)} />
            <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors"></div>
            <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-700">{form.is_published ? 'Published — visible to everyone' : 'Draft — only visible to you'}</span>
            <p className="text-xs text-gray-400 mt-0.5">You can change this later</p>
          </div>
        </label>
      </section>

      {/* Submit */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <button type="submit" disabled={loading} className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-[#005a63] transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95">
          {loading ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
