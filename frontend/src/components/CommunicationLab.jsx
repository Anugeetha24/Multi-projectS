import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { api } from '../utils/api';

const SCENARIO_PROMPTS = [
  "Draft a response to a senior project manager explaining that a critical dependency will delay your release by two business days.",
  "Write an email requesting feedback from a lead engineer who recently reviewed a pull request you worked on, but gave rather terse suggestions.",
  "A client is complaining that a feature doesn't work. Draft a response that acknowledges the issue, requests detail logs, and keeps them satisfied.",
];

export default function CommunicationLab({ originalData, onUpdate }) {
  const [prompts] = useState(SCENARIO_PROMPTS);
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [text, setText] = useState(originalData?.communicationResponseText || '');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(originalData?.communicationReport || null);
  const [error, setError] = useState('');

  const handleEvaluate = async () => {
    if (!text.trim()) {
      setError('Please write an answer response text.');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      console.log('[CommLab] Submitting written prompt to assessor agent...');
      const result = await api.evaluateCommunication(text);
      setReport(result);
      if (onUpdate) {
        onUpdate({
          communicationResponseText: text,
          communicationReport: result
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to process assessment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl border border-slate-800 p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            Communication Coaching Agent
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build premium professional copywriting. Draft email templates or behavioral replies to evaluate syntax hygiene and clarity index.
          </p>
        </div>

        <div>
          <select
            value={selectedPromptIdx}
            onChange={(e) => {
              setSelectedPromptIdx(parseInt(e.target.value, 10));
              setReport(null);
              setError('');
            }}
            className="px-4 py-2 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-205 text-sm font-semibold rounded-xl focus:outline-none"
          >
            {prompts.map((p, idx) => (
              <option key={idx} value={idx}>
                Scenario Case {idx + 1}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-slate-900 border border-slate-850 rounded-2xl">
          <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold mb-1">Coaching Prompt Case</span>
          <p className="text-sm text-slate-300 italic">
            &ldquo;{prompts[selectedPromptIdx]}&rdquo;
          </p>
        </div>

        <textarea
          className="w-full h-36 p-4 bg-slate-950/20 border border-slate-855 focus:border-cyan-500/50 rounded-2xl text-sm focus:outline-none text-slate-200 resize-none font-serif leading-relaxed"
          placeholder="Compose your response email/letter text here..."
          value={text}
          disabled={loading}
          onChange={(e) => setText(e.target.value)}
        />

        {error && (
          <p className="text-sm text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleEvaluate}
            disabled={loading || !text.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Analyzing syntax clarity...' : 'Analyze Communication'}
          </button>
        </div>
      </div>

      {report && (
        <div className="pt-6 border-t border-slate-850 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Clarity Score */}
            <div className="flex items-center gap-3 bg-slate-900/50 p-4 border border-slate-850 rounded-2xl">
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg ${
                report.clarity_score >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {report.clarity_score}
              </span>
              <div>
                <h4 className="font-bold text-slate-205 text-sm">Clarity Index</h4>
                <p className="text-xs text-slate-500">Grammar structuring & punchy delivery.</p>
              </div>
            </div>

            {/* Grammar Score */}
            <div className="flex items-center gap-3 bg-slate-900/50 p-4 border border-slate-850 rounded-2xl">
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg ${
                report.grammar_score >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {report.grammar_score}
              </span>
              <div>
                <h4 className="font-bold text-slate-205 text-sm">Grammatic Accuracy</h4>
                <p className="text-xs text-slate-500">Spelling, syntax, and punctuation check.</p>
              </div>
            </div>

          </div>

          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assessor Feedback</h4>
            <div className="text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
              {report.feedback}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
