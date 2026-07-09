import { useState } from 'react';
import { UploadCloud, FileText, Check } from 'lucide-react';
import { api } from '../utils/api';

export default function ResumeUpload({ originalData, onUpdate }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState(originalData?.resumeText || '');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(originalData?.resumeReport || null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file && !text.trim()) {
      setError('Please upload a PDF file or paste your resume content.');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('resumeFile', file);
      } else {
        formData.append('resumeText', text);
      }

      console.log('[ResumeUpload] Triggering single ATS report review...');
      const result = await api.reviewResume(formData);
      
      setReport(result);
      if (onUpdate) {
        // Send up the resume text to App.jsx state so it is cached for the full Orchestrated call
        onUpdate({ 
          resumeText: text || 'PDF Uploaded Content', 
          resumeReport: result 
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-3xl border border-slate-800 p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          Resume ATS Review Agent
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload your resume in PDF format or paste its contents. The specialist agent will scan keywords, formatting sections, and grade your ATS score.
        </p>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4">
        
        {/* Toggle file/text input tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col justify-center border-2 border-dashed border-slate-850 hover:border-indigo-500/50 p-6 rounded-2xl transition relative bg-slate-900/10">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              id="resume-file"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-center space-y-2 pointer-events-none">
              <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">
                {file ? file.name : 'Upload PDF File'}
              </p>
              <p className="text-xs text-slate-500">
                PDF up to 5MB
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <textarea
              className="w-full h-32 p-3 bg-slate-900 border border-slate-850 focus:border-indigo-500 rounded-2xl text-sm font-serif text-slate-300 placeholder-slate-600 focus:outline-none resize-none"
              placeholder="Or paste raw resume text here directly..."
              value={text}
              disabled={!!file}
              onChange={(e) => setText(e.target.value)}
            />
            {file && (
              <button 
                type="button" 
                onClick={() => setFile(null)} 
                className="text-xs text-slate-400 underline mt-1 text-left self-start hover:text-red-400"
              >
                Clear file to enable text input
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {report?.cached && (
              <span className="text-green-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Reused Cached Report (No API Charge)
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Analyzing Content...' : 'Evaluate ATS Report'}
          </button>
        </div>
      </form>

      {/* Render ATS Report Result */}
      {report && (
        <div className="pt-6 border-t border-slate-850 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/50 p-4 border border-slate-850 rounded-2xl gap-4">
            <div className="flex items-center gap-3">
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-lg ${
                report.ats_score >= 80 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                report.ats_score >= 65 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {report.ats_score}
              </span>
              <div>
                <h4 className="font-bold text-slate-200 text-sm">ATS Placeability Grade</h4>
                <p className="text-xs text-slate-500">Based on industry formatting, sections, and keywords.</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 uppercase text-slate-400 bg-slate-905 border border-slate-800 rounded-full">
              {report.ats_score >= 80 ? 'Pass' : 'Requires Adjustment'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Missing Sections */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Missing / Fragile Areas</h4>
              <div className="space-y-2">
                {report.missing_sections && report.missing_sections.length > 0 ? (
                  report.missing_sections.map((section, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>{section}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No major sections missing. Keep it up!</p>
                )}
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Recommendations</h4>
              <ul className="space-y-2.5">
                {report.suggestions && report.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-350">
                    <span className="text-indigo-400 font-bold shrink-0">{idx + 1}.</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
