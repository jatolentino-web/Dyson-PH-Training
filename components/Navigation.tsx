
import React from 'react';
import { AppView } from '../types';
import { ClipboardList, LayoutDashboard, Settings, Cpu } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.SUPERVISOR, label: 'Audit Demo', icon: ClipboardList },
    { id: AppView.TRAINER, label: 'Analytics', icon: LayoutDashboard },
    { id: AppView.CONFIG, label: 'Configure', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around md:relative md:border-t-0 md:flex-col md:w-64 md:h-screen md:bg-gray-900 md:text-white md:p-6 shadow-lg z-50">
      <div className="hidden md:flex items-center gap-2 mb-10">
        <Cpu className="text-[#6E2CF3] w-8 h-8" />
        <h1 className="text-xl font-bold tracking-tight">Dyson HUB</h1>
      </div>
      
      <div className="flex w-full justify-around md:flex-col md:gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex flex-col md:flex-row items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isActive 
                  ? 'text-[#6E2CF3] md:bg-[#6E2CF3] md:text-white' 
                  : 'text-gray-500 hover:text-gray-900 md:text-gray-400 md:hover:bg-gray-800 md:hover:text-white'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs md:text-base font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
