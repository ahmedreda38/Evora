import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, SlidersHorizontal, X, ArrowRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import EventCard from '../components/EventCard';

const CATEGORIES = ['All','Conference','Technology','Workshop','Healthcare','Design','Music','Sports','Business','Education'];
const PRICE_RANGES = [
  { label: 'Any Price', value: null },
  { label: 'Free', value: 0 },
  { label: 'Under $50', value: 50 },
  { label: 'Under $100', value: 100 },
  { label: 'Under $500', value: 500 },
];

export default function Discover() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(null);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const endpoint = category !== 'All' ? `/events/search/category/${category}` : '/events/';
    axios.get(endpoint)
      .then(res => { setEvents(Array.isArray(res.data) ? res.data : []); setLoading(false); })
      .catch(() => { setEvents([]); setLoading(false); });
  }, [category]);

  const filteredEvents = useMemo(() => {
    let result = [...events];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e => e.name?.toLowerCase().includes(q) || e.category?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    if (location) { const loc = location.toLowerCase(); result = result.filter(e => e.location?.toLowerCase().includes(loc)); }
    if (priceRange !== null) result = result.filter(e => e.price <= priceRange);
    if (onlineOnly) result = result.filter(e => e.is_online);
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date': return new Date(a.start_date) - new Date(b.start_date);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });
    return result;
  }, [events, search, location, priceRange, onlineOnly, sortBy]);

  const activeFilterCount = [category !== 'All', priceRange !== null, onlineOnly, location !== ''].filter(Boolean).length;
  const clearFilters = () => { setCategory('All'); setPriceRange(null); setOnlineOnly(false); setLocation(''); setSearch(''); };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-[#005a63] pt-12 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">Discover Events</h1>
            <p className="text-white/70 text-lg mb-8">Find your next extraordinary experience</p>
            <div className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <div className="flex-1 flex items-center px-4 py-2">
                <Search className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                <input type="text" placeholder="Search events..." className="w-full bg-transparent focus:outline-none text-gray-700" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <div className="hidden md:block w-px h-8 bg-gray-200"></div>
              <div className="flex-1 flex items-center px-4 py-2">
                <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
                <input type="text" placeholder="Location..." className="w-full bg-transparent focus:outline-none text-gray-700" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <button onClick={() => setFiltersOpen(!filtersOpen)} className={`md:hidden flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-colors ${filtersOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}>
                <SlidersHorizontal className="w-5 h-5 mr-2" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-primary text-lg flex items-center"><Filter className="w-5 h-5 mr-2" /> Filters</h3>
                {activeFilterCount > 0 && <button onClick={clearFilters} className="text-sm text-accent hover:text-[#d68566] font-medium">Clear all</button>}
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</h4>
                <div className="space-y-1">{CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${category === cat ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{cat}</button>
                ))}</div>
              </div>
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Range</h4>
                <div className="space-y-1">{PRICE_RANGES.map(pr => (
                  <button key={pr.label} onClick={() => setPriceRange(pr.value)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${priceRange === pr.value ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-50'}`}>{pr.label}</button>
                ))}</div>
              </div>
              <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <span className="text-sm font-medium text-gray-700">Online Only</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={onlineOnly} onChange={e => setOnlineOnly(e.target.checked)} />
                  <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors"></div>
                  <div className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                </div>
              </label>
            </div>
          </aside>

          {/* Mobile Filters */}
          <AnimatePresence>{filtersOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-wrap gap-2 mb-4">{CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${category === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{cat}</button>
              ))}</div>
              <div className="flex flex-wrap gap-2 mb-4">{PRICE_RANGES.map(pr => (
                <button key={pr.label} onClick={() => setPriceRange(pr.value)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${priceRange === pr.value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600'}`}>{pr.label}</button>
              ))}</div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={onlineOnly} onChange={e => setOnlineOnly(e.target.checked)} className="rounded text-primary" />
                <span className="text-sm text-gray-700">Online Only</span>
              </label>
            </motion.div>
          )}</AnimatePresence>

          {/* Results */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <p className="text-gray-600"><span className="font-bold text-primary">{filteredEvents.length}</span> events found
                {activeFilterCount > 0 && <button onClick={clearFilters} className="ml-3 text-xs text-accent hover:text-[#d68566] font-medium inline-flex items-center"><X className="w-3 h-3 mr-1" /> Clear</button>}
              </p>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="date">Sort by Date</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </div>

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3"><div className="h-5 bg-gray-200 rounded w-3/4"></div><div className="h-4 bg-gray-100 rounded w-1/2"></div></div>
                </div>
              ))}</div>
            )}

            {!loading && filteredEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((evt, idx) => <EventCard key={evt.id} event={evt} index={idx} />)}
              </div>
            )}

            {!loading && filteredEvents.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-6"><Search className="w-10 h-10 text-accent" /></div>
                <h3 className="text-xl font-bold text-primary mb-2">No events found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
                <button onClick={clearFilters} className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-[#005a63] transition-colors inline-flex items-center">
                  Clear All Filters <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
