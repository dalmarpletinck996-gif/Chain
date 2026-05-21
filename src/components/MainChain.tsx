import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Flame, StopCircle, CheckCircle, Radio, Clock, Swords, Shield, Cpu, BookOpen, AlertCircle } from 'lucide-react';
import { FocusNode, UnitType, Legion, AuxiliaryState } from '../types';
import { getSubGoalIcon, getColorDetails } from './Legion编制';
import { AuxiliaryChain } from './AuxiliaryChain';

interface MainChainProps {
  nodes: FocusNode[];
  activeSession: {
    isRunning: boolean;
    timeLeft: number;
    totalDuration: number;
    unitType: UnitType;
    taskName: string;
    selectedGoalId?: string;
  } | null;
  onStartSession: (durationMinutes: number, unitType: UnitType, taskName: string, selectedGoalId?: string) => void;
  onAbortSession: () => void;
  onExtendSession: (additionalMinutes: number) => void;
  isPoisoned: boolean;
  activePrecedentsCount: number;
  legions: Legion[];
  auxiliaryState: AuxiliaryState;
  auxMinutes: number;
  onSetAuxMinutes: (mins: number) => void;
  onStartReservation: (minutes: number) => void;
  onCancelReservation: () => void;
  onConfirmSeat: () => void;
  onGraceDefault: () => void;
  isAutoRenew: boolean;
}

export const MainChain: React.FC<MainChainProps> = ({
  nodes,
  activeSession,
  onStartSession,
  onAbortSession,
  onExtendSession,
  isPoisoned,
  activePrecedentsCount,
  legions,
  auxiliaryState,
  auxMinutes,
  onSetAuxMinutes,
  onStartReservation,
  onCancelReservation,
  onConfirmSeat,
  onGraceDefault,
  isAutoRenew,
}) => {
  const [duration, setDuration] = useState<number>(45); // Default 45 mins
  const [unitType, setUnitType] = useState<UnitType>('assault');
  const [taskName, setTaskName] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [revealedDescs, setRevealedDescs] = useState<Record<string, boolean>>({});
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [isSelectFocused, setIsSelectFocused] = useState<boolean>(false);
  const [showWorkload, setShowWorkload] = useState<boolean>(false);

  // Find selected goal if focusing
  const selectedGoal = activeSession?.selectedGoalId 
    ? legions.flatMap(l => l.subGoals).find(g => g.id === activeSession.selectedGoalId)
    : null;

  // Total logged focus time in hours & minutes
  const totalMinutes = nodes.reduce((acc, curr) => acc + curr.duration, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Unit details helper for styling and text
  const getUnitDetails = (type: UnitType) => {
    switch (type) {
      case 'assault':
        return {
          label: '突击单元 (Assault Unit)',
          desc: '硬核深度专注、攻坚克难核心知识',
          color: 'text-[#ef4444]',
          borderColor: 'border-red-900',
          bg: 'bg-red-500/10',
          icon: Swords
        };
      case 'recon':
        return {
          label: '侦查单元 (Recon Unit)',
          desc: '5-15分钟快速导入，消解启动阻力',
          color: 'text-amber-500',
          borderColor: 'border-amber-900',
          bg: 'bg-amber-500/10',
          icon: BookOpen
        };
      case 'engineer':
        return {
          label: '工程单元 (Engineer Unit)',
          desc: '对目标无帮助但是必须完成的事情',
          color: 'text-sky-500',
          borderColor: 'border-sky-900',
          bg: 'bg-sky-500/10',
          icon: Cpu
        };
      case 'command':
        return {
          label: '指挥单元 (Command HQ)',
          desc: '宏观规划、战斗部署、日程调整设定',
          color: 'text-emerald-500',
          borderColor: 'border-emerald-900',
          bg: 'bg-emerald-500/10',
          icon: Shield
        };
      default:
        return {
          label: '后勤单元 (Logistics Unit)',
          desc: '琐碎事务整理、碎片信息归宿',
          color: 'text-gray-400',
          borderColor: 'border-gray-800',
          bg: 'bg-gray-400/10',
          icon: Radio
        };
    }
  };

  // Latin mottos based on chain count (沉没成本象征)
  const getLatinMotto = (count: number) => {
    if (count === 0) return 'Tabula Rasa (一张白纸 - 即刻入座书写意志)';
    if (count <= 3) return 'Silentio et Fortitudine (在静默与坚韧中坚守)';
    if (count <= 6) return 'Actis aevum implet, non segnibus annis (以行动充实生命，而非蹉跎岁月)';
    if (count <= 12) return 'Possunt quia posse videntur (他们之所以能，是因为他们相信自己能)';
    return 'Ad Astra Per Aspera (穿越重重深渊，终达灿烂星空)';
  };

  // Format active session time
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const textSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${textSecs.toString().padStart(2, '0')}`;
  };

  // Handles starting session
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTaskName = taskName.trim() || `战斗部署_单元_${nodes.length + 1}`;
    onStartSession(duration, unitType, finalTaskName, selectedGoalId || undefined);
  };

  const activeUnit = activeSession ? getUnitDetails(activeSession.unitType) : null;
  const ActiveIcon = activeUnit ? activeUnit.icon : null;

  return (
    <div className="space-y-6">
      {/* Dynamic Status Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-zinc-950/40 border border-zinc-800/80 p-4 relative overflow-hidden rounded-xl transition-all duration-300 ${showWorkload ? 'col-span-1 md:col-span-3' : 'col-span-1'}`}>
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
            <Flame className="w-16 h-16 text-red-500" />
          </div>
          <div className="flex items-center gap-2 relative z-10 select-none">
            <span className="text-[10px] text-zinc-500 uppercase font-bold font-mono">
              工作量证明
            </span>
            <button
              type="button"
              onClick={() => setShowWorkload(!showWorkload)}
              className={`p-1 rounded hover:bg-zinc-800/50 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                showWorkload ? 'text-red-500 scale-110' : 'text-zinc-500 hover:text-red-400'
              }`}
              title={showWorkload ? "收起记录仪" : "点击查看记录仪"}
            >
              <Flame className={`w-4 h-4 ${showWorkload ? 'animate-pulse' : ''}`} />
            </button>
          </div>
          <h3 className="text-2xl font-black text-zinc-100 font-mono mt-1 relative z-10">
            {nodes.length} <span className="text-xs text-zinc-400 font-normal">NODES</span>
          </h3>

          <AnimatePresence>
            {showWorkload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-zinc-900 overflow-hidden relative z-10"
              >
                <div className="space-y-3">
                  <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-bold font-mono">
                    神圣座位任务链存储记录仪
                  </h4>

                  {nodes.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500 font-mono rounded-xl">
                      [ 空无一物 // Null Chain State ] <br />
                      当前并没有锚定的历史专注连接点。落座神圣座位并顺利完成一次专注以触发 ##1。
                    </div>
                  ) : (
                    <div className="relative border border-zinc-850 bg-zinc-950/70 p-4 rounded-xl">
                      {/* Visual connected vertical thread line */}
                      <div className="absolute left-[34px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-red-900/40 to-emerald-900/35" />

                      <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2 relative">
                        {nodes.map((node, i) => {
                          const details = getUnitDetails(node.unitType);
                          const Icon = details.icon;

                          return (
                            <motion.div
                              key={node.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-start gap-4 font-mono group"
                            >
                              {/* Compact tactical serial label */}
                              <div className="w-10 text-center shrink-0 pt-1.5">
                                <span className="text-xs font-black text-red-500 tracking-tighter">
                                  ##{node.index}
                                </span>
                              </div>

                              {/* Node status bullet icon */}
                              <div className="w-6 h-6 rounded-full bg-black border-2 border-emerald-500 flex items-center justify-center shrink-0 z-10 shadow-md group-hover:scale-110 transition-all cursor-crosshair">
                                <Icon className="w-3 h-3 text-emerald-400" />
                              </div>

                              {/* Rich informational card */}
                              <div className="flex-1 border border-zinc-850 bg-zinc-900/30 hover:border-zinc-700/80 p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg transition-colors">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 text-xs rounded ${details.bg} ${details.color}`}>
                                      {details.label.split(' ')[0]}
                                    </span>
                                    <span className="font-bold text-xs text-zinc-200 uppercase tracking-tight">
                                      {node.taskName}
                                    </span>
                                    {node.selectedGoalId && (() => {
                                      const sg = legions.flatMap(l => l.subGoals).find(g => g.id === node.selectedGoalId);
                                      if (sg) {
                                        const sgColor = getColorDetails(sg.color);
                                        const SgIcon = getSubGoalIcon(sg.icon);
                                        return (
                                          <span className={`inline-flex items-center gap-1 text-[8.5px] uppercase font-bold px-1.5 py-0.5 border rounded ${sgColor.border} ${sgColor.bg} ${sgColor.text}`}>
                                            <SgIcon className="w-2.5 h-2.5" />
                                            归属于: {sg.name}
                                          </span>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <p className="text-[10px] text-zinc-500">
                                    落座归档时间: {node.completedAt}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3 self-end md:self-auto uppercase">
                                  <div className="text-right">
                                    <span className="text-xs text-emerald-400 font-bold tracking-widest block font-mono">
                                      +{node.duration} MINS
                                    </span>
                                    <span className="text-[8px] text-zinc-500">证明度: {node.duration * 10}g</span>
                                  </div>
                                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-800/80 p-4 relative overflow-hidden rounded-xl">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Clock className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="text-[10px] text-zinc-500 uppercase font-bold font-mono">
            总质量积淀
          </div>
          <h3 className="text-2xl font-black text-emerald-400 font-mono mt-1">
            {totalHours} <span className="text-xs text-zinc-400 font-normal">HOURS</span>
          </h3>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-800/80 p-4 relative rounded-xl">
          <div className="text-[10px] text-zinc-500 uppercase font-bold font-mono">
            契约完整度
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            {isPoisoned ? (
              <span className="text-red-500 font-bold text-sm bg-red-950/20 px-2 py-0.5 border border-red-900 rounded inline-block animate-pulse">
                【契约已污染 / TOXIC】
              </span>
            ) : (
              <span className="text-emerald-400 font-bold text-sm bg-emerald-950/20 px-2 py-0.5 border border-emerald-900 rounded inline-block">
                【神圣无瑕 / SACROSANCT】
              </span>
            )}
          </div>
        </div>
      </div>



      {/* Active Session OR Construction Form */}
      <AnimatePresence mode="wait">
        {activeSession ? (
          <motion.div
            key="active-session"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-6 border-2 ${isPoisoned ? 'border-red-950 bg-[#0e0202]' : 'border-emerald-950 bg-[#020704]'} relative flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden rounded-xl`}
          >
            {/* Pulsing grid shadow for focusing state */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:100%_8px] opacity-70 animate-pulse pointer-events-none" />

            <div className="space-y-3 z-10 w-full md:w-2/3">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs uppercase font-extrabold text-emerald-400 font-mono tracking-wider bg-emerald-950/40 px-2 py-0.5 border border-emerald-900/40">
                  {getUnitDetails(activeSession.unitType).label}
                </span>
                <span className="text-xs font-mono text-gray-500">// 驻席状态: 神圣座位已落锁</span>
              </div>
              <h4 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
                {activeSession.taskName}
              </h4>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                描述: {getUnitDetails(activeSession.unitType).desc}。
                <span className="text-red-400 block mt-1 font-bold">
                  【禁忌警示】：绝对严禁离座或切开窗口。任何违规行径一律诉诸「判例博弈审判」。
                </span>
              </p>

              {/* Dynamic Real-Time SubGoal Progress Display */}
              {selectedGoal && (
                <div className="mt-4 p-3.5 border border-zinc-800 bg-zinc-950/60 rounded-xl space-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(45deg,rgba(16,185,129,0.03)_25%,transparent_25%)] bg-[size:10px_10px]" />
                  
                  <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tracking-wider text-amber-500 font-bold font-mono">
                        // 关联攻坚战役 (Linked Campaign Goal):
                      </span>
                      <span className="text-xs font-bold text-zinc-100 uppercase">
                        {selectedGoal.name}
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 font-mono tracking-wider">
                        {Math.min(100, Math.round(((selectedGoal.incurredTime + (activeSession.totalDuration - activeSession.timeLeft) / 60) / selectedGoal.estimatedTime) * 100))}%
                      </span>
                    </div>
                  </div>

                  {(() => {
                    const elapsedMin = (activeSession.totalDuration - activeSession.timeLeft) / 60;
                    const liveIncurred = selectedGoal.incurredTime + elapsedMin;
                    const livePct = Math.min(100, (liveIncurred / selectedGoal.estimatedTime) * 100);
                    const colorD = getColorDetails(selectedGoal.color);
                    return (
                      <div className="space-y-1 z-10 relative">
                        <div className="w-full h-1.5 bg-zinc-900 border border-zinc-850 rounded-sm overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ease-out ${colorD.fill} shadow-[0_0_10px_rgba(16,185,129,0.3)]`}
                            style={{ width: `${livePct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>
                            已投入: <strong className="text-zinc-200">{liveIncurred.toFixed(1)} 分钟</strong> (原: {selectedGoal.incurredTime.toFixed(0)}m + 实: {elapsedMin.toFixed(1)}m)
                          </span>
                          <span>
                            预计需求: <strong className="text-zinc-300">{selectedGoal.estimatedTime} 分钟</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Special Addition: Extend timer for Recon unit */}
              {activeSession.unitType === 'recon' && (
                <div className="pt-2 flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-amber-500 font-bold font-mono">侦查已生效，允许升级装备为正式战役:</span>
                  <button
                    onClick={() => onExtendSession(40)}
                    className="px-2.5 py-1 bg-amber-950 hover:bg-amber-600 hover:text-black border border-amber-500 text-amber-400 text-[10px] font-bold uppercase rounded-lg transition-all"
                  >
                    +40 mins (升级突击单元)
                  </button>
                  <button
                    onClick={() => onExtendSession(55)}
                    className="px-2.5 py-1 bg-sky-950 hover:bg-sky-600 hover:text-black border border-sky-500 text-sky-400 text-[10px] font-bold uppercase rounded-lg transition-all"
                  >
                    +55 mins (升级工程战役)
                  </button>
                </div>
              )}
            </div>

            <div className="text-center z-10 flex flex-col items-center justify-center shrink-0 w-full md:w-1/3">
              <div className="text-5xl lg:text-6xl font-black font-mono tracking-widest text-emerald-400 glow-green py-2 bg-[#09150e]/40 border border-emerald-900/30 px-6 w-full max-w-xs select-none rounded-xl">
                {formatTime(activeSession.timeLeft)}
              </div>
              <div className="w-full max-w-xs mt-3">
                <button
                  type="button"
                  onClick={onAbortSession}
                  className="w-full py-2 bg-gradient-to-r from-red-950 to-[#3a0606] hover:from-red-600 hover:to-red-800 text-red-100/90 font-bold uppercase text-[11px] font-mono tracking-widest cursor-pointer border border-red-600 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 group"
                >
                  <StopCircle className="w-4 h-4 text-red-400 group-hover:text-white" />
                  中断专注 [ 触发判例法 ]
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="timer-form"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="p-5 border border-zinc-800 bg-zinc-950/40 rounded-xl shadow-md"
          >
            <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-4 font-mono">
              配置下一次神圣座位契约
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Topic field */}
                <div className="space-y-1.5 col-span-12 md:col-span-5">
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold">
                    当前专注战役代号
                  </label>
                  <input
                    type="text"
                    placeholder={isInputFocused ? "输入具体攻坚任务 (例如: 离散数学第三章、Rust 并发底层)" : ""}
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-200 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-red-900 font-mono"
                  />
                </div>

                {/* Sub-goal selection field */}
                <div className="space-y-1.5 col-span-12 md:col-span-4 select-none">
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold">
                    关联兵团编制子目标
                  </label>
                  <select
                    value={selectedGoalId}
                    onChange={(e) => {
                      setSelectedGoalId(e.target.value);
                      if (e.target.value && !taskName.trim()) {
                        const matched = legions.flatMap(l => l.subGoals).find(g => g.id === e.target.value);
                        if (matched) {
                          setTaskName(`战役攻坚 - ${matched.name}`);
                        }
                      }
                    }}
                    onFocus={() => setIsSelectFocused(true)}
                    onBlur={() => setIsSelectFocused(false)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 text-zinc-300 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:bg-zinc-90 w-full focus:border-red-900 font-mono"
                  >
                    <option value="">{isSelectFocused ? "-- [ 独立自主：未关联任何编制 ] --" : ""}</option>
                    {legions.map((legion) => {
                      const simpleLegionName = legion.name.split(' //')[0];
                      return (
                        <optgroup key={legion.id} label={simpleLegionName}>
                          {legion.subGoals.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name} (已计: {g.incurredTime}/{g.estimatedTime}m)
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>

                {/* Duration select */}
                <div className="space-y-1.5 col-span-12 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] uppercase text-zinc-500 font-bold">
                      选择战斗时长
                    </label>
                    <span className="text-xs font-black text-red-500 font-mono">
                      {duration} <span className="text-[9px] text-zinc-550 font-normal">MINS</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={15}
                      max={180}
                      step={5}
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                    <div className="flex justify-between text-[9px] text-zinc-500 font-mono select-none mt-1">
                      <span>15M</span>
                      <span>60M</span>
                      <span>120M</span>
                      <span>180M</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Side-by-Side: Left Side AuxiliaryChain, Right Side New Specialized Unit Select + Action Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {/* Left Side: AuxiliaryChain area */}
                <AuxiliaryChain
                  state={auxiliaryState}
                  auxMinutes={auxMinutes}
                  onSetAuxMinutes={onSetAuxMinutes}
                  onStartReservation={onStartReservation}
                  onCancelReservation={onCancelReservation}
                  onConfirmSeat={onConfirmSeat}
                  onGraceDefault={onGraceDefault}
                  isAutoRenew={isAutoRenew}
                />

                {/* Right Side: Round-cornered region for military unit type selection & contract initiation */}
                <div className="border border-zinc-800 bg-zinc-950/40 p-5 relative overflow-hidden rounded-xl shadow-md flex flex-col justify-between">
                  {/* Subtle scanline background matching left card */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(#27272a_1px,transparent_1px)] bg-[size:100%_20px] opacity-10" />

                  <div className="space-y-4 relative z-10 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase text-zinc-500 font-bold">
                        编制性质
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['assault', 'recon', 'engineer', 'command'] as UnitType[]).map((type) => {
                          const info = getUnitDetails(type);
                          const Icon = info.icon;
                          const isSelected = unitType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setUnitType(type);
                                if (type === 'recon') setDuration(15);
                                else if (duration < 15) setDuration(45);
                              }}
                              className={`p-2.5 border text-left flex gap-1.5 cursor-pointer rounded-xl transition-all select-none ${
                                isSelected
                                  ? `${info.borderColor} bg-zinc-900/50 glow-red`
                                  : 'border-zinc-800/80 bg-zinc-900/20 hover:border-zinc-700'
                              }`}
                            >
                              <Icon 
                                className={`w-4 h-4 shrink-0 mt-0.5 cursor-pointer hover:text-white transition-all hover:scale-110 ${isSelected ? info.color : 'text-zinc-500'}`} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRevealedDescs(prev => ({ ...prev, [type]: !prev[type] }));
                                }}
                                title="点击查看说明"
                              />
                              <div>
                                <div className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                  {info.label.split(' ')[0]}
                                </div>
                                {revealedDescs[type] && (
                                  <div className="text-[9px] text-zinc-400 leading-tight mt-0.5 select-none">
                                    {info.desc}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-red-950 hover:bg-red-900 hover:text-white border border-red-550 text-red-400 font-extrabold uppercase text-xs font-mono tracking-widest cursor-pointer shadow-md rounded-xl transition-all active:scale-[99%]"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Play className="w-3.5 h-3.5 text-red-400" />
                          启动契约
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
