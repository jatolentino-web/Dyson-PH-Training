import React, { useState, useMemo } from 'react';
import { CoachingSession, ChecklistItem } from '../types';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { generateTNAReport } from '../services/geminiService';
import { 
  TrendingUp, Users, Award, BookOpen, Loader2, Sparkles, 
  RefreshCw, Table, Search, AlertTriangle, Activity, Copy, Check, Calculator, MessageSquareText, ShieldAlert, Download, Share2
} from 'lucide-react';

interface TrainerDashboardProps {
  sessions: CoachingSession[];
  checklist: ChecklistItem[];
  onRefresh: () => Promise<void>;
  isCloudEnabled: boolean;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ sessions, checklist, onRefresh, isCloudEnabled }) => {
  const [isGeneratingTNA, setIsGeneratingTNA] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<CoachingSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTNA, setCopiedTNA] = useState(false);

  const stats = useMemo(() => {
    const avg = sessions.length > 0 
      ? sessions.reduce((acc, s) => acc + (s.totalScore / 100), 0) / sessions.length * 100 
      : 0;
    return {
      totalAudits: sessions.length,
      averageTeamScore: avg.toFixed(1),
      topPerformer: sessions.length > 0 
        ? sessions.reduce((prev, current) => (prev.totalScore > current.totalScore) ? prev : current).staffName
        : 'N/A'
    };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions
      .filter(s => 
        s.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.auditReference.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, searchQuery]);

  const visualizationData = useMemo(() => {
    if (sessions.length === 0) return { radar: [], trend: [] };

    const categories = ['S1', 'S2', 'S3', 'S4', 'S5'];
    const radar = categories.map(cat => {
      const catItems = checklist.filter(i => i.category.startsWith(cat) && !i.isBonus);
      if (catItems.length === 0) return { subject: cat, A: 0 };
      
      const avgEarned = sessions.reduce((acc, s) => {
        const catScore = catItems.reduce((sum, item) => sum + (s.scores[item.id] || 0), 0);
        return acc + catScore;
      }, 0) / sessions.length;

      return {
        subject: cat,
        A: Math.round((avgEarned / 20) * 100)
      };
    });

    const trend = [...sessions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(s => ({
        date: new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: s.totalScore
      }));

    return { radar, trend };
  }, [sessions, checklist]);

  const exportToCSV = () => {
    if (sessions.length === 0) return alert("No data to export");
    
    const headers = ["Reference", "Date", "Staff Name", "Store", "Score", "AI Feedback", "Supervisor Summary"];
    const csvRows = [headers.join(",")];

    sessions.forEach(s => {
      const row = [
        s.auditReference,
        new Date(s.date).toLocaleDateString(),
        `"${s.staffName}"`,
        `"${s.storeBranch}"`,
        s.totalScore,
        `"${(s.aiFeedback || '').replace(/"/g, '""')}"`,
        `"${(s.overallComment || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Dyson_Hub_Master_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareTNA = async () => {
    if (!aiReport) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dyson Hub Strategic TNA',
          text: aiReport,
        });
      } catch (err) {
        console.error("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(aiReport);
      setCopiedTNA(true);
      setTimeout(() => setCopiedTNA(false), 2000);
    }
  };

  const handleGenerateTNA = async () => {
    if (sessions.length === 0) return alert('No data available for analysis.');
    setIsGeneratingTNA(true);
    try {
      const report = await generateTNAReport(sessions, checklist);
      setAiReport(report);
    } catch (e) {
      alert("Analysis failed. Please check Hub connectivity.");
    } finally {
      setIsGeneratingTNA(false);
    }
  };

  return (
    <div className="space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 uppercase">Training Hub Dashboard</h2>
          <p className="text-xs text-gray-500 font-medium">SEA Performance Analytics</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportToCSV} className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all uppercase">
            <Download size={14} /> Export CSV
          </button>
          {isCloudEnabled && (
            <button onClick={() => onRefresh()} className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-50 transition-all uppercase">
              <RefreshCw size={14} /> Sync
            </button>
          )}
          <button onClick={handleGenerateTNA} disabled={isGeneratingTNA} className="flex items-center gap-2 bg-[#6E2CF3] text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg hover:bg-[#5D24D1] transition-all uppercase active:scale-95 disabled:opacity-50">
            {isGeneratingTNA ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isGeneratingTNA ? 'Analyzing...' : 'Generate TNA'}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
           <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Team Competency</p>
           <p className="text-4xl font-black text-gray-900">{stats.averageTeamScore}%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
           <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Total Audits</p>
           <p className="text-4xl font-black text-gray-900">{stats.totalAudits}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
           <p className="text-[9px] font-black text-gray-400 uppercase mb-2 tracking-widest">Elite Performer</p>
           <p className="text-3xl font-black text-[#6E2CF3] truncate px-2">{stats.topPerformer}</p>
        </div>
      </div>

      {/* AI TNA Report View */}
      {aiReport && (
        <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-in slide-in-from-top duration-500 border border-gray-800">
           <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
             <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
               <Sparkles size={18} className="text-purple-400" /> Executive Training Needs Analysis
             </h3>
             <div className="flex gap-2">
               <button onClick={handleShareTNA} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                 {copiedTNA ? <Check size={14} className="text-green-400" /> : <Share2 size={14} />}
                 {copiedTNA ? 'Copied' : 'Share Analysis'}
               </button>
               <button onClick={() => setAiReport(null)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                 Close
               </button>
             </div>
           </div>
           <div className="prose prose-invert max-w-none text-sm font-medium leading-relaxed text-gray-300 space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
             {aiReport.split('\n').map((line, idx) => {
               if (line.startsWith('###')) return <h4 key={idx} className="text-purple-400 font-black uppercase tracking-wider text-base pt-4 border-t border-white/5 mt-4">{line.replace('###', '').trim()}</h4>;
               return <p key={idx}>{line}</p>;
             })}
           </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Audit Ledger</h3>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Filter specialists..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-xs font-bold outline-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[9px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-100">
              <tr><th className="px-6 py-4">Ref</th><th className="px-6 py-4">Specialist</th><th className="px-6 py-4">Score</th><th className="px-6 py-4 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSessions.length > 0 ? filteredSessions.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-[#6E2CF3]">{s.auditReference}</td>
                  <td className="px-6 py-4 font-black text-gray-900">{s.staffName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${s.totalScore >= 90 ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-[#6E2CF3]'}`}>
                      {s.totalScore} / 100
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setSelectedSession(s)} className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-black transition-all">Details</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px]">Empty Ledger</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
          <h3 className="font-black text-gray-900 uppercase text-[10px] mb-6 tracking-widest flex items-center gap-2"><Activity size={14} className="text-[#6E2CF3]" /> Team Radar</h3>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={visualizationData.radar}>
              <PolarGrid stroke="#f1f1f1" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 900 }} />
              <Radar name="Avg" dataKey="A" stroke="#6E2CF3" fill="#6E2CF3" fillOpacity={0.6} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
          <h3 className="font-black text-gray-900 uppercase text-[10px] mb-6 tracking-widest flex items-center gap-2"><TrendingUp size={14} className="text-[#6E2CF3]" /> Performance Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={visualizationData.trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f9fa" />
              <XAxis dataKey="date" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 110]} tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px', fontWeight: 'bold' }} />
              <Line type="monotone" dataKey="score" stroke="#6E2CF3" strokeWidth={3} dot={{ r: 4, fill: '#6E2CF3', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modal View */}
      {selectedSession && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedSession(null)}>
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-8 bg-gray-900 text-white flex justify-between items-start">
              <div>
                <p className="text-purple-400 font-mono text-[10px] uppercase tracking-widest mb-1">{selectedSession.auditReference}</p>
                <h3 className="text-2xl font-black">{selectedSession.staffName}</h3>
                <p className="text-gray-400 font-bold text-[10px] uppercase">{selectedSession.storeBranch} • {new Date(selectedSession.date).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-white transition-colors"><ShieldAlert size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 scrollbar-thin">
              <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                 <h4 className="font-black text-[10px] uppercase text-[#6E2CF3] mb-3 flex items-center gap-2"><Sparkles size={14} /> Coaching Summary</h4>
                 <div className="text-xs font-medium leading-relaxed text-gray-900 whitespace-pre-line">{selectedSession.aiFeedback}</div>
              </div>
              <div>
                <h4 className="text-gray-400 font-black text-[10px] uppercase mb-4 flex items-center gap-2"><Calculator size={14} /> Point Matrix</h4>
                <div className="space-y-1">
                  {checklist.map(item => {
                    const s = selectedSession.scores[item.id] || 0;
                    if (s === 0) return null;
                    return (
                      <div key={item.id} className="flex items-center justify-between text-[10px] py-2 border-b border-gray-50 px-2 rounded-lg hover:bg-gray-50">
                        <span className="text-gray-600 font-bold truncate max-w-[80%]">{item.task}</span>
                        <span className="font-black text-gray-900">{s} / {item.maxPoints}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100">
               <button onClick={() => setSelectedSession(null)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-black">Close Report</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerDashboard;