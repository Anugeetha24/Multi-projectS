import { Award, FileText, CheckCircle2, Cpu, MessageSquare } from 'lucide-react';

export default function UnifiedScores({ scoreData }) {
  if (!scoreData) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <Award className="w-16 h-16 text-blue-500 mb-4 stroke-[1.5]" />
        <h3 className="text-xl font-bold mb-2">No score generated yet</h3>
        <p className="text-slate-400 max-w-md">
          Fill in your profile details, upload your resume, and write mock scripts/code below to evaluate your placeability index!
        </p>
      </div>
    );
  }

  const { overall_score, breakdown, generated_at } = scoreData;

  // Circle Math for SVG Gauge
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  const getRating = (score) => {
    if (score >= 85) return 'Excellent placement prospects!';
    if (score >= 70) return 'Strong candidate. Needs minor tweaks.';
    if (score >= 55) return 'Moderate potential. Target core skills.';
    return 'Needs focus. Follow the roadmap.';
  };

  const agents = [
    {
      name: 'Resume Review',
      score: breakdown.resume,
      icon: FileText,
      weight: '15%',
      colorClass: 'from-blue-500 to-indigo-600',
      description: 'ATS compliance rating'
    },
    {
      name: 'Mock Interview',
      score: breakdown.interview,
      icon: Award,
      weight: '10%',
      colorClass: 'from-purple-500 to-pink-600',
      description: 'Conversational confidence'
    },
    {
      name: 'Skill Gap Alignment',
      score: breakdown.skill_gap,
      icon: CheckCircle2,
      weight: '15%',
      colorClass: 'from-teal-400 to-emerald-500',
      description: 'Role-match requirements'
    },
    {
      name: 'Coding Evaluation',
      score: breakdown.coding_eval,
      extraScore: breakdown.coding_consistency, 
      icon: Cpu,
      weight: '40%', // Combines 25% correctness + 15% consistency
      colorClass: 'from-orange-500 to-amber-500',
      description: 'Logic execution & consistency'
    },
    {
      name: 'Communication Skills',
      score: breakdown.communication,
      icon: MessageSquare,
      weight: '20%',
      colorClass: 'from-cyan-500 to-blue-600',
      description: 'Clarity, tone, and grammar'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gauge Chart Panel */}
        <div className="glass rounded-3xl p-6 flex flex-col items-center justify-center relative col-span-1 border border-slate-800">
          <div className="absolute top-4 right-4">
            <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
              Latest Assessment
            </span>
          </div>

          <h3 className="text-lg font-semibold text-slate-300 mb-6">Readiness Rating</h3>

          <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              {/* Back Circle */}
              <circle
                stroke="#1e293b"
                strokeWidth={stroke}
                fill="transparent"
                r={normalizedRadius}
                cx="80"
                cy="80"
              />
              {/* Force Circle */}
              <circle
                className={`transition-all duration-1000 ease-out`}
                stroke={overall_score >= 80 ? '#34d399' : overall_score >= 60 ? '#60a5fa' : overall_score >= 40 ? '#fbbf24' : '#f87171'}
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                fill="transparent"
                r={normalizedRadius}
                cx="80"
                cy="80"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold font-mono tracking-tight select-none">
                {overall_score}
              </span>
              <span className="text-xs text-slate-400 block mt-1">/ 100</span>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="font-semibold text-slate-200">
              {getRating(overall_score)}
            </p>
            {generated_at && (
              <p className="text-xs text-slate-500 mt-2">
                Processed on: {new Date(generated_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Scoring breakdown cards */}
        <div className="glass rounded-3xl p-6 col-span-1 md:col-span-2 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Multivariate Evaluation Insights</h3>
            <p className="text-sm text-slate-400 mb-6">
              Our 5 core specialist agents reviewed your placement data concurrently to compile this performance index.
            </p>
          </div>

          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300`}>
                    <agent.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 block">{agent.name}</span>
                    <span className="text-xs text-slate-500">{agent.description} ({agent.weight} weight)</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-base text-slate-100 mr-2">
                    {agent.score}%
                  </span>
                  {agent.extraScore !== undefined && (
                    <span className="text-xs text-slate-400">
                      (Consistency: {agent.extraScore}%)
                    </span>
                  )}
                  {/* Miniature progress bar */}
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 inline-block block">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${agent.colorClass}`}
                      style={{ width: `${agent.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
