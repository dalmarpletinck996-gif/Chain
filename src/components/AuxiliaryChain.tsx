import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, ShieldAlert, Zap, AlertOctagon, Volume2, Lock } from 'lucide-react';
import { AuxiliaryState } from '../types';

interface AuxiliaryChainProps {
  state: AuxiliaryState;
  auxMinutes: number;
  onSetAuxMinutes: (mins: number) => void;
  onStartReservation: (minutes: number) => void;
  onCancelReservation: () => void; // Causes Case Law trial!
  onConfirmSeat: () => void;
  onGraceDefault: () => void;
  isAutoRenew?: boolean;
}

export const AuxiliaryChain: React.FC<AuxiliaryChainProps> = ({
  state,
  auxMinutes,
  onSetAuxMinutes,
  onStartReservation,
  onCancelReservation,
  onConfirmSeat,
  onGraceDefault,
  isAutoRenew = false,
}) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Sound generator function using Web Audio API (totally autonomous, no external audio files required!)
  const playTacticalAlarm = (freq: number, duration: number, type: OscillatorType = 'sine') => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio synthesis failed or blocked by browser gesture permissions:', e);
    }
  };

  // Play audio triggers on state updates
  useEffect(() => {
    if (state.status === 'lockout') {
      // Loop a high-pitched alert alarm
      const interval = setInterval(() => {
        playTacticalAlarm(880, 0.4, 'sawtooth');
      }, 1000);
      return () => clearInterval(interval);
    } else if (state.status === 'countdown' && state.timeLeft <= 10) {
      // Quick countdown ticks for the final 10 seconds
      playTacticalAlarm(440, 0.08, 'sine');
    }
  }, [state.status, state.timeLeft]);

  // Handle countdown intervals if active in parent, but let's draw the interface elegantly
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const textSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${textSecs.toString().padStart(2, '0')}`;
  };

  // Render the proper visual layout based on the current system status
  return (
    <div className={`border bg-zinc-950/40 p-5 relative overflow-hidden rounded-xl shadow-md transition-all duration-300 flex flex-col justify-between ${isAutoRenew ? 'border-amber-900/40 bg-amber-955/5' : 'border-zinc-800'}`}>
      {/* Subtle scanline background */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(#27272a_1px,transparent_1px)] bg-[size:100%_20px] opacity-10" />

      <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2 relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          {isAutoRenew ? (
            <Lock className="w-5 h-5 text-amber-500 animate-[pulse_2s_infinite]" />
          ) : (
            <Coffee className="w-5 h-5 text-amber-500 animate-pulse" />
          )}
          <h4 className="text-xs uppercase tracking-wider text-amber-500 font-extrabold font-mono flex items-center gap-1.5">
            辅助链 - {auxMinutes}分钟缓释启动预约
            {isAutoRenew && <span className="text-[10px] text-amber-500/80 font-normal select-none">(已锁定)</span>}
          </h4>
        </div>
        <button
          onClick={() => playTacticalAlarm(520, 0.2, 'sine')}
          className="text-zinc-500 hover:text-zinc-300 p-1"
          title="测试音效"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {state.status === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 relative z-10 flex-1 flex flex-col justify-between"
          >
            <div className={`space-y-1.5 transition-opacity ${isAutoRenew ? 'opacity-50' : ''}`}>
              <label className="block text-[10px] uppercase text-zinc-500 font-bold font-mono">
                预约缓释放松时长 {isAutoRenew && ' [ 受主链自动续期托管 ] '}
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    disabled={isAutoRenew}
                    onClick={() => {
                      if (isAutoRenew) return;
                      playTacticalAlarm(440, 0.08, 'sine');
                      onSetAuxMinutes(mins);
                    }}
                    className={`py-1.5 text-xs font-mono font-bold uppercase border rounded-lg transition-all ${
                      isAutoRenew ? 'cursor-not-allowed' : 'cursor-pointer'
                    } ${
                      auxMinutes === mins
                        ? 'bg-amber-950/45 border-amber-500 text-amber-450 font-extrabold'
                        : 'bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-805'
                    }`}
                  >
                    {mins} MIN
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {isAutoRenew ? (
                <div className="border border-amber-900/30 bg-amber-955/10 p-3 rounded-xl flex items-center gap-3 select-none">
                  <Lock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-amber-400 font-mono uppercase">托管状态：自动续期生效中</div>
                    <div className="text-[9px] text-zinc-400 font-mono leading-tight">
                      无需手动启动预约。主链契约圆满结束时，将自动带入 {auxMinutes} 分钟备用放松缓冲机制。
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    playTacticalAlarm(587.33, 0.25, 'triangle');
                    onStartReservation(auxMinutes);
                  }}
                  className="w-full py-2.5 bg-amber-950/40 hover:bg-amber-500 hover:text-black border border-amber-500 text-amber-400 font-bold uppercase text-xs font-mono tracking-widest rounded-xl transition-all cursor-pointer shadow-md select-none active:scale-95"
                >
                  开启预约
                </button>
              )}
            </div>
          </motion.div>
        )}

        {state.status === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 relative z-10 flex-1 flex flex-col justify-between"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-amber-900/30 bg-zinc-900/40 rounded-xl">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5 animate-pulse">
                  <Zap className="w-4 h-4 text-amber-400" /> 缓释放松计时中 (Relaxation Buffer Active)
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  无需面对学习阻力。尽情利用这最后一刻。倒计时归零时必须返回神圣座位！
                </p>
              </div>

              <div className="text-3xl font-black font-mono tracking-widest text-amber-500 glow-amber bg-black/80 border border-amber-900/60 px-4 py-1.5 text-center select-none w-36 shrink-0 md:self-auto self-center rounded-lg">
                {formatTime(state.timeLeft)}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  playTacticalAlarm(329.63, 0.35, 'sawtooth');
                  onCancelReservation();
                }}
                className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900 border border-red-500 text-red-400 text-[10px] font-bold uppercase font-mono tracking-widest rounded-lg transition-all cursor-pointer select-none"
              >
                中途违约退出 [ 判例审判 ]
              </button>
              <button
                onClick={() => {
                  playTacticalAlarm(659.25, 0.2, 'sine');
                  onConfirmSeat();
                }}
                className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase text-[10px] font-mono tracking-widest rounded-lg transition-all cursor-pointer select-none"
              >
                不等了・提前进入神圣座位
              </button>
            </div>
          </motion.div>
        )}

        {state.status === 'lockout' && (
          <motion.div
            key="lockout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/95 backdrop-blur-md text-white border-8 border-red-500 animate-[pulse_1.5s_infinite_ease-in-out]"
          >
            {/* Pulsing grid warning overlay */}
            <div className="absolute inset-0 bg-[#000]/70 select-none pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(239,68,68,0.25)_2px,transparent_2px)] bg-[size:100%_10px]" />

            <div className="max-w-xl bg-black border-4 border-red-500 p-8 space-y-6 text-center shadow-2xl relative z-10 rounded-2xl font-mono">
              <div className="flex justify-center">
                <AlertOctagon className="w-16 h-16 text-red-500 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-red-500 animate-pulse tracking-widest">
                  【 缓释结束・强制落座锁机 】
                </h1>
                <p className="text-sm font-bold text-red-400">
                  CRITICAL: {auxMinutes}分钟预备放松期完全结束。警报发生，必须进入神圣座位启动主链。
                </p>
              </div>

              <div className="text-5xl font-black font-mono tracking-wider text-white py-3 border border-red-950 bg-red-950/40 max-w-xs mx-auto rounded-lg">
                {state.graceTimeLeft} S
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-mono">
                如果在上面计时彻底消耗为 0 秒前您仍不能落座、点击落锁专注：<br />
                <strong>系统将等同于违背誓约，直接摧毁并清空当前的主链 and 总计时！</strong>
              </p>

              <div className="pt-4">
                <button
                  onClick={() => {
                    playTacticalAlarm(880, 0.4, 'sine');
                    onConfirmSeat();
                  }}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-sm tracking-widest rounded-xl border-2 border-emerald-300 animate-pulse transition-all cursor-pointer active:scale-95"
                >
                  【立刻落座 LOCK SACRED SEAT】
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {state.status === 'breached' && (
          <motion.div
            key="breached"
            className="p-4 border border-red-900 bg-red-950/20 text-center text-xs space-y-2 rounded-xl"
          >
            <div className="text-red-550 font-bold flex items-center justify-center gap-1.5 uppercase font-mono">
              <ShieldAlert className="w-4 h-4 text-red-500" /> 检测到最近一次预约链重大缺席违约
            </div>
            <p className="text-gray-400 font-mono text-[10px]">
              您在 {auxMinutes} 分钟缓冲后未完成守约入座，系统已强制冻结契约。请至控制中心处理此次违纪审判定罪。
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
