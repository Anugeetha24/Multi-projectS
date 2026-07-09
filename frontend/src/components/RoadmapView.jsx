import { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Square } from 'lucide-react';

export default function RoadmapView({ roadmapData }) {
  const [completedTasks, setCompletedTasks] = useState({});

  useEffect(() => {
    // Reload saved ticks from localStorage to give a real persistent checklist feel
    const stored = localStorage.getItem('roadmap_progress');
    if (stored) {
      try {
        setCompletedTasks(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  if (!roadmapData || !roadmapData.weeks) {
    return (
      <div className="glass rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <Calendar className="w-16 h-16 text-indigo-500 mb-4 stroke-[1.5]" />
        <h3 className="text-xl font-bold mb-2">No Roadmap Generated</h3>
        <p className="text-slate-400 max-w-md">
          Once your portfolio evaluation runs, the central orchestrator will compile your personalized 30-day recovery plan here.
        </p>
      </div>
    );
  }

  const toggleTask = (weekIndex, taskIndex) => {
    const key = `${weekIndex}-${taskIndex}`;
    const updated = {
      ...completedTasks,
      [key]: !completedTasks[key]
    };
    setCompletedTasks(updated);
    localStorage.setItem('roadmap_progress', JSON.stringify(updated));
  };

  // Calculate progress percentage
  const totalTasks = roadmapData.weeks.reduce((acc, week) => acc + (week.tasks ? week.tasks.length : 0), 0);
  const doneTasks = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Progress header card */}
      <div className="glass rounded-3xl p-6 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            Your 30-Day Placement Roadmap
          </h2>
          <span className="text-sm text-slate-400 block mt-1">
            Actions focused on scaling your target role placeability metrics.
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Overall Progress</span>
            <span className="text-2xl font-bold font-mono text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-32 bg-slate-900 border border-slate-800 h-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Week Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roadmapData.weeks.map((w, weekIdx) => {
          return (
            <div 
              key={w.week} 
              className="glass rounded-3xl p-6 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                {/* Week Indicator badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                    Week {w.week}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    7 Days Focus
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-200 mb-2">
                  {w.focus || 'Core Skill Leveling'}
                </h3>
                
                <div className="mt-4 space-y-3">
                  {w.tasks && w.tasks.map((task, taskIdx) => {
                    const isCompleted = !!completedTasks[`${weekIdx}-${taskIdx}`];
                    return (
                      <div 
                        key={taskIdx}
                        onClick={() => toggleTask(weekIdx, taskIdx)}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer select-none ${
                          isCompleted 
                            ? 'bg-indigo-950/20 border-indigo-900/40 text-slate-400' 
                            : 'bg-slate-900/30 border-slate-800 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0 text-indigo-400">
                          {isCompleted ? (
                            <CheckSquare className="w-5 h-5 fill-indigo-500/10" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </div>
                        <span className={`text-sm ${isCompleted ? 'line-through' : ''}`}>
                          {task}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Completed Tasks</span>
                <span className="font-mono">
                  {w.tasks ? w.tasks.filter((_, idx) => !!completedTasks[`${weekIdx}-${idx}`]).length : 0} / {w.tasks ? w.tasks.length : 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
