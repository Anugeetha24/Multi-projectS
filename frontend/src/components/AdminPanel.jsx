import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Search, SlidersHorizontal, ArrowUpDown, RefreshCw, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';

export default function AdminPanel() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  
  // Filter States
  const [search, setSearch] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [minScore, setMinScore] = useState('');
  const [maxScore, setMaxScore] = useState('');
  const [sortBy, setSortBy] = useState('overall_score');
  const [order, setOrder] = useState('DESC');

  const [expandedFilters, setExpandedFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log('[AdminPanel] Querying database stats table...');
      const params = {
        search,
        targetRole,
        minScore,
        maxScore,
        sortBy,
        order
      };
      const result = await api.getAdminScores(params);
      setData(result);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sync database reports.');
    } finally {
      setLoading(false);
    }
  }, [search, targetRole, minScore, maxScore, sortBy, order]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]); // Re-fetch immediately when any filter or sort changes

  const handleSubmitFilters = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleToggleSort = (field) => {
    if (sortBy === field) {
      setOrder(order === 'DESC' ? 'ASC' : 'DESC');
    } else {
      setSortBy(field);
      setOrder('DESC');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Filter trigger */}
      <div className="glass rounded-3xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Evaluators Administrated Board</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct parameterized SQL-backed queries displaying candidate scores.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setExpandedFilters(!expandedFilters)}
            className="px-4 py-2 hover:bg-slate-800 bg-slate-900 border border-slate-800 text-slate-350 text-sm font-semibold rounded-xl transition flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters Options
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedFilters ? 'rotate-180' : ''}`} />
          </button>
          
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 hover:bg-slate-800 bg-slate-900 border border-slate-800 text-slate-350 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {expandedFilters && (
        <form onSubmit={handleSubmitFilters} className="glass rounded-3xl p-6 border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Text Search */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Students</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-850 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none text-slate-200"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Target Role Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 text-slate-300 text-sm rounded-xl focus:outline-none"
              >
                <option value="">All Job Roles</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="System Architect">System Architect</option>
              </select>
            </div>

            {/* Min overall Score */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Min Placement Score</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none text-slate-205"
              />
            </div>

            {/* Max overall Score */}
            <div className="space-y-1.5 col-span-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Max Placement Score</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="100"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-850 focus:border-indigo-500/50 rounded-xl text-sm focus:outline-none text-slate-205"
              />
            </div>

          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setTargetRole('');
                setMinScore('');
                setMaxScore('');
              }}
              className="px-4 py-2 text-xs font-bold tracking-wide uppercase text-slate-400 hover:text-slate-250 transition"
            >
              Reset All
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition"
            >
              Apply Filter Query
            </button>
          </div>
        </form>
      )}

      {/* Main Table view */}
      <div className="glass rounded-3xl border border-slate-800 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-950/20 border-b border-red-900/40 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-850 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                <th 
                  onClick={() => handleToggleSort('name')} 
                  className="px-6 py-4 cursor-pointer hover:text-slate-100 select-none group"
                >
                  <div className="flex items-center gap-1">
                    Student Description
                    <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition" />
                  </div>
                </th>
                <th 
                  onClick={() => handleToggleSort('target_role')} 
                  className="px-6 py-4 cursor-pointer hover:text-slate-100 select-none group"
                >
                  <div className="flex items-center gap-1">
                    Target Role
                    <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition" />
                  </div>
                </th>
                <th 
                  onClick={() => handleToggleSort('overall_score')} 
                  className="px-6 py-4 cursor-pointer hover:text-slate-100 select-none group"
                >
                  <div className="flex items-center gap-1">
                    Readiness Score
                    <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition" />
                  </div>
                </th>
                <th 
                  onClick={() => handleToggleSort('generated_at')} 
                  className="px-6 py-4 cursor-pointer hover:text-slate-100 select-none group"
                >
                  <div className="flex items-center gap-1">
                    Assessed Date
                    <ArrowUpDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-850/60">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium font-sans">
                    Syncing administration records...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium font-sans">
                    No placement evaluations found matching current filters.
                  </td>
                </tr>
              ) : (
                data.map((student) => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-900/20 transition">
                      
                      {/* Name / Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-slate-405 font-mono">
                            {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block">{student.name}</span>
                            <span className="text-xs text-slate-500">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Target Role */}
                      <td className="px-6 py-4 text-slate-350">
                        {student.target_role || 'Not Set'}
                      </td>

                      {/* Placement Score */}
                      <td className="px-6 py-4">
                        {student.overall_score !== null && student.overall_score !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              student.overall_score >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 
                              student.overall_score >= 60 ? 'bg-blue-500/10 text-blue-400 border border-blue-500/15' : 
                              student.overall_score >= 40 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15' : 
                              'bg-rose-500/10 text-rose-400 border border-rose-500/15'
                            }`}>
                              {student.overall_score}
                            </span>
                            <span className="text-xs text-slate-400">
                              {student.overall_score >= 80 ? 'Excellent' : student.overall_score >= 60 ? 'Good' : 'Needs Work'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Not Evaluated</span>
                        )}
                      </td>

                      {/* Generated At */}
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">
                        {student.generated_at ? new Date(student.generated_at).toLocaleDateString() : 'N/A'}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
