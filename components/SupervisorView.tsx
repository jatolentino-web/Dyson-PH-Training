
import React, { useState, useMemo } from 'react';
import { ChecklistItem, CoachingSession } from '../types';
import { getCoachingFeedback } from '../services/geminiService';
import { pushSessionToCloud } from '../services/cloudService';
import { Loader2, CheckCircle, Sparkles, Copy, Zap, MessageSquareText, FileText, ChevronRight } from 'lucide-react';

interface SupervisorViewProps {
  checklist: ChecklistItem[];
  onSave: (session: CoachingSession) => void;
  cloudEnabled: boolean;
  workspaceId: string;
  existingSessionsCount: number;
}

const SupervisorView: React.FC<SupervisorViewProps> = ({ checklist, onSave, cloudEnabled, workspaceId, existingSessionsCount }) => {
  const [staffName, setStaffName] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [storeBranch, setStoreBranch] = useState('');
  const [auditDate, setAuditDate] = useState(new Date().toISOString().split('T')[0]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [categoryComments, setCategoryComments] = useState<Record<string, string>>({});
  const [overallComment, setOverallComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<CoachingSession | null>(null);
  const [copied, setCopied] = useState(false);

  const groupedBySeries = useMemo(() => {
    const groups: Record<string, { label: string; items: ChecklistItem[] }> = {};
    const seriesMap: Record<string, string> = {
      'S1': 'S1: FOUNDATION',
      'S2': 'S2: ENGAGE',
      'S3': 'S3: EXCITE',
      'S4': 'S4: EXPLAIN',
      'S5': 'S5: EXECUTE'
    };

    checklist.forEach(item => {
      const prefix = item.category.split('|')[0]?.trim().split(':')[0] || 'Misc';
      if (!groups[prefix]) {
        groups[prefix] = { label: seriesMap[prefix] || prefix, items: [] };
      }
      groups[prefix].items.push(item);
    });
    return groups;
  }, [checklist]);

  const seriesTotals = useMemo(() => {
    const subtotals: Record<string, { earned: number; base: number }> = {};
    checklist.forEach(item => {
      const prefix = item.category.split('|')[0]?.trim().split(':')[0] || 'Misc';
      if (!subtotals[prefix]) subtotals[prefix] = { earned: 0, base: 20 };
      subtotals[prefix].earned += scores[item.id] || 0;
    });
    return subtotals;
  }, [checklist, scores]);

  const totalEarnedScore = useMemo(() => {
    return checklist.reduce((sum, item) => sum + (scores[item.id] || 0), 0);
  }, [checklist, scores]);

  const handleScoreChange = (id: string, value: number) => {
    const item = checklist.find(i => i.id === id);
    const clampedValue = item ? Math.min(Math.max(0, value), item.maxPoints) : value;
    setScores(prev => ({ ...prev, [id]: clampedValue }));
  };

  const handleCommentChange = (seriesPrefix: string, comment: string) => {
    setCategoryComments(prev => ({ ...prev, [seriesPrefix]: comment }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !supervisorName || !storeBranch) return alert('Please fill in profile fields');

    setIsSubmitting(true);
    const refNumber = `AUD-${(existingSessionsCount + 1).toString().padStart(5, '0')}`;

    const session: CoachingSession = {
      id: Date.now().toString(),
      staffName,
      supervisorName,
      storeBranch,
      auditReference: refNumber, 
      date: new Date(auditDate).toISOString(),
      scores,
      categoryComments,
      overallComment,
      totalScore: totalEarnedScore,
      maxPossibleScore: 100 
    };

    const feedback = await getCoachingFeedback(session, checklist);
    const completedSession = { ...session, aiFeedback: feedback };
    
    if (cloudEnabled && workspaceId) {
      await pushSessionToCloud(completedSession, workspaceId);
    }

    setLastSession(completedSession);
    setLastFeedback(feedback);
    onSave(completedSession);
    setIsSubmitting(false);
    setScores({});
    setCategoryComments({});
    setOverallComment('');
    setStaffName('');
  };

  if (lastFeedback) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle size={32} />
            <div>
              <h2 className="text-xl font-black">Audit Sync Complete</h2>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref: {lastSession?.auditReference}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900">{lastSession?.totalScore}<span className="text-sm text-gray-300">/100</span></p>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-5 mb-6 border border-purple-100">
          <h3 className="font-black uppercase tracking-widest text-[10px] text-[#6E2CF3] mb-2 flex items-center gap-1">
            <Sparkles size={12} /> AI Coaching Plan
          </h3>
          <div className="text-sm text-gray-900 whitespace-pre-line leading-relaxed font-medium">
            {lastFeedback}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={() => {
            const reportText = `Dyson Report [${lastSession?.auditReference}]\nStaff: ${lastSession?.staffName}\nScore: ${lastSession?.totalScore}/100\n\nCoaching:\n${lastFeedback}`;
            navigator.clipboard.writeText(reportText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }} className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 border border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all text-xs">
            {copied ? <CheckCircle size={14} className="text-green-500" /> : <Copy size={14} />}
            {copied ? 'Copy Report' : 'Copy Report'}
          </button>
          <button onClick={() => { setLastFeedback(null); setLastSession(null); }} className="w-full bg-black text-white py-4 rounded-xl font-black text-sm hover:bg-gray-900 transition-all">
            New Audit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-32">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Performance Hub</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Dyson SEA Standards</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="text-right">
             <p className="text-[8px] font-black text-gray-400 uppercase">Live Score</p>
             <p className="text-lg font-black text-[#6E2CF3] leading-none">{totalEarnedScore}<span className="text-[10px] text-gray-300">/100</span></p>
          </div>
          <Zap size={16} className="text-[#6E2CF3]" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</label>
            <input type="date" value={auditDate} onChange={e => setAuditDate(e.target.value)} className="w-full bg-gray-50 rounded-lg px-2 py-1.5 font-bold text-gray-900 text-xs outline-none" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Store</label>
            <input required type="text" value={storeBranch} onChange={e => setStoreBranch(e.target.value)} className="w-full bg-gray-50 rounded-lg px-2 py-1.5 font-bold text-gray-900 text-xs outline-none" placeholder="Location" />
          </div>
          <div>
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Specialist</label>
            <input required type="text" value={staffName} onChange={e => setStaffName(e.target.value)} className="w-full bg-gray-50 rounded-lg px-2 py-1.5 font-bold text-gray-900 text-xs outline-none" placeholder="Name" />
          </div>
          <div>
            <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Assessor</label>
            <input required type="text" value={supervisorName} onChange={e => setSupervisorName(e.target.value)} className="w-full bg-gray-50 rounded-lg px-2 py-1.5 font-bold text-gray-900 text-xs outline-none" placeholder="Supervisor" />
          </div>
        </div>

        {(Object.entries(groupedBySeries) as [string, { label: string; items: ChecklistItem[] }][]).sort().map(([prefix, group]) => {
          const totalEarned = seriesTotals[prefix]?.earned || 0;
          return (
            <div key={prefix} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                <h3 className="text-white font-black text-[9px] uppercase tracking-widest">{group.label}</h3>
                <span className="text-[9px] font-black text-purple-400">{totalEarned} / 20</span>
              </div>

              <div className="divide-y divide-gray-50">
                {group.items.map(item => {
                  const score = scores[item.id] || 0;
                  const max = item.maxPoints || 1;
                  const perc = (score / max) * 100;
                  return (
                    <div key={item.id} className="px-4 py-2.5 hover:bg-gray-50/50 transition-colors">
                       <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-gray-900 leading-tight truncate">{item.task}</p>
                            {item.isBonus && <span className="text-[7px] font-black text-blue-500 uppercase">Bonus Point</span>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                               <input 
                                  type="range"
                                  min="0"
                                  max={max}
                                  step={max <= 2 ? "0.5" : "1"}
                                  value={score}
                                  onChange={(e) => handleScoreChange(item.id, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#6E2CF3]"
                                />
                                <span className="w-6 text-right text-[10px] font-black text-gray-900">{score}</span>
                            </div>
                            <div className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[8px] font-black ${
                              perc >= 90 ? 'border-green-100 bg-green-50 text-green-600' : 
                              perc >= 50 ? 'border-purple-100 bg-purple-50 text-[#6E2CF3]' : 
                              'border-gray-100 bg-gray-50 text-gray-300'
                            }`}>
                              {Math.round(perc)}%
                            </div>
                          </div>
                       </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-gray-50 p-3 border-t border-gray-100">
                 <textarea value={categoryComments[prefix] || ''} onChange={(e) => handleCommentChange(prefix, e.target.value)} placeholder={`${prefix} notes...`} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] text-gray-900 font-medium min-h-[50px] outline-none focus:border-[#6E2CF3] transition-all" />
              </div>
            </div>
          );
        })}

        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
           <textarea required value={overallComment} onChange={(e) => setOverallComment(e.target.value)} placeholder="Final executive summary..." className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl p-4 text-xs font-medium min-h-[100px] outline-none focus:border-[#6E2CF3] transition-all" />
        </div>

        <button disabled={isSubmitting} type="submit" className="w-full bg-[#6E2CF3] text-white py-4 rounded-xl font-black text-base shadow-lg hover:bg-[#5D24D1] transition-all uppercase tracking-widest flex items-center justify-center gap-2">
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
          {isSubmitting ? 'Syncing...' : 'Finish Hub Audit'}
        </button>
      </form>
    </div>
  );
};

export default SupervisorView;
