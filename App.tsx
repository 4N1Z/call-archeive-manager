import React, { useState, useEffect } from 'react';
import { SearchFilters, Recording } from './types';
import { getRecordings } from './services/recordingService';
import { RecordingsDataTable } from './components/RecordingsDataTable';
import AudioPlayer from './components/AudioPlayer';
import AddRecordingForm from './components/AddRecordingForm';
import { MOCK_WORKGROUPS } from './constants';
import { Search, Filter, Database, RefreshCw, Lock, ShieldCheck, PlayCircle, BarChart3, AlertTriangle, LogOut, Plus, X } from 'lucide-react';

// ----------------------------------------------------------------------
// Simple Auth Implementation
// ----------------------------------------------------------------------

interface User {
  firstName: string;
  fullName: string;
}

const MOCK_USER: User = {
  firstName: 'Admin',
  fullName: 'Admin User'
};

interface DashboardProps {
  onLogout: () => void;
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    InteractionID: '',
    AgentName: '',
    DateFrom: '',
    DateTo: '',
    DNIS: '',
    ANI: '',
    Workgroup: '',
    Direction: '',
    MediaType: '',
    RecordingType: '',
    Tags: '',
  });

  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Initial load
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const results = await getRecordings(filters);
      setRecordings(results);
    } catch (error) {
      console.error("Failed to fetch recordings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      InteractionID: '',
      AgentName: '',
      DateFrom: '',
      DateTo: '',
      DNIS: '',
      ANI: '',
      Workgroup: '',
      Direction: '',
      MediaType: '',
      RecordingType: '',
      Tags: '',
    });
    // Automatically search after clearing to show all records
    setTimeout(() => handleSearch(), 0);
  };

  const handleAddSuccess = () => {
    handleSearch(); // Refresh the list
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return !!(
      filters.InteractionID ||
      filters.AgentName ||
      filters.DateFrom ||
      filters.DateTo ||
      filters.DNIS ||
      filters.ANI ||
      filters.Workgroup ||
      filters.Direction ||
      filters.MediaType ||
      filters.RecordingType ||
      filters.Tags
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 pb-36">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Archive Manager</h1>
                <p className="text-xs text-gray-500 font-medium">Recording Retrieval System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleSearch()}
                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw size={20} />
              </button>
              <div className="hidden sm:flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                S3 Connected
              </div>
              <div className="h-6 w-px bg-gray-200 mx-1"></div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 hidden md:block">
                  {user.fullName}
                </span>
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search Panel */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
            <Filter className="w-5 h-5 text-indigo-600 mr-2" />
            <h2 className="text-lg font-bold text-gray-800">Search Criteria</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Row 1 */}
            <div className="space-y-1">
              <label htmlFor="InteractionID" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Interaction ID</label>
              <input
                type="text"
                name="InteractionID"
                id="InteractionID"
                placeholder="Search Attributes..."
                value={filters.InteractionID}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="AgentName" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Agent / Participant</label>
              <input
                type="text"
                name="AgentName"
                id="AgentName"
                placeholder="Name of agent..."
                value={filters.AgentName}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="Workgroup" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Workgroup</label>
              <select
                name="Workgroup"
                id="Workgroup"
                value={filters.Workgroup}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white"
              >
                <option value="">All Workgroups</option>
                {MOCK_WORKGROUPS.map(wg => (
                  <option key={wg} value={wg}>{wg}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="Direction" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Direction</label>
              <select
                name="Direction"
                id="Direction"
                value={filters.Direction}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border bg-white"
              >
                <option value="">Any Direction</option>
                <option value="Inbound">Inbound</option>
                <option value="Outbound">Outbound</option>
                <option value="Intercom">Intercom</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="Tags" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Tags</label>
              <input
                type="text"
                name="Tags"
                id="Tags"
                placeholder="Search tags..."
                value={filters.Tags}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="MediaType" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Media Type</label>
              <input
                type="text"
                name="MediaType"
                id="MediaType"
                placeholder="e.g. audio/mp3"
                value={filters.MediaType}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="RecordingType" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Recording Type</label>
              <input
                type="text"
                name="RecordingType"
                id="RecordingType"
                placeholder="e.g. normal"
                value={filters.RecordingType}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            {/* Row 2 */}
            <div className="space-y-1">
              <label htmlFor="ANI" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">ANI (From)</label>
              <input
                type="text"
                name="ANI"
                id="ANI"
                placeholder="Caller Phone..."
                value={filters.ANI}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="DNIS" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">DNIS (To)</label>
              <input
                type="text"
                name="DNIS"
                id="DNIS"
                placeholder="Dialed Number..."
                value={filters.DNIS}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="DateFrom" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Date From</label>
              <input
                type="date"
                name="DateFrom"
                id="DateFrom"
                value={filters.DateFrom}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border text-gray-600"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="DateTo" className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Date To</label>
              <input
                type="date"
                name="DateTo"
                id="DateTo"
                value={filters.DateTo}
                onChange={handleInputChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3 border text-gray-600"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-100">
            {/* Active Filters Indicator */}
            {hasActiveFilters() && (
              <div className="flex items-center space-x-2 text-sm text-indigo-600">
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters Active</span>
              </div>
            )}
            {!hasActiveFilters() && <div></div>}
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </button>
              )}
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.02]"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Records
              </button>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-bold text-gray-900">Search Results</h2>
              {hasSearched && !loading && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {recordings.length} Recordings Found
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Recording
            </button>
          </div>

          <RecordingsDataTable
            data={recordings}
            loading={loading}
            onPlay={setCurrentRecording}
          />
        </section>
      </main>

      {/* Audio Player */}
      <AudioPlayer
        recording={currentRecording}
        onClose={() => setCurrentRecording(null)}
      />

      {/* Add Recording Form */}
      {showAddForm && (
        <AddRecordingForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

interface LandingPageProps {
  onLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      onLogin();
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">CallArchiver</span>
        </div>
        <div>
          <button
            onClick={() => setShowLogin(true)}
            className="text-sm font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="grow flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <ShieldCheck size={14} className="mr-1.5" />
              Secure Enterprise Access
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Manage your call recordings with confidence.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              A secure, searchable repository for all your interaction data.
              Search by agent, customer, or metadata. Stream securely from S3.
            </p>

            {!showLogin ? (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowLogin(true)}
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg shadow-indigo-200 transition-all"
                >
                  <Lock size={18} className="mr-2" />
                  Access Dashboard
                </button>
                <button className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all">
                  Learn more
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 max-w-sm mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sign In</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      placeholder="Enter 'admin'"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                      placeholder="Enter 'password'"
                    />
                  </div>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white rounded-md py-2 hover:bg-indigo-700 font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="flex-1 bg-gray-100 text-gray-700 rounded-md py-2 hover:bg-gray-200 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600 blur-3xl opacity-10 rounded-full transform translate-x-12 translate-y-12"></div>
            <div className="relative bg-white border border-gray-200 shadow-2xl rounded-2xl p-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs text-gray-400">Archiver v2.4</div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <PlayCircle className="text-indigo-600 mr-3" />
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <BarChart3 className="text-emerald-600 mr-3" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-2 bg-gray-200 rounded w-10"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg opacity-60">
                  <Database className="text-slate-500 mr-3" />
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 rounded w-2/3 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-100">
        © {new Date().getFullYear()} CallArchiver Enterprise.
      </footer>
    </div>
  );
};



const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {!isAuthenticated ? (
        <LandingPage onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <Dashboard onLogout={() => setIsAuthenticated(false)} user={MOCK_USER} />
      )}
    </>
  );
};

export default App;