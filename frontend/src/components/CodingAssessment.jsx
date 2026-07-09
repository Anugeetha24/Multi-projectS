import { useState, useEffect } from 'react';
import { Code2, Terminal, AlertTriangle, Check } from 'lucide-react';
import { api } from '../utils/api';

export default function CodingAssessment({ originalData, onUpdate }) {
  const [problems, setProblems] = useState([]);
  const [selectedProblemIndex, setSelectedProblemIndex] = useState(0);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(originalData?.codingReport || null);
  const [error, setError] = useState('');
  const [fetchingProblems, setFetchingProblems] = useState(true);

  useEffect(() => {
    async function loadProblems() {
      try {
        const list = await api.getCodingProblems();
        setProblems(list);
        if (list.length > 0) {
          setCode(list[0].starterCode);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch coding problems from server.');
      } finally {
        setFetchingProblems(false);
      }
    }
    loadProblems();
  }, []);

  const handleProblemChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    setSelectedProblemIndex(idx);
    setCode(problems[idx].starterCode);
    setReport(null);
    setError('');
  };

  const handleEvaluate = async () => {
    if (!code.trim()) {
      setError('Code submission area cannot be blank.');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    const problem = problems[selectedProblemIndex];

    try {
      console.log(`[CodingLab] Compiling code hash for problem ${problem.title}...`);
      const result = await api.evaluateCoding(problem.title, code);
      setReport(result);
      
      if (onUpdate) {
        // Send state back to App.jsx so coding evaluation is stored dynamically
        onUpdate({
          codingProblemTitle: problem.title,
          codeSubmitted: code,
          codingReport: result
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error processing code evaluation.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingProblems) {
    return (
      <div className="glass rounded-3xl p-8 text-center text-slate-400">
        Loading coding problem syllabus...
      </div>
    );
  }

  const activeProblem = problems[selectedProblemIndex];

  return (
    <div className="glass rounded-3xl border border-slate-800 p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-500" />
            Coding Evaluation Agent
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose a challenge, implement your JavaScript solution, and obtain code quality feedback.
          </p>
        </div>

        <div>
          <select
            onChange={handleProblemChange}
            value={selectedProblemIndex}
            className="px-4 py-2 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-200 text-sm font-semibold rounded-xl focus:outline-none"
          >
            {problems.map((p, idx) => (
              <option key={p.id} value={idx}>
                {p.title} ({p.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Problem Card Panel */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Challenge Details</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeProblem?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {activeProblem?.difficulty}
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-250">{activeProblem?.title}</h3>
          
          <p className="text-sm text-slate-350 leading-relaxed whitespace-pre-line mt-2">
            {activeProblem?.description}
          </p>

          <div className="p-3 bg-amber-500/5 border border-amber-500/10 text-amber-400/90 rounded-xl space-y-1.5 mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Runtime Instructions
            </h4>
            <p className="text-[11px] leading-relaxed">
              Make sure code contains exactly the function signature matched on the starter editor block. Standard execution logs (using JS) will be automatically evaluated.
            </p>
          </div>
        </div>

        {/* Editor Code Panel */}
        <div className="lg:col-span-3 flex flex-col space-y-4">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-850 px-4 py-2.5 rounded-t-2xl border-b-none">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-mono text-slate-500 ml-2">sandbox.js (JavaScript)</span>
            </div>
            <Terminal className="w-4 h-4 text-slate-500" />
          </div>

          <textarea
            className="w-full h-80 p-5 bg-[#080d19] border border-slate-850 border-t-0 rounded-b-2xl font-mono text-xs text-slate-300 focus:outline-none resize-none leading-relaxed"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          {error && (
            <p className="text-sm text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 font-mono">
              {report?.cached && (
                <span className="text-green-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Used Cached Report (No computation lag)
                </span>
              )}
            </div>

            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Evaluating logic...' : 'Submit Code'}
            </button>
          </div>
        </div>

      </div>

      {/* Render Code Evaluation Report */}
      {report && (
        <div className="pt-6 border-t border-slate-850 space-y-4">
          <div className="flex items-center justify-between bg-slate-900/50 p-4 border border-slate-850 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg ${
                report.correctness_score >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                report.correctness_score >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {report.correctness_score}
              </span>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">Correctness and Quality Index</h4>
                <p className="text-xs text-slate-500">Includes runtime optimizations, memory leaks, and correctness scores.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Feedback Report details</h4>
            <div className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {report.feedback}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
