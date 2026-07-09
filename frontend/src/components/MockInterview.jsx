import { useState } from 'react';
import { MessageSquare, ArrowRight, User } from 'lucide-react';
import { api } from '../utils/api';

export default function MockInterview({ targetRole, originalData, onUpdate }) {
  const [question, setQuestion] = useState(originalData?.interviewQuestion || '');
  const [answer, setAnswer] = useState(originalData?.interviewAnswer || '');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [report, setReport] = useState(originalData?.interviewReport || null);
  const [error, setError] = useState('');

  const handleGenerateQuestion = async () => {
    setLoadingQuestion(true);
    setError('');
    setReport(null);
    setAnswer('');
    
    try {
      console.log(`[MockInterview] Requesting question for ${targetRole}...`);
      const data = await api.getMockInterviewQuestion(targetRole || 'Software Engineer');
      setQuestion(data.question);
      if (onUpdate) {
        onUpdate({ 
          interviewQuestion: data.question,
          interviewAnswer: '',
          interviewReport: null
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch a new question. Please try again.');
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      setError('Please type in your answer first.');
      return;
    }

    setLoadingEvaluation(true);
    setError('');
    
    try {
      console.log(`[MockInterview] Evaluating mock response...`);
      const result = await api.evaluateMockInterview(question, answer);
      setReport(result);
      if (onUpdate) {
        onUpdate({
          interviewQuestion: question,
          interviewAnswer: answer,
          interviewReport: result
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error evaluating your answer.');
    } finally {
      setLoadingEvaluation(false);
    }
  };

  return (
    <div className="glass rounded-3xl border border-slate-800 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          Mock Interview Simulator
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulate standard HR/Technical rounds. The Mock Interview Agent evaluates answer structuring (e.g. STAR) and estimates self-confidence.
        </p>
      </div>

      <div className="space-y-4">
        {/* Toggle Question Generation */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 border border-slate-850 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <User className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">Current Target Profile</span>
              <span className="text-sm font-semibold text-slate-205">{targetRole || 'Software Engineer'}</span>
            </div>
          </div>

          <button
            onClick={handleGenerateQuestion}
            disabled={loadingQuestion}
            className="px-5 py-2 hover:bg-slate-800 bg-slate-900 border border-slate-800 text-slate-200 text-sm font-semibold rounded-xl transition"
          >
            {loadingQuestion ? 'Generating question...' : question ? 'Fetch Another Question' : 'Start Mock Interview'}
          </button>
        </div>

        {/* Display interview question */}
        {question && (
          <div className="space-y-4 pt-2">
            
            {/* Interviewer Message */}
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-500 flex items-center justify-center font-bold text-sm text-black shrink-0">
                AI
              </div>
              <div className="bg-slate-900 border border-slate-850 rounded-2xl rounded-tl-none p-4 max-w-2xl">
                <span className="text-xs text-slate-500 font-bold block mb-1">Interviewer Question</span>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">{question}</p>
              </div>
            </div>

            {/* Candidate Response Editor */}
            <div className="space-y-3 pl-12">
              <textarea
                className="w-full h-32 p-4 bg-slate-950/20 border border-slate-855 rounded-2xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-600 resize-none font-serif leading-relaxed"
                placeholder="Type your response using Situation-Task-Action-Result format here..."
                value={answer}
                disabled={loadingEvaluation}
                onChange={(e) => setAnswer(e.target.value)}
              />

              {error && (
                <p className="text-sm text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={loadingEvaluation || !answer.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loadingEvaluation ? 'Checking answer content...' : 'Submit Evaluation'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Evaluation Result */}
      {report && (
        <div className="pt-6 border-t border-slate-850 space-y-4">
          <div className="flex items-center gap-3">
            <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg ${
              report.confidence_score >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
              report.confidence_score >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
              'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {report.confidence_score}
            </span>
            <div>
              <h4 className="font-bold text-slate-200 text-sm">Competency & Confidence Rating</h4>
              <p className="text-xs text-slate-500">Evaluates vocabulary, content articulation, structure and professional tone.</p>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Interviewer Feedback</h4>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{report.evaluation}</p>
          </div>
        </div>
      )}

    </div>
  );
}
