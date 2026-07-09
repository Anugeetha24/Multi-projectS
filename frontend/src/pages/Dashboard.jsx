import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, FileText, Code2, MessageSquare, MessageCircle, ShieldCheck, 
  User, LogOut, Loader2, Award, Zap, BookOpen, AlertCircle
} from 'lucide-react';
import { api } from '../utils/api';
import UnifiedScores from '../components/UnifiedScores';
import ResumeUpload from '../components/ResumeUpload';
import MockInterview from '../components/MockInterview';
import CodingAssessment from '../components/CodingAssessment';
import CommunicationLab from '../components/CommunicationLab';
import AdminPanel from '../components/AdminPanel';
import RoadmapView from '../components/RoadmapView';

export default function Dashboard({ student, onLogout }) {
  const [activeTab, setActiveTab] = useState('hub');
  
  // Unified Input State for evaluation
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState(student.target_role || 'Software Engineer');
  const [currentSkills, setCurrentSkills] = useState('React, JavaScript, CSS, Node.js');
  const [interviewQuestion, setInterviewQuestion] = useState('');
  const [interviewAnswer, setInterviewAnswer] = useState('');
  const [codingProblemTitle, setCodingProblemTitle] = useState('Two Sum');
  const [codeSubmitted, setCodeSubmitted] = useState('');
  const [communicationResponseText, setCommunicationResponseText] = useState('');

  // Cached Reports
  const [resumeReport, setResumeReport] = useState(null);
  const [codingReport, setCodingReport] = useState(null);
  const [interviewReport, setInterviewReport] = useState(null);
  const [communicationReport, setCommunicationReport] = useState(null);
  const [skillGapReport, setSkillGapReport] = useState(null);

  // Overall Placement Score Result
  const [scoreData, setScoreData] = useState(null);

  // Loading & Error states
  const [fullEvaluating, setFullEvaluating] = useState(false);
  const [loadingSkillGap, setLoadingSkillGap] = useState(false);
  const [skillGapError, setSkillGapError] = useState('');
  const [error, setError] = useState('');

  // Fetch student's latest reports on mount
  const loadLatestReport = useCallback(async () => {
    try {
      console.log(`[Dashboard] Fetching reports for student ${student.id}...`);
      const report = await api.getStudentReport(student.id);
      
      if (report) {
        if (report.placementScore) {
          setScoreData({
            overall_score: report.placementScore.overall_score,
            breakdown: report.placementScore.breakdown,
            generated_at: report.placementScore.generated_at
          });
          if (report.placementScore.roadmap) {
            setScoreData(prev => ({
              ...prev,
              roadmap: report.placementScore.roadmap
            }));
          }
        }
        
        if (report.resumeReport) {
          setResumeReport(report.resumeReport);
          setResumeText(report.resumeReport.resume_text || '');
        }
        if (report.codingReport) {
          setCodingReport(report.codingReport);
          setCodingProblemTitle(report.codingReport.problem_title);
          setCodeSubmitted(report.codingReport.code_submitted);
        }
        if (report.interviewReport) {
          setInterviewReport(report.interviewReport);
          setInterviewQuestion(report.interviewReport.question);
          setInterviewAnswer(report.interviewReport.answer);
        }
        if (report.communicationReport) {
          setCommunicationReport(report.communicationReport);
          setCommunicationResponseText(report.communicationReport.response_text);
        }
        if (report.skillGapReport) {
          setSkillGapReport(report.skillGapReport);
        }
      }
    } catch (err) {
      console.error('Error fetching student report:', err);
    }
  }, [student.id]);

  useEffect(() => {
    loadLatestReport();
  }, [loadLatestReport]);

  const handleUpdateProfile = async (newRole) => {
    setTargetRole(newRole);
    try {
      await api.updateProfile({ target_role: newRole });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSkillGapScan = async () => {
    if (!currentSkills.trim()) {
      setSkillGapError('Please write in some of your current skills first.');
      return;
    }
    setLoadingSkillGap(true);
    setSkillGapError('');
    try {
      console.log('[Dashboard] Analyzing skill gaps relative to target job...');
      const report = await api.analyzeSkillGap(targetRole, currentSkills);
      setSkillGapReport(report);
    } catch (err) {
      setSkillGapError(err.message || 'Skill gap evaluation failed.');
    } finally {
      setLoadingSkillGap(false);
    }
  };

  const handleFullEvaluation = async () => {
    setFullEvaluating(true);
    setError('');
    
    try {
      const payload = new FormData();
      payload.append('resumeText', resumeText || 'No Resume Text pasted.');
      payload.append('targetRole', targetRole);
      payload.append('currentSkills', currentSkills);
      payload.append('interviewQuestion', interviewQuestion || 'No Question generated.');
      payload.append('interviewAnswer', interviewAnswer || 'No Interview Answer typed.');
      payload.append('codingProblemTitle', codingProblemTitle);
      payload.append('codeSubmitted', codeSubmitted || '// Empty code submitted.');
      payload.append('communicationResponseText', communicationResponseText || 'No reply typed.');

      console.log('[Dashboard] Launching parallel 5-agent pipeline...');
      const response = await api.evaluateFull(payload);
      
      setScoreData({
        overall_score: response.data.overall_score,
        breakdown: response.data.breakdown,
        roadmap: response.data.roadmap,
        generated_at: response.data.generated_at
      });

      // Reload sub-agent reports to align local cache variables
      await loadLatestReport();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Assessment pipeline timed out or encountered backend execution error.');
    } finally {
      setFullEvaluating(false);
    }
  };

  // Nav menus details
  const menuItems = [
    { id: 'hub', label: 'Readiness Hub', icon: BarChart3 },
    { id: 'resume', label: 'Resume Reviewer', icon: FileText },
    { id: 'coding', label: 'Coding Lab', icon: Code2 },
    { id: 'interview', label: 'Mock Interview', icon: MessageSquare },
    { id: 'communication', label: 'Communications', icon: MessageCircle },
    { id: 'admin', label: 'Admin Analytics', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080d17]">
      
      {/* Side Bar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950/70 border-r border-slate-900 flex flex-col justify-between shrink-0 p-5 gap-6">
        <div className="space-y-6">
          
          {/* Platform Identity */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-100 text-sm block">Placement AI</span>
              <span className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">Orchestrator v1</span>
            </div>
          </div>

          {/* Student Profile Overview */}
          <div className="p-3.5 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="font-semibold text-slate-200 text-xs block truncate">{student.name}</span>
              <span className="text-[10px] text-slate-500 block truncate">{student.email}</span>
            </div>
          </div>

          {/* Tabs Menu */}
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/10 transition"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log Out
        </button>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6 max-w-5xl mx-auto w-full">
        
        {/* Loading Overlay for Pipeline */}
        {fullEvaluating && (
          <div className="fixed inset-0 bg-slate-950/80 z-50 flex flex-col items-center justify-center text-center p-4 backdrop-blur-md">
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-slate-100">AI Evaluation Pipeline Triggered</h2>
            <p className="text-sm text-slate-400 max-w-md mt-2">
              Our 5 core specialist agents are reviewing your resume compliance, coding logic correctness, mock STAR answers, skill gaps, and communication tone in parallel.
            </p>
            <span className="text-xs text-indigo-400 mt-4 font-semibold tracking-wider uppercase animate-pulse">
              Analyzing Portfolio... Expected time: 5-8 seconds
            </span>
          </div>
        )}

        {/* Render Tab Contents */}
        {activeTab === 'hub' && (
          <div className="space-y-6">
            
            {/* Target Job Role & Action trigger */}
            <div className="glass rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              <div className="space-y-4 md:space-y-0 md:flex items-center gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Target Career Role</h3>
                  <select
                    value={targetRole}
                    onChange={(e) => handleUpdateProfile(e.target.value)}
                    className="mt-1 px-4 py-2 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-205 text-sm font-semibold rounded-xl focus:outline-none"
                  >
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="System Architect">System Architect</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Current Skills</h3>
                  <input
                    type="text"
                    value={currentSkills}
                    onChange={(e) => setCurrentSkills(e.target.value)}
                    placeholder="E.g. JavaScript, React, MySQL..."
                    className="mt-1 px-4 py-2.5 bg-slate-900 border border-slate-850 focus:border-slate-700 text-slate-202 text-xs rounded-xl focus:outline-none w-48 sm:w-64"
                  />
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={handleFullEvaluation}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/10 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  Evaluate Placement Readiness
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 text-rose-400 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Unified Score gauge card */}
            <UnifiedScores scoreData={scoreData} />

            {/* Skill Gap Analysis Box */}
            <div className="glass rounded-3xl border border-slate-800 p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-205 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  Skill Gap & Role Analysis
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check critical coding languages/frameworks missing from your portfolio credentials.
                </p>
              </div>

              <div className="flex items-center gap-2 justify-between pt-2">
                <button
                  onClick={handleSkillGapScan}
                  disabled={loadingSkillGap}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  {loadingSkillGap ? 'Scanning gap reports...' : 'Compute Core Gaps'}
                </button>
                {skillGapError && <span className="text-rose-455 text-xs">{skillGapError}</span>}
              </div>

              {skillGapReport && (
                <div className="pt-2 grid grid-cols-1 gap-2">
                  <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wide">Missing Core Competencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {skillGapReport.missing_skills && skillGapReport.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-950/10 border border-red-900/20 text-red-400 rounded-full text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 30-Day Checklist Roadmap */}
            {scoreData?.roadmap && (
              <RoadmapView roadmapData={scoreData.roadmap} />
            )}
          </div>
        )}

        {/* Tab 2: Resume Reviewer */}
        {activeTab === 'resume' && (
          <ResumeUpload 
            originalData={{ resumeText, resumeReport }} 
            onUpdate={(data) => {
              setResumeText(data.resumeText);
              setResumeReport(data.resumeReport);
            }} 
          />
        )}

        {/* Tab 3: Coding Lab */}
        {activeTab === 'coding' && (
          <CodingAssessment 
            originalData={{ codingProblemTitle, codeSubmitted, codingReport }} 
            onUpdate={(data) => {
              setCodingProblemTitle(data.codingProblemTitle);
              setCodeSubmitted(data.codeSubmitted);
              setCodingReport(data.codingReport);
            }}
          />
        )}

        {/* Tab 4: Mock Interview */}
        {activeTab === 'interview' && (
          <MockInterview 
            targetRole={targetRole} 
            originalData={{ interviewQuestion, interviewAnswer, interviewReport }} 
            onUpdate={(data) => {
              setInterviewQuestion(data.interviewQuestion);
              setInterviewAnswer(data.interviewAnswer);
              setInterviewReport(data.interviewReport);
            }}
          />
        )}

        {/* Tab 5: Communication */}
        {activeTab === 'communication' && (
          <CommunicationLab 
            originalData={{ communicationResponseText, communicationReport }} 
            onUpdate={(data) => {
              setCommunicationResponseText(data.communicationResponseText);
              setCommunicationReport(data.communicationReport);
            }}
          />
        )}

        {/* Tab 6: Admin analytics panel */}
        {activeTab === 'admin' && (
          <AdminPanel />
        )}

      </main>
    </div>
  );
}
