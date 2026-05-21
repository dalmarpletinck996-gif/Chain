import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Shield, Cpu, Scale, HelpCircle, Activity, Award, RefreshCw, AlertTriangle, Play } from 'lucide-react';
import { FocusNode, Precedent, BreachLog, AuxiliaryState, UnitType, Legion, SubGoal } from './types';
import { MainChain } from './components/MainChain';
import { AuxiliaryChain } from './components/AuxiliaryChain';
import { Legion编制 } from './components/Legion编制';
import { BreachConsole } from './components/BreachConsole';
import { CaseLawDialog } from './components/CaseLawDialog';

export default function App() {
  // 1. Core Persistent States from localStorage
  const [nodes, setNodes] = useState<FocusNode[]>(() => {
    const saved = localStorage.getItem('sacred_nodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [precedents, setPrecedents] = useState<Precedent[]>(() => {
    const saved = localStorage.getItem('sacred_precedents');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<BreachLog[]>(() => {
    const saved = localStorage.getItem('sacred_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [isPoisoned, setIsPoisoned] = useState<boolean>(() => {
    const saved = localStorage.getItem('sacred_is_poisoned');
    return saved ? JSON.parse(saved) === 'true' : false;
  });

  const [legions, setLegions] = useState<Legion[]>(() => {
    const saved = localStorage.getItem('sacred_legions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'legion-1',
        name: '第九突击集团军 (Vanguard Assault Force)',
        subGoals: [
          { id: 'goal-1-1', name: '编译器底座设计与自举演练', estimatedTime: 120, incurredTime: 45, icon: 'Cpu', color: 'red' },
          { id: 'goal-1-2', name: '离散数学状态机逻辑推演', estimatedTime: 90, incurredTime: 15, icon: 'BookOpen', color: 'amber' }
        ]
      },
      {
        id: 'legion-2',
        name: '终极防御卫戍兵团 (Bastion Shield Garrison)',
        subGoals: [
          { id: 'goal-2-1', name: '系统并发竞态条件彻底消除', estimatedTime: 180, incurredTime: 90, icon: 'Shield', color: 'emerald' },
          { id: 'goal-2-2', name: '全链路混沌测试红蓝博弈', estimatedTime: 240, incurredTime: 60, icon: 'Swords', color: 'sky' }
        ]
      }
    ];
  });

  // 2. Active Session & Auxiliary States
  const [activeSession, setActiveSession] = useState<{
    isRunning: boolean;
    timeLeft: number;
    totalDuration: number;
    unitType: UnitType;
    taskName: string;
    selectedGoalId?: string;
  } | null>(() => {
    const saved = localStorage.getItem('sacred_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [auxMinutes, setAuxMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('sacred_aux_minutes');
    return saved ? parseInt(saved) : 15;
  });

  const [auxiliaryState, setAuxiliaryState] = useState<AuxiliaryState>(() => {
    const savedState = localStorage.getItem('sacred_aux_state');
    if (savedState) return JSON.parse(savedState);
    const savedMins = localStorage.getItem('sacred_aux_minutes');
    const mins = savedMins ? parseInt(savedMins) : 15;
    return { status: 'idle', timeLeft: mins * 60, graceTimeLeft: 60 };
  });

  const [isAutoRenew, setIsAutoRenew] = useState<boolean>(() => {
    const saved = localStorage.getItem('sacred_auto_renew');
    return saved ? saved === 'true' : false;
  });

  const handleSetAuxMinutes = (mins: number) => {
    setAuxMinutes(mins);
    if (auxiliaryState.status === 'idle') {
      setAuxiliaryState(prev => ({ ...prev, timeLeft: mins * 60 }));
    }
  };

  // 3. UI states
  const [activeTab, setActiveTab] = useState<'seat' | 'legion' | 'audit'>('seat');
  const [isCaseLawOpen, setIsCaseLawOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [explosionActive, setExplosionActive] = useState(false);
  const [recentWipeAmount, setRecentWipeAmount] = useState(0);

  // Auto-renew UI lockout warning states
  const [renewShaking, setRenewShaking] = useState(false);
  const [showRenewMsg, setShowRenewMsg] = useState(false);

  // Audio synthesis helpers
  const audioContextRef = useRef<AudioContext | null>(null);
  const playTone = (freqs: number[], duration: number, type: OscillatorType = 'sine', stepDelay = 0) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * stepDelay);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * stepDelay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * stepDelay + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * stepDelay);
        osc.stop(ctx.currentTime + idx * stepDelay + duration);
      });
    } catch (e) {
      console.warn('Synth block:', e);
    }
  };

  // 4. Persistence effects
  useEffect(() => {
    localStorage.setItem('sacred_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('sacred_precedents', JSON.stringify(precedents));
  }, [precedents]);

  useEffect(() => {
    localStorage.setItem('sacred_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('sacred_is_poisoned', String(isPoisoned));
  }, [isPoisoned]);

  useEffect(() => {
    localStorage.setItem('sacred_legions', JSON.stringify(legions));
  }, [legions]);

  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('sacred_active_session', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('sacred_active_session');
    }
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem('sacred_aux_state', JSON.stringify(auxiliaryState));
  }, [auxiliaryState]);

  useEffect(() => {
    localStorage.setItem('sacred_auto_renew', String(isAutoRenew));
  }, [isAutoRenew]);

  useEffect(() => {
    localStorage.setItem('sacred_aux_minutes', String(auxMinutes));
  }, [auxMinutes]);

  // 5. Global Clock Ticks for Main Session & Auxiliary Buffers
  useEffect(() => {
    const interval = setInterval(() => {
      // Handle focus session timer
      if (activeSession && activeSession.isRunning) {
        if (activeSession.timeLeft > 1) {
          if (activeSession.timeLeft === 61) {
            // Last minute of focus chain: play an optimistic ascending chime (E5 -> A5)
            playTone([659.25, 880.00], 0.3, 'sine', 0.15);
          }
          setActiveSession(prev => prev ? { ...prev, timeLeft: prev.timeLeft - 1 } : null);
        } else {
          // Timer finished successfully! Celebrate with synthesis
          playTone([523.25, 659.25, 783.99, 1046.50], 0.8, 'sine', 0.1); // C major chord arpeggio
          const newNodeIndex = nodes.length + 1;
          const durationMinutes = activeSession.totalDuration / 60;
          const newNode: FocusNode = {
            id: crypto.randomUUID(),
            index: newNodeIndex,
            duration: durationMinutes,
            completedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            unitType: activeSession.unitType,
            taskName: activeSession.taskName,
            selectedGoalId: activeSession.selectedGoalId
          };
          setNodes(prev => [...prev, newNode]);

          // Increment sub-goal incurredTime
          if (activeSession.selectedGoalId) {
            setLegions(prevLegions => prevLegions.map(legion => ({
              ...legion,
              subGoals: legion.subGoals.map(sg => {
                if (sg.id === activeSession.selectedGoalId) {
                  return { ...sg, incurredTime: sg.incurredTime + durationMinutes };
                }
                return sg;
              })
            })));
          }

          setActiveSession(null);

          // Auto-renew: Automatically start auxiliary chain/relax buffer
          if (isAutoRenew) {
            setAuxiliaryState({
              status: 'countdown',
              timeLeft: auxMinutes * 60,
              graceTimeLeft: 60
            });
            const renewLog: BreachLog = {
              id: crypto.randomUUID(),
              timestamp: new Date().toLocaleString(),
              type: 'precedent_invoked',
              description: `【自动续期】主链完美契约归档。系统自动启用「${auxMinutes} 分钟缓释启动预约机制」。`,
              formerChainLength: newNodeIndex
            };
            setLogs(prev => [renewLog, ...prev]);
          }
        }
      }

      // Handle auxiliary buffer relaxation countdown
      if (auxiliaryState.status === 'countdown') {
        if (auxiliaryState.timeLeft > 1) {
          if (auxiliaryState.timeLeft === 61) {
            // Last minute of auxiliary leisure reservation: play a tactical alert sequence (A4 -> F4)
            playTone([440.00, 349.23], 0.4, 'triangle', 0.15);
          }
          setAuxiliaryState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
        } else {
          // Buffer completed. Trigger intense lock overlay!
          setAuxiliaryState(prev => ({ ...prev, status: 'lockout', graceTimeLeft: 60 }));
        }
      }

      // Handle auxiliary lock grace countdown
      if (auxiliaryState.status === 'lockout') {
        if (auxiliaryState.graceTimeLeft > 1) {
          setAuxiliaryState(prev => ({ ...prev, graceTimeLeft: prev.graceTimeLeft - 1 }));
        } else {
          // Grace expired! Severe breach lockout! Automatic trigger Case Law or Wipe!
          // Force failure protocol
          setAuxiliaryState(prev => ({ ...prev, status: 'breached' }));
          handleGraceDefault();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, auxiliaryState, nodes.length, isAutoRenew, auxMinutes]);

  // 6. Action handlers
  const handleStartSession = (durationMinutes: number, unit: UnitType, title: string, selectedGoalId?: string) => {
    playTone([440, 554.37, 659.25], 0.4, 'triangle', 0.05); // Elegant A major
    setActiveSession({
      isRunning: true,
      timeLeft: durationMinutes * 60,
      totalDuration: durationMinutes * 60,
      unitType: unit,
      taskName: title,
      selectedGoalId: selectedGoalId
    });
  };

  const handleAbortSession = () => {
    // Open Court Martial Case Law dialog
    setIsCaseLawOpen(true);
  };

  const handleExtendSession = (additionalMinutes: number) => {
    playTone([440, 587.33, 739.99], 0.4, 'sine');
    setActiveSession(prev => {
      if (!prev) return null;
      const addedSecs = additionalMinutes * 60;
      return {
        ...prev,
        timeLeft: prev.timeLeft + addedSecs,
        totalDuration: prev.totalDuration + addedSecs
      };
    });
  };

  // Triggered when dynamic grace time hits 0
  const handleGraceDefault = () => {
    playTone([110, 82.41, 55], 0.9, 'sawtooth', 0.15); // Brutal low rumble
    
    const formerLen = nodes.length;
    // Log the default event
    const newLog: BreachLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      type: 'reservation_default',
      description: `预约 ${auxMinutes} 分钟缓冲期结束，玩家未按时守约落座。系统记录违规违约。`,
      formerChainLength: formerLen
    };
    setLogs(prev => [newLog, ...prev]);

    // Edmond Rules: Defaults can trigger Case Law immediately!
    setIsCaseLawOpen(true);
  };

  // Dialog Choice A: Thorough Collapse & Erase
  const handleChoiceA_Wipeout = () => {
    // Tremble layout trigger
    setShaking(true);
    setExplosionActive(true);
    setTimeout(() => {
      setShaking(false);
    }, 1500);

    // Deep destructive collapsing synthesizer noise
    playTone([200, 150, 100, 50], 1.5, 'sawtooth', 0.1);

    const lengthToWipe = nodes.length;
    setRecentWipeAmount(lengthToWipe);

    // Create a severe log
    const wipeLog: BreachLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      type: 'wipeout',
      description: `【断链毁约惩罚】承认专注溃败，清扫消除由 ##1 到 ##${lengthToWipe || 'N'} 的全部历史节点记录。重新从零起步。`,
      formerChainLength: lengthToWipe
    };

    setLogs(prev => [wipeLog, ...prev]);
    setNodes([]); // CLEARED to zero structure! All sinking cost is demolished!
    setIsPoisoned(false); // Cleaned back to baseline since they suffered the absolute wipe punishment
    setActiveSession(null);
    setAuxiliaryState({ status: 'idle', timeLeft: 900, graceTimeLeft: 60 });
    setIsCaseLawOpen(false);

    // Shut particle overlay down eventually
    setTimeout(() => {
      setExplosionActive(false);
    }, 4000);
  };

  // Dialog Option B: Grandfather Precedent Rule Compromise
  const handleChoiceB_Precedent = (reason: string) => {
    playTone([261.63, 293.66, 261.63], 0.6, 'sawtooth', 0.1); // Bleak sounding progression

    const newId = crypto.randomUUID();
    const newPrecedent: Precedent = {
      id: newId,
      timestamp: new Date().toLocaleDateString(),
      reason: reason,
      compromiseExplanation: `允许以‘${reason}’事由离座。规则系统开设逃生漏洞，历史自律信仰产生折损。`,
      invocations: 1
    };

    setPrecedents(prev => [...prev, newPrecedent]);
    setIsPoisoned(true); // Permanent mark of shame on this chain lifecycle!

    const log: BreachLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      type: 'precedent_created',
      description: `确立例外判例：『${reason}』纳入此生命周期合法例外。契约正式开始承受隐性瓦解。`,
      formerChainLength: 0
    };
    setLogs(prev => [log, ...prev]);

    // Force complete the active session as custom saved exemption node to avoid absolute wiping!
    if (activeSession) {
      const durationMinutes = activeSession.totalDuration / 60;
      const savedNode: FocusNode = {
        id: crypto.randomUUID(),
        index: nodes.length + 1,
        duration: durationMinutes,
        completedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        unitType: activeSession.unitType,
        taskName: `${activeSession.taskName} (判例豁免款 #${newId.substring(0, 4)})`,
        isPrecedentLegalized: true,
        selectedGoalId: activeSession.selectedGoalId
      };
      setNodes(prev => [...prev, savedNode]);

      // Increment sub-goal incurredTime
      if (activeSession.selectedGoalId) {
        setLegions(prevLegions => prevLegions.map(legion => ({
          ...legion,
          subGoals: legion.subGoals.map(sg => {
            if (sg.id === activeSession.selectedGoalId) {
              return { ...sg, incurredTime: sg.incurredTime + durationMinutes };
            }
            return sg;
          })
        })));
      }
    }

    // Stop active focus & auxiliary
    setActiveSession(null);
    setAuxiliaryState({ status: 'idle', timeLeft: 900, graceTimeLeft: 60 });
    setIsCaseLawOpen(false);
  };

  // Invoked a previously established precedent from the console to bypass current crisis
  const handleInvokePrecedent = (id: string) => {
    const targetPrec = precedents.find(p => p.id === id);
    if (!targetPrec || !activeSession) return;

    playTone([329.63, 349.23, 392.00], 0.5, 'sine', 0.05);

    // Register active use
    setPrecedents(prev => prev.map(p => p.id === id ? { ...p, invocations: p.invocations + 1 } : p));

    const log: BreachLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
      type: 'precedent_invoked',
      description: `【依法行使豁免】调用已有判例『${targetPrec.reason}』。本次中断获得规则免究。`,
      formerChainLength: 0
    };
    setLogs(prev => [log, ...prev]);

    // Complete session with exemption stamp
    const durationMinutes = activeSession.totalDuration / 60;
    const escapedNode: FocusNode = {
      id: crypto.randomUUID(),
      index: nodes.length + 1,
      duration: durationMinutes,
      completedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      unitType: activeSession.unitType,
      taskName: `${activeSession.taskName} (援引例外免扣)`,
      isPrecedentLegalized: true,
      selectedGoalId: activeSession.selectedGoalId
    };
    setNodes(prev => [...prev, escapedNode]);

    // Increment sub-goal incurredTimeOn precedent invocation as well
    if (activeSession.selectedGoalId) {
      setLegions(prevLegions => prevLegions.map(legion => ({
        ...legion,
        subGoals: legion.subGoals.map(sg => {
          if (sg.id === activeSession.selectedGoalId) {
            return { ...sg, incurredTime: sg.incurredTime + durationMinutes };
          }
          return sg;
        })
      })));
    }

    // Reset systems
    setActiveSession(null);
    setAuxiliaryState({ status: 'idle', timeLeft: 900, graceTimeLeft: 60 });
  };

  // Pure state reset for testing/purging
  const handleClearPrecedents = () => {
    if (confirm('确认全面清理所有判例机制漏洞，让系统规则重新纯净、神圣无懈可击？(这不会清除专注节点记录)')) {
      playTone([349.23, 440, 523.25], 0.5, 'triangle');
      setPrecedents([]);
      setIsPoisoned(false);
    }
  };

  // Auxiliary Buffers setup
  const handleStartReservation = (minutes: number) => {
    setAuxiliaryState({
      status: 'countdown',
      timeLeft: minutes * 60,
      graceTimeLeft: 60
    });
  };

  const handleCancelReservation = () => {
    // Aborting the buffer counts as a breach! Trigger General Court Martial trial dialog
    setIsCaseLawOpen(true);
  };

  const handleConfirmReservationSeat = () => {
    playTone([440, 554.37, 659.25, 880], 0.6, 'sine', 0.05);
    // Boot a default 45 minutes assault unit into seat
    setActiveSession({
      isRunning: true,
      timeLeft: 45 * 60,
      totalDuration: 45 * 60,
      unitType: 'assault',
      taskName: `预约战后第一突击单元`
    });
    setAuxiliaryState({ status: 'idle', timeLeft: auxMinutes * 60, graceTimeLeft: 60 });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 flex flex-col relative overflow-hidden border-8 border-zinc-900">
      {/* Absolute grid lines layout */}
      <div className="absolute inset-0 pointer-events-none tactical-grid select-none z-0" />

      {/* Extreme Wipe Destruction Particle Overlay */}
      {explosionActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-red-950/45 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.2, opacity: 1 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="w-96 h-96 border-4 border-red-600 rounded-full flex items-center justify-center font-black text-xl text-red-500 glow-red"
          >
            【 BLOCKCHAIN COLLAPSED - LOST {recentWipeAmount} NODES 】
          </motion.div>
        </div>
      )}

      {/* Overall shaking layout container */}
      <motion.div
        animate={shaking ? {
          x: [0, -10, 10, -10, 10, -5, 5, -2, 2, 0],
          y: [0, 8, -8, 8, -8, 4, -4, 2, -2, 0],
        } : {}}
        transition={{ duration: 1.2 }}
        className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-6 py-4 relative z-10"
      >
        {/* Artistic Flair Technical Header Status Bar */}
        <header className="border-b border-zinc-800 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none bg-zinc-950/60 px-4 -mx-6 -mt-4 mb-4">
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-xs tracking-tighter font-mono">// SYSTEM: CTDP_V1.10</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="text-xs text-zinc-500 tabular-nums font-mono">
            DATE: 2026.05.20 // PROTOCOL: ENFORCED
          </div>
        </header>



        {/* Dashboard layouts */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 pb-6">
          {/* Left Rail: Section index nav links */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border border-zinc-800 bg-zinc-950/50 p-4 rounded-xl">
              <div className="text-[10px] uppercase font-bold text-zinc-500 font-mono mb-3 tracking-wider">
                // CONTROL CONSOLE
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'seat', label: '01. 主链神圣席位', desc: '进入专注时空', icon: Swords },
                  { id: 'legion', label: '02. 兵团序列编制', desc: '工作量层级架构', icon: Award },
                  { id: 'audit', label: '03. 判例与追责仓', desc: '豁免及审计总账', icon: Scale },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        playTone([500], 0.05, 'sine');
                        setActiveTab(tab.id as any);
                      }}
                      className={`w-full text-left p-2.5 border cursor-pointer font-mono flex items-start gap-2.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-zinc-900/40 border-zinc-600 text-white shadow-[0_0_15px_rgba(255,255,255,0.02)]'
                          : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/30'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-zinc-100' : 'text-zinc-600'}`} />
                      <div>
                        <div className="text-xs font-bold leading-normal">{tab.label}</div>
                        <div className="text-[9px] text-zinc-500 leading-none mt-0.5">{tab.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 辅助链已移至主链契约构建区域，提供一贯流线体验 */}

            {/* Auto Renew Module */}
            <motion.div
              animate={renewShaking ? {
                x: [0, -6, 6, -6, 6, -3, 3, 0],
              } : {}}
              transition={{ duration: 0.5 }}
              className="border border-zinc-805 bg-zinc-950/40 p-5 rounded-xl shadow-md relative overflow-hidden space-y-3 font-mono"
            >
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
              
              <div className="flex items-center justify-between pb-1 border-b border-zinc-900">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 text-zinc-400 ${isAutoRenew && activeSession?.isRunning ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                    // 自动续期服务协议
                  </span>
                </div>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold ${isAutoRenew ? 'bg-red-955/65 text-red-400 border border-red-900/40' : 'bg-zinc-900 text-zinc-500'}`}>
                  {isAutoRenew ? '自动续期中 / ON' : '无缝续期 / OFF'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-300 block font-mono">
                      自动续期
                    </span>
                  </div>
                  
                  {/* Digital Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const isMainChainActive = !!(activeSession && activeSession.isRunning);
                      if (isAutoRenew && !isMainChainActive) {
                        playTone([150, 100], 0.3, 'sawtooth');
                        setRenewShaking(true);
                        setShowRenewMsg(true);
                        setTimeout(() => setRenewShaking(false), 800);
                        setTimeout(() => setShowRenewMsg(false), 5000);
                        return;
                      }
                      const nextVal = !isAutoRenew;
                      setIsAutoRenew(nextVal);
                      playTone(nextVal ? [523.25, 783.99] : [392, 261.63], 0.2, 'sine');
                    }}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-none ${
                      isAutoRenew ? 'bg-amber-600' : 'bg-zinc-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-250 ease-in-out ${
                        isAutoRenew ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {showRenewMsg && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-2 border border-red-900 bg-red-950/35 text-[9px] text-red-400 font-mono leading-relaxed"
                    >
                      ⚠️ 【落锁控制】主链未开启！只能在主链运行期间关闭自动续期，非活跃契约处于锁止状态。
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-1.5 leading-tight pt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isAutoRenew ? 'bg-amber-500 animate-pulse' : 'bg-zinc-700'}`} />
                  <span>续约状态: 当主链结束，自动载入缓释备用倒计时</span>
                </div>
              </div>
            </motion.div>


          </div>

          {/* Right Rail: Render active sub components based on current view tab selection with smooth fade-in animations */}
          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="min-h-[500px]"
              >
                {activeTab === 'seat' && (
                  <MainChain
                    nodes={nodes}
                    activeSession={activeSession}
                    onStartSession={handleStartSession}
                    onAbortSession={handleAbortSession}
                    onExtendSession={handleExtendSession}
                    isPoisoned={isPoisoned}
                    activePrecedentsCount={precedents.length}
                    legions={legions}
                    auxiliaryState={auxiliaryState}
                    auxMinutes={auxMinutes}
                    onSetAuxMinutes={handleSetAuxMinutes}
                    onStartReservation={handleStartReservation}
                    onCancelReservation={handleCancelReservation}
                    onConfirmSeat={handleConfirmReservationSeat}
                    onGraceDefault={handleGraceDefault}
                    isAutoRenew={isAutoRenew}
                  />
                )}

                {activeTab === 'legion' && (
                  <Legion编制 
                    nodes={nodes} 
                    legions={legions} 
                    setLegions={setLegions} 
                  />
                )}

                {activeTab === 'audit' && (
                  <BreachConsole
                    precedents={precedents}
                    logs={logs}
                    onInvokePrecedent={handleInvokePrecedent}
                    onClearPrecedents={handleClearPrecedents}
                    currentChainLength={nodes.length}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Artistic Flair System Status details footer */}
        <footer className="h-10 bg-zinc-950 border-t border-zinc-900 flex flex-col sm:flex-row items-center px-4 -mx-6 -mb-4 justify-between select-none py-1 text-zinc-500 text-[10px] font-mono leading-none gap-2">
          <div className="flex gap-6 uppercase text-[9px] truncate">
            <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-zinc-700 rounded-full"></span> SYSTEM: ONLINE</div>
            <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-zinc-700 rounded-full"></span> INTEGRITY: {isPoisoned ? 'COMPROMISED' : '100%'}</div>
            <div className="flex items-center gap-1.5"><span className="w-1 h-1 bg-zinc-700 rounded-full"></span> FOCUS_MASS: {nodes.reduce((acc, curr) => acc + curr.duration, 0)} MINS</div>
          </div>
          <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            CONNECTION_SECURE : CONTRACT_ENFORCED
          </div>
        </footer>

        {/* COURT MARTIAL JUDGMENT DIALOG POPUP */}
        <AnimatePresence>
          {isCaseLawOpen && (
            <CaseLawDialog
              isOpen={isCaseLawOpen}
              onClose={() => {
                playTone([523.25], 0.1, 'sine');
                setIsCaseLawOpen(false);
              }}
              onChooseA_Wipeout={handleChoiceA_Wipeout}
              onChooseB_Precedent={handleChoiceB_Precedent}
              activePrecedents={precedents}
              currentChainLength={nodes.length}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
