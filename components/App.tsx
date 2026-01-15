
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, ChecklistItem, CoachingSession, CloudSettings } from '../types';
import { DEFAULT_CHECKLIST } from '../constants';
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
    return saved ? JSON.parse(saved) : { enabled: false, workspaceId: '' };
  });

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
    if (view === AppView.TRAINER && cloud.enabled) {
      syncWithCloud();
      const interval = setInterval(syncWithCloud, 30000);
      return () => clearInterval(interval);
    }
  }, [view, cloud.enabled, syncWithCloud]);

  const handleSaveSession = (session: CoachingSession) => {
    const sessionWithWorkspace = { ...session, workspaceId: cloud.workspaceId };
    setSessions(prev => [sessionWithWorkspace, ...prev]);
  };

  const handleImportSessions = (importedSessions: CoachingSession[]) => {
    setSessions(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const newSessions = importedSessions.filter(s => !existingIds.has(s.id));
      return [...newSessions, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] md:flex">
      <Navigation currentView={view} setView={setView} />
      
      <main className="flex-1 overflow-y-auto px-6 py-6 md:px-12 md:py-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Cpu className="text-[#6E2CF3] w-8 h-8 md:hidden" />
            <h1 className="text-xl font-black tracking-tight md:hidden">Dyson HUB</h1>
          </div>
          
          {cloud.enabled && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm text-[9px] font-bold uppercase tracking-wider">
              {cloud.workspaceId ? (
                <>
                  <Wifi size={12} className="text-green-500" />
                  <span className="text-gray-600">Global: {cloud.workspaceId}</span>
                </>
              ) : (
                <>
                  <WifiOff size={12} className="text-amber-500" />
                  <span className="text-gray-600">Offline</span>
                </>
              )}
            </div>
          )}
        </div>
        
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
            cloud={cloud}
            setCloud={setCloud}
          />
        )}
      </main>
    </div>
  );
};

export default App;
