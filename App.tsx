import React, { useState, useEffect, useCallback } from 'react';
import { AppView, ChecklistItem, CoachingSession, CloudSettings } from './types';
import { DEFAULT_CHECKLIST } from './constants';
import Navigation from './components/Navigation';
import SupervisorView from './components/SupervisorView';
import TrainerDashboard from './components/TrainerDashboard';
import ConfigView from './components/ConfigView';
import { fetchSessionsFromCloud } from './services/cloudService';
import { Cpu, Wifi, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.SUPERVISOR);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    const saved = localStorage.getItem('dyson_checklist');
    return saved ? JSON.parse(saved) : DEFAULT_CHECKLIST;
  });
  const [sessions, setSessions] = useState<CoachingSession[]>(() => {
    const saved = localStorage.getItem('dyson_sessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [cloud, setCloud] = useState<CloudSettings>(() => {
    const saved = localStorage.getItem('dyson_cloud_settings');
    return saved ? JSON.parse(saved) : { enabled: true, workspaceId: 'SEA-RETAIL-HUB' };
  });

  // Save data to device storage automatically for offline use
  useEffect(() => {
    localStorage.setItem('dyson_checklist', JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem('dyson_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('dyson_cloud_settings', JSON.stringify(cloud));
  }, [cloud]);

  const syncWithCloud = useCallback(async () => {
    if (cloud.enabled && cloud.workspaceId) {
      const cloudSessions = await fetchSessionsFromCloud(cloud.workspaceId);
      setSessions(prev => {
        const existingIds = new Set(prev.map(s => s.id));
        const newOnes = cloudSessions.filter(s => !existingIds.has(s.id));
        return [...newOnes, ...prev];
      });
      setCloud(prev => ({ ...prev, lastSynced: new Date().toISOString() }));
    }
  }, [cloud.enabled, cloud.workspaceId]);

  useEffect(() => {
    // Initial sync
    syncWithCloud();
    // Auto-sync every 60 seconds if in analytics view
    if (view === AppView.TRAINER) {
      const interval = setInterval(syncWithCloud, 60000);
      return () => clearInterval(interval);
    }
  }, [view, syncWithCloud]);

  const handleSaveSession = (session: CoachingSession) => {
    const sessionWithWorkspace = { ...session, workspaceId: cloud.workspaceId };
    setSessions(prev => [sessionWithWorkspace, ...prev]);
  };

  const handleUpdateSessions = (updatedSessions: CoachingSession[]) => {
    setSessions([...updatedSessions]);
  };

  const handleImportSessions = (importedSessions: CoachingSession[]) => {
    setSessions(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const newSessions = importedSessions.filter(s => !existingIds.has(s.id));
      return [...newSessions, ...prev];
    });
  };

  return (
    <div className="h-full bg-[#f8f9fa] md:flex font-sans text-gray-900 overflow-hidden">
      <Navigation currentView={view} setView={setView} />
      
      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-16 pb-24 md:pb-16 page-transition">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-[#6E2CF3] p-1.5 rounded-lg md:hidden">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-black tracking-tighter md:hidden uppercase italic">Dyson HUB</h1>
          </div>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm text-[8px] font-black uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-gray-500">SEA Hub Online</span>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto">
          {view === AppView.SUPERVISOR && (
            <SupervisorView 
              checklist={checklist} 
              onSave={handleSaveSession} 
              cloudEnabled={cloud.enabled}
              workspaceId={cloud.workspaceId}
              existingSessionsCount={sessions.length}
            />
          )}
          {view === AppView.TRAINER && (
            <TrainerDashboard 
              sessions={sessions} 
              checklist={checklist} 
              onRefresh={syncWithCloud}
              isCloudEnabled={cloud.enabled}
            />
          )}
          {view === AppView.CONFIG && (
            <ConfigView 
              checklist={checklist} 
              setChecklist={setChecklist} 
              sessions={sessions} 
              onImportSessions={handleImportSessions}
              onUpdateSessions={handleUpdateSessions}
              cloud={cloud}
              setCloud={setCloud}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;