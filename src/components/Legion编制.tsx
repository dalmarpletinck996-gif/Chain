import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit2, Check, X,
  Swords, Shield, Cpu, BookOpen, Flame, Zap, AlertTriangle, Activity, Award, Target, HelpCircle, Volume2
} from 'lucide-react';
import { Legion, SubGoal, FocusNode } from '../types';

// Supported Icons list
const ICON_OPTIONS = [
  { name: 'Target', label: '锁定目标', icon: Target },
  { name: 'Swords', label: '尖刀攻坚', icon: Swords },
  { name: 'Shield', label: '协防协同', icon: Shield },
  { name: 'Cpu', label: '底层构筑', icon: Cpu },
  { name: 'BookOpen', label: '深度学术', icon: BookOpen },
  { name: 'Flame', label: '极速破局', icon: Flame },
  { name: 'Zap', label: '核心注入', icon: Zap },
  { name: 'AlertTriangle', label: '漏洞抢修', icon: AlertTriangle },
  { name: 'Activity', label: '指标监测', icon: Activity },
  { name: 'Award', label: '高光勋章', icon: Award }
];

// Map string name to Lucide Icon
export const getSubGoalIcon = (iconName: string) => {
  const option = ICON_OPTIONS.find(o => o.name === iconName);
  return option ? option.icon : Target;
};

// Colors list
const COLOR_OPTIONS = [
  { id: 'red', name: '绯红 (Assault)', border: 'border-red-900', bg: 'bg-red-500/10', text: 'text-red-500', fill: 'bg-red-500', hover: 'hover:bg-red-550' },
  { id: 'amber', name: '琥珀 (Recon)', border: 'border-amber-955', bg: 'bg-amber-500/10', text: 'text-amber-500', fill: 'bg-amber-500', hover: 'hover:bg-amber-550' },
  { id: 'emerald', name: '碧绿 (Command)', border: 'border-emerald-900', bg: 'bg-emerald-500/10', text: 'text-emerald-400', fill: 'bg-emerald-500', hover: 'hover:bg-emerald-550' },
  { id: 'sky', name: '晴空 (Engineer)', border: 'border-sky-900', bg: 'bg-sky-500/10', text: 'text-sky-400', fill: 'bg-sky-500', hover: 'hover:bg-sky-550' },
  { id: 'purple', name: '幽紫 (Strategic)', border: 'border-purple-900', bg: 'bg-purple-500/10', text: 'text-purple-400', fill: 'bg-purple-500', hover: 'hover:bg-purple-550' },
];

export const getColorDetails = (colorId: string) => {
  return COLOR_OPTIONS.find(c => c.id === colorId) || COLOR_OPTIONS[0];
};

interface Legion编制Props {
  nodes: FocusNode[];
  legions: Legion[];
  setLegions: React.Dispatch<React.SetStateAction<Legion[]>>;
}

export const Legion编制: React.FC<Legion编制Props> = ({ nodes, legions, setLegions }) => {
  // Sound synthesizer logic for tactile response
  const playBeep = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn('Audio feedback blocked by gesture restraints:', e);
    }
  };

  // State management for adding a new Legion
  const [newLegionName, setNewLegionName] = useState('');
  const [isAddingLegion, setIsAddingLegion] = useState(false);

  // Editing state for Sub-goals
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEstimatedTime, setEditEstimatedTime] = useState(60);
  const [editIcon, setEditIcon] = useState('Target');
  const [editColor, setEditColor] = useState('red');

  // Add Legion
  const handleAddLegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLegionName.trim()) return;
    playBeep(480, 0.15, 'triangle');
    const newLegion: Legion = {
      id: `legion-${crypto.randomUUID()}`,
      name: newLegionName.trim(),
      subGoals: []
    };
    setLegions(prev => [...prev, newLegion]);
    setNewLegionName('');
    setIsAddingLegion(false);
  };

  // Rename Legion inline
  const handleRenameLegion = (legionId: string, newName: string) => {
    if (!newName.trim()) return;
    setLegions(prev => prev.map(l => l.id === legionId ? { ...l, name: newName } : l));
  };

  // Delete Legion
  const handleDeleteLegion = (legionId: string) => {
    const target = legions.find(l => l.id === legionId);
    if (!target) return;
    if (target.subGoals.length > 0) {
      if (!confirm(`兵团「${target.name}」中仍包含 ${target.subGoals.length} 攻坚子目标，确认要连同它们一并瓦解销毁吗？`)) {
        return;
      }
    }
    playBeep(220, 0.35, 'sawtooth');
    setLegions(prev => prev.filter(l => l.id !== legionId));
  };

  // Add SubGoal inside Legion
  const handleAddSubGoal = (legionId: string) => {
    playBeep(520, 0.1, 'sine');
    const newGoal: SubGoal = {
      id: `subgoal-${crypto.randomUUID()}`,
      name: '待命的突击子目标',
      estimatedTime: 60,
      incurredTime: 0,
      icon: 'Target',
      color: 'sky'
    };
    setLegions(prev => prev.map(l => {
      if (l.id === legionId) {
        return { ...l, subGoals: [...l.subGoals, newGoal] };
      }
      return l;
    }));
    // Auto trigger editing on create
    startEditing(newGoal);
  };

  // Start editor
  const startEditing = (goal: SubGoal) => {
    setEditingGoalId(goal.id);
    setEditName(goal.name);
    setEditEstimatedTime(goal.estimatedTime);
    setEditIcon(goal.icon);
    setEditColor(goal.color);
  };

  // Save Goal Edit
  const handleSaveGoal = (legionId: string, goalId: string) => {
    playBeep(587.33, 0.15, 'sine');
    setLegions(prev => prev.map(l => {
      if (l.id === legionId) {
        return {
          ...l,
          subGoals: l.subGoals.map(g => {
            if (g.id === goalId) {
              return {
                ...g,
                name: editName.trim() || '未命名的攻坚目标',
                estimatedTime: Math.max(5, editEstimatedTime),
                icon: editIcon,
                color: editColor
              };
            }
            return g;
          })
        };
      }
      return l;
    }));
    setEditingGoalId(null);
  };

  // Delete SubGoal
  const handleDeleteGoal = (legionId: string, goalId: string) => {
    if (confirm('确认清退此项战斗子目标？这会断开主链的追踪匹配。')) {
      playBeep(293.66, 0.2, 'sawtooth');
      setLegions(prev => prev.map(l => {
        if (l.id === legionId) {
          return { ...l, subGoals: l.subGoals.filter(g => g.id !== goalId) };
        }
        return l;
      }));
      if (editingGoalId === goalId) {
        setEditingGoalId(null);
      }
    }
  };

  // Calculate global statistics across editable goals
  const totalEstimated = legions.reduce((sum, l) => sum + l.subGoals.reduce((s, g) => s + g.estimatedTime, 0), 0);
  const totalIncurred = legions.reduce((sum, l) => sum + l.subGoals.reduce((s, g) => s + g.incurredTime, 0), 0);
  const globalPct = totalEstimated > 0 ? Math.min(100, Math.round((totalIncurred / totalEstimated) * 100)) : 0;

  return (
    <div className="space-y-6 font-mono relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/10 via-transparent to-transparent" />

      {/* Global Campaign Overview Dashboard */}
      <div className="border border-zinc-800 bg-zinc-950/40 p-5 rounded-xl flex flex-col md:flex-row items-stretch justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-red-500">
            <Award className="w-5 h-5" />
            <h4 className="text-sm font-bold uppercase tracking-wider">// 02兵团规划与战役序列 (Legion Order of Battle)</h4>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed md:max-w-md">
            您可以配置多发战役“兵团编制”，并向下细分多组“专注子目标”。启动神圣座位契约需选定其中之一进行战力积分积攒，完成时自动计入目标。
          </p>
        </div>

        {/* Global Progress Indicators */}
        <div className="grid grid-cols-3 gap-3 shrink-0 self-center w-full md:w-auto">
          <div className="bg-zinc-900/40 border border-zinc-800 p-3 text-center rounded-lg">
            <div className="text-[9px] text-zinc-500 uppercase font-black">编制军团</div>
            <div className="text-lg font-black text-white">{legions.length} <span className="text-[10px] text-zinc-500">CORPS</span></div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-800 p-3 text-center rounded-lg">
            <div className="text-[9px] text-zinc-500 uppercase font-black">战役子目标</div>
            <div className="text-lg font-black text-white">
              {legions.reduce((sum, l) => sum + l.subGoals.length, 0)} <span className="text-[10px] text-zinc-500">GOALS</span>
            </div>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-855 p-3 text-center rounded-lg col-span-1">
            <div className="text-[9px] text-zinc-500 uppercase font-black">全面合围</div>
            <div className="text-lg font-black text-emerald-400">{globalPct}%</div>
          </div>
        </div>
      </div>

      {/* Legion List Control Action Bar */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <span>// 活跃兵团整编阵线</span>
        </h4>

        {!isAddingLegion ? (
          <button
            onClick={() => {
              playBeep(440, 0.1, 'sine');
              setIsAddingLegion(true);
            }}
            className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 hover:text-white border border-zinc-800 hover:border-zinc-700 text-xs font-bold uppercase flex items-center gap-1.5 rounded-lg transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-zinc-400" />
            新增兵团规划
          </button>
        ) : (
          <form onSubmit={handleAddLegion} className="flex items-center gap-2 w-full max-w-sm">
            <input
              type="text"
              required
              placeholder="命名新兵团 (例如: 离散数学、系统重构院)"
              value={newLegionName}
              onChange={(e) => setNewLegionName(e.target.value)}
              className="bg-zinc-900/70 border border-zinc-800 text-zinc-200 text-xs px-3 py-1.5 focus:outline-none focus:border-red-500 rounded-lg flex-1"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-red-955/20 hover:bg-red-900/40 border border-red-500 text-red-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              确立
            </button>
            <button
              type="button"
              onClick={() => setIsAddingLegion(false)}
              className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 font-bold text-xs rounded-lg transition-colors cursor-pointer"
            >
              取消
            </button>
          </form>
        )}
      </div>

      {/* Actual Legion Cards */}
      {legions.length === 0 ? (
        <div className="border border-dashed border-zinc-800 p-12 text-center text-xs text-zinc-500 leading-relaxed rounded-xl">
          【暂无有效的兵团编制规划】<br />
          请点击右上角「新增兵团规划」开始建立战区与战役子目标！
        </div>
      ) : (
        <div className="space-y-6">
          {legions.map((legion) => (
            <div 
              key={legion.id} 
              className="border border-zinc-800 bg-zinc-950/45 p-5 relative rounded-xl hover:border-zinc-700/60 transition-colors"
            >
              {/* Legion Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-3 mb-4">
                <div className="flex items-center gap-2.5 w-full sm:w-2/3">
                  <div className="w-2.5 h-2.5 bg-red-600 rounded-sm shrink-0 animate-pulse" />
                  <input
                    type="text"
                    value={legion.name}
                    onChange={(e) => handleRenameLegion(legion.id, e.target.value)}
                    className="bg-transparent text-sm font-bold uppercase tracking-wider text-zinc-200 hover:bg-zinc-900/30 focus:bg-zinc-900/90 focus:outline-none px-2 py-0.5 rounded border border-transparent focus:border-zinc-700 w-full font-mono transition-colors"
                    title="点击可直接重命名该兵团"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => handleAddSubGoal(legion.id)}
                    className="px-2.5 py-1 bg-amber-950/20 hover:bg-amber-600 hover:text-black border border-amber-500 text-amber-400 text-[10px] font-bold uppercase rounded transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    新增子目标
                  </button>
                  <button
                    onClick={() => handleDeleteLegion(legion.id)}
                    className="p-1 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 border border-transparent hover:border-red-900/35 rounded transition-colors cursor-pointer"
                    title="注销此兵团编制"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SubGoals Grid */}
              {legion.subGoals.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-650 italic">
                  此兵团内无任何子任务。点击「新增子目标」开始指派第一项攻坚指标。
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {legion.subGoals.map((subGoal) => {
                    const colorObj = getColorDetails(subGoal.color);
                    const SpecificIcon = getSubGoalIcon(subGoal.icon);
                    const isEditing = editingGoalId === subGoal.id;

                    // Compute individual specs
                    const completedMinutes = subGoal.incurredTime;
                    const completionPct = subGoal.estimatedTime > 0 
                      ? Math.min(100, Math.round((completedMinutes / subGoal.estimatedTime) * 100))
                      : 0;

                    return (
                      <div 
                        key={subGoal.id} 
                        className={`border rounded-xl p-4 transition-all relative overflow-hidden flex flex-col justify-between ${
                          isEditing 
                            ? 'border-yellow-600/60 bg-yellow-950/5' 
                            : `${colorObj.border} bg-zinc-900/20 hover:bg-zinc-900/40`
                        }`}
                      >
                        {isEditing ? (
                          /* Goal Editing Form Interface */
                          <div className="space-y-3 z-10">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                              <span className="text-[10px] text-amber-500 font-extrabold flex items-center gap-1.5">
                                <Edit2 className="w-3.5 h-3.5 animate-spin" /> EDITING_SUB_GOAL: {subGoal.name.substring(0, 10)}...
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveGoal(legion.id, subGoal.id)}
                                  className="p-1 bg-emerald-950/40 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded transition-all cursor-pointer"
                                  title="确认保存"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingGoalId(null)}
                                  className="p-1 bg-zinc-900 border border-zinc-750 text-zinc-400 hover:bg-zinc-800 rounded transition-all cursor-pointer"
                                  title="丢弃更改"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 text-xs">
                              {/* Name field */}
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase text-zinc-500 font-bold block">目标名称 / Sub-goal Name:</label>
                                <input
                                  type="text"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="输入具体指标 (e.g., 攻读底座测试套件)"
                                  className="w-full bg-zinc-950 border border-zinc-850 text-zinc-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-500 font-mono"
                                />
                              </div>

                              {/* Duration field */}
                              <div className="space-y-1">
                                <div className="flex justify-between text-[9px] uppercase text-zinc-500 font-bold">
                                  <span>战役估计预计总投入 / Estimate Needed:</span>
                                  <span className="text-amber-500 font-black">{editEstimatedTime} MINS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="range"
                                    min={5}
                                    max={1200}
                                    step={5}
                                    value={editEstimatedTime}
                                    onChange={(e) => setEditEstimatedTime(parseInt(e.target.value))}
                                    className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                  />
                                </div>
                              </div>

                              {/* Icon List selector */}
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase text-zinc-500 font-bold block">徽记选择 / Icon Seal Selector:</label>
                                <div className="grid grid-cols-5 gap-1.5 bg-zinc-950 p-1.5 border border-zinc-900 rounded-lg">
                                  {ICON_OPTIONS.map((item) => {
                                    const SmallIcon = item.icon;
                                    const isSel = editIcon === item.name;
                                    return (
                                      <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => {
                                          playBeep(650, 0.05, 'sine');
                                          setEditIcon(item.name);
                                        }}
                                        className={`p-1 flex items-center justify-center border transition-all rounded-md ${
                                          isSel 
                                            ? 'bg-amber-950/20 border-amber-500 text-amber-400 font-extrabold' 
                                            : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                                        }`}
                                        title={item.label}
                                      >
                                        <SmallIcon className="w-4 h-4" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Color selector */}
                              <div className="space-y-1">
                                <label className="text-[9px] uppercase text-zinc-500 font-bold block">战术色标配色 / Military Color Coding:</label>
                                <div className="grid grid-cols-5 gap-1 border border-zinc-900 p-1 bg-zinc-950 rounded-lg">
                                  {COLOR_OPTIONS.map((c) => {
                                    const isSel = editColor === c.id;
                                    return (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                          playBeep(700, 0.05, 'sine');
                                          setEditColor(c.id);
                                        }}
                                        className={`py-1 text-[9px] font-bold uppercase transition-all flex flex-col items-center justify-center gap-1 rounded-md border text-center ${
                                          isSel 
                                            ? 'bg-zinc-900 border-zinc-700 text-white font-extrabold' 
                                            : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                        }`}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full ${c.fill}`} />
                                        <span className="text-[8px] tracking-tight">{c.id}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Goal Visual Card Interface */
                          <>
                            <div className="space-y-2.5 z-10">
                              {/* Mini heading */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-7 h-7 border rounded-lg flex items-center justify-center shadow-inner shrink-0 ${colorObj.border} ${colorObj.bg}`}>
                                    <SpecificIcon className={`w-4 h-4 ${colorObj.text}`} />
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-bold text-zinc-100 uppercase tracking-tight line-clamp-1">{subGoal.name}</h5>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-[8.5px] text-zinc-500 uppercase">
                                      <span>预计: {subGoal.estimatedTime}m</span>
                                      <span className="text-zinc-650">•</span>
                                      <span className="text-[#10b981]">已投: {completedMinutes}m</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      playBeep(480, 0.08, 'sine');
                                      startEditing(subGoal);
                                    }}
                                    className="p-1.2 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all cursor-pointer text-zinc-500 hover:text-white"
                                    title="编辑此目标"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteGoal(legion.id, subGoal.id)}
                                    className="p-1.2 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded transition-all cursor-pointer text-zinc-500 hover:text-red-400"
                                    title="清退此目标"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Progress calculation & drawing */}
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-[9px] font-mono leading-none">
                                  <span className="text-zinc-500">攻坚覆盖状况 (Assault Completion)</span>
                                  <span className={`font-bold ${completionPct >= 100 ? 'text-emerald-400' : 'text-zinc-300'}`}>
                                    {completionPct}%
                                  </span>
                                </div>

                                {/* Custom Themed Static Progress Bar */}
                                <div className="w-full h-1.5 bg-zinc-950 border border-zinc-900 rounded-sm overflow-hidden flex">
                                  <div 
                                    className={`h-full transition-all duration-500 ease-out ${colorObj.fill}`}
                                    style={{ width: `${completionPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Tactical subtle indicator */}
                            <div className="pt-2 mt-2.5 border-t border-zinc-900/40 text-[8px] text-zinc-550 flex justify-between items-center bg-zinc-900/10 -mx-4 -mb-4 px-4 py-1 rounded-b-xl select-none">
                              <span>SEAL_SERIAL: {subGoal.id.substring(8, 16).toUpperCase()}</span>
                              <span className="text-zinc-500">{completionPct >= 100 ? '✓ COMPLETE' : '⏳ ACTIVE'}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
