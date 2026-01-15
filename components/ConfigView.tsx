import React, { useState, useEffect, useMemo } from 'react';
import { ChecklistItem, CoachingSession, CloudSettings } from '../types';
import { DEFAULT_CHECKLIST } from '../constants';
import { 
  Save, Globe, Database, Zap, RefreshCcw, Loader2, ClipboardType, Edit3, ShieldCheck, AlertCircle, Eye, ShieldCheck as Shield, Trash2
} from 'lucide-react';

interface ConfigViewProps {
  checklist: ChecklistItem[];
  setChecklist: (checklist: ChecklistItem[]) => void;
  sessions: CoachingSession[];
  onImportSessions: (sessions: CoachingSession[]) => void;
  onUpdateSessions: (sessions: CoachingSession[]) => void;
  cloud: CloudSettings;
  setCloud: (cloud: CloudSettings) => void;
}

const ConfigView: React.FC<ConfigViewProps> = ({ checklist, setChecklist, sessions, onImportSessions, onUpdateSessions, cloud, setCloud }) => {
  const [items, setItems] = useState<ChecklistItem[]>(checklist);
  const [tempWorkspaceId, setTempWorkspaceId] = useState(cloud.workspaceId);
  const [isImporting, setIsImporting] = useState(false);
  const [isSanitizing, setIsSanitizing] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  
  useEffect(() => {
    setItems(checklist);
  }, [checklist]);

  const handlePointChange = (id: string, value: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, maxPoints: value } : item));
  };

  // Fixed the unknown type error by explicitly casting Object.entries results
  const handleSanitizeData = () => {
    setIsSanitizing(true);
    // Use a timeout to allow UI to show loading if needed, though this is fast
    setTimeout(() => {
      const affectedCount = sessions.filter(s => {
        // Casting Object.entries to ensure score is treated as a number
        return (Object.entries(s.scores) as [string, number][]).some(([id, score]) => {
          const item = checklist.find(i => i.id === id);
          return item && score > item.maxPoints;
        });
      }).length;

      if (affectedCount === 0) {
        setIsSanitizing(false);
        alert("All Hub data is currently within standard limits.");
        return;
      }

      if (confirm(`Detected ${affectedCount} sessions with scores exceeding Dyson standards. Reset them to maximum allowed?`)) {
        const sanitized = sessions.map(s => {
          const newScores = { ...s.scores };
          let total = 0;
          // Casting Object.entries to ensure score is treated as a number for Math.min
          (Object.entries(newScores) as [string, number][]).forEach(([id, score]) => {
            const item = checklist.find(i => i.id === id);
            const maxVal = item ? item.maxPoints : 100;
            const clamped = Math.min(score, maxVal);
            newScores[id] = clamped;
            total += clamped;
          });
          return { ...s, scores: newScores, totalScore: total };
        });
        
        onUpdateSessions(sanitized);
        setIsSanitizing(false);
        alert(`Successfully sanitized ${affectedCount} records. HUB standards enforced.`);
      } else {
        setIsSanitizing(false);
      }
    }, 100);
  };

  const parseCSV = (text: string) => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    const cleanText = text.replace(/^\ufeff/, '').replace(/\r\n/g, '\n');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i+1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"'; i++; 
        } else { inQuotes = !inQuotes; }
      } else if ((char === ',' || char === '\t') && !inQuotes) {
        currentRow.push(currentField); currentField = '';
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentField);
        if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
        currentRow = []; currentField = '';
      } else { currentField += char; }
    }
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
    }
    return rows.map(r => r.map(f => f.trim()));
  };

  const previewData = useMemo(() => {
    if (!pasteContent.trim()) return null;
    const rows = parseCSV(pasteContent);
    return rows.length < 2 ? null : rows.slice(1, 4);
  }, [pasteContent]);

  const processImportText = (text: string) => {
    setIsImporting(true);
    setTimeout(() => {
      try {
        const rows = parseCSV(text);
        if (rows.length < 2) throw new Error("Missing data rows.");
        
        const importedSessions: CoachingSession[] = [];
        rows.slice(1).forEach((cols, rowIndex) => {
          if (cols.length < 70) return;
          const staffName = cols[2];
          const dateStr = cols[4];
          if (!staffName || !dateStr) return;

          const sessionScores: Record<string, number> = {};
          const catComments: Record<string, string> = {};

          const clamp = (val: string, itemId: string) => {
            const num = parseFloat(val) || 0;
            const item = checklist.find(i => i.id === itemId);
            return item ? Math.min(num, item.maxPoints) : num;
          };

          for (let i = 0; i < 17; i++) sessionScores[`s1-${i+1}`] = clamp(cols[6 + i], `s1-${i+1}`);
          for (let i = 0; i < 12; i++) sessionScores[`s2-${i+1}`] = clamp(cols[23 + i], `s2-${i+1}`);
          catComments['S2'] = cols[35] || "";
          for (let i = 0; i < 9; i++) sessionScores[`s3-${i+1}`] = clamp(cols[36 + i], `s3-${i+1}`);
          catComments['S3'] = cols[45] || "";
          for (let i = 0; i < 9; i++) sessionScores[`s4-${i+1}`] = clamp(cols[46 + i], `s4-${i+1}`);
          catComments['S4'] = cols[55] || "";
          for (let i = 0; i < 9; i++) sessionScores[`s5-${i+1}`] = clamp(cols[56 + i], `s5-${i+1}`);
          catComments['S5'] = cols[65] || "";
          for (let i = 0; i < 7; i++) sessionScores[`s5-${i+10}`] = clamp(cols[66 + i], `s5-${i+10}`);

          const total = Object.values(sessionScores).reduce((a, b) => a + b, 0);
          importedSessions.push({
            id: `imp-${Date.now()}-${rowIndex}`,
            staffName,
            supervisorName: cols[5] || "Import",
            storeBranch: cols[3] || "Hub",
            auditReference: cols[1] || `AUD-${Date.now()}`,
            date: new Date(dateStr).toISOString(),
            scores: sessionScores,
            categoryComments: catComments,
            overallComment: cols[73] || "",
            totalScore: total,
            maxPossibleScore: 100,
            aiFeedback: "Synchronized Dyson Standard Record.",
            workspaceId: cloud.workspaceId
          });
        });

        onImportSessions(importedSessions);
        setPasteContent('');
        alert(`Synchronized ${importedSessions.length} records. Scores clamped to Dyson standards.`);
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      } finally { setIsImporting(false); }
    }, 100);
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Hub Settings</h2>
          <p className="text-xs text-gray-500 font-medium">Standards and Data Sanitization</p>
        </div>
        <div className="flex gap-2">
          <button 
            disabled={isSanitizing}
            onClick={handleSanitizeData} 
            className="flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg font-bold text-[10px] hover:bg-amber-100 transition-all uppercase disabled:opacity-50"
          >
            {isSanitizing ? <Loader2 size={12} className="animate-spin" /> : <Shield size={12} />}
            Sanitize Data Hub
          </button>
          <button onClick={() => { setChecklist(items); setIsEditingPoints(false); alert('Saved.'); }} className="bg-[#6E2CF3] text-white px-5 py-2 rounded-lg font-bold text-xs shadow-lg hover:bg-purple-700 transition-all flex items-center gap-1.5 uppercase"><Save size={14} /> Save Standards</button>
        </div>
      </header>

      {/* Import Section */}
      <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
            <ClipboardType className="text-[#6E2CF3]" size={16} /> Data Import
          </h3>
          <span className="text-[8px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-full uppercase">Automatic Clamping Active</span>
        </div>
        <textarea 
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
          className="w-full h-32 bg-gray-50 border border-gray-100 rounded-xl p-4 text-[10px] font-mono text-gray-900 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-300"
          placeholder="Paste full 74-column range..."
        />
        {previewData && (
          <div className="mt-4 bg-purple-50 rounded-xl p-4 border border-purple-100 overflow-x-auto">
             <table className="w-full text-left text-[9px]">
               <thead><tr className="text-gray-400 font-black uppercase"><th className="pb-2">Name</th><th className="pb-2">Ref</th><th className="pb-2">Cols</th></tr></thead>
               <tbody className="text-gray-900 font-bold">
                 {previewData.map((row, i) => (
                   <tr key={i} className="border-t border-purple-100"><td className="py-2">{row[2]}</td><td className="py-2">{row[1]}</td><td className="py-2">{row.length}</td></tr>
                 ))}
               </tbody>
             </table>
          </div>
        )}
        <button 
          disabled={isImporting || !pasteContent.trim()}
          onClick={() => processImportText(pasteContent)}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[#6E2CF3] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isImporting ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} />} Sync Historical Hub
        </button>
      </section>

      {/* Standards Table */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] flex items-center gap-2"><Database size={16} /> Standard Matrix</h3>
          <button onClick={() => setIsEditingPoints(!isEditingPoints)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${isEditingPoints ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
            <Edit3 size={12} /> {isEditingPoints ? 'Lock' : 'Edit Max Points'}
          </button>
        </div>
        <table className="w-full text-left text-[10px]">
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-2.5 font-bold text-[#6E2CF3]">{item.category.split('|')[0]}</td>
                <td className="px-6 py-2.5 font-medium text-gray-900">{item.task}</td>
                <td className="px-6 py-2.5 text-center">
                  {isEditingPoints ? (
                    <input type="number" value={item.maxPoints} onChange={(e) => handlePointChange(item.id, parseFloat(e.target.value) || 0)} className="w-12 bg-gray-50 border border-purple-200 rounded px-1 text-center font-black" />
                  ) : ( <span className="font-black text-gray-900">{item.maxPoints}</span> )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ConfigView;