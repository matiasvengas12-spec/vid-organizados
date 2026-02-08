
import React from 'react';
import { 
  Trophy, 
  Users, 
  Layers, 
  UserPlus, 
  ShieldAlert, 
  CornerUpRight, 
  CircleDot, 
  Target,
  LayoutGrid
} from 'lucide-react';
import { PokerSpot } from '../types';

interface SidebarProps {
  selectedSpot: PokerSpot | 'All';
  onSelectSpot: (spot: PokerSpot | 'All') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedSpot, onSelectSpot }) => {
  const spots = [
    { id: 'All', label: 'All Videos', icon: LayoutGrid },
    { id: PokerSpot.VS_FISHES, label: 'vs Fishes', icon: Trophy },
    { id: PokerSpot.BB_VS_BTN, label: 'BB vs BTN', icon: ShieldAlert },
    { id: PokerSpot.BTN_VS_BB, label: 'BTN vs BB', icon: CornerUpRight },
    { id: PokerSpot.CO_VS_BTN, label: 'CO vs BTN', icon: UserPlus },
    { id: PokerSpot.THREE_BET_IP, label: '3Bet IP', icon: Target },
    { id: PokerSpot.THREE_BET_OOP, label: '3Bet OOP', icon: CircleDot },
    { id: PokerSpot.CALL_THREE_BET, label: 'Call 3Bet', icon: Layers },
    { id: PokerSpot.MWP, label: 'MWP (Multi)', icon: Users },
    { id: PokerSpot.SB_VS_BB, label: 'SB vs BB', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900 flex flex-col h-full shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-900/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">POKER<span className="text-emerald-500">STUDY</span></span>
        </div>

        <nav className="space-y-1">
          {spots.map((spot) => {
            const Icon = spot.icon;
            const isActive = selectedSpot === spot.id;
            
            return (
              <button
                key={spot.id}
                onClick={() => onSelectSpot(spot.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-600/20' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {spot.label}
              </button>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Study Tip</p>
          <p className="text-xs leading-relaxed text-slate-300 italic">
            "Review your bluffs in 3Bet pots specifically to check if you balanced your ranges correctly."
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
