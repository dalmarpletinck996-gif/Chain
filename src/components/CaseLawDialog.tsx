import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Trash2, Scale, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Precedent } from '../types';

interface CaseLawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChooseA_Wipeout: () => void;
  onChooseB_Precedent: (reason: string) => void;
  activePrecedents: Precedent[];
  currentChainLength: number;
}

export const CaseLawDialog: React.FC<CaseLawDialogProps> = ({
  isOpen,
  onClose,
  onChooseA_Wipeout,
  onChooseB_Precedent,
  activePrecedents,
  currentChainLength
}) => {
  const [reason, setReason] = useState('');
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [showPrecedentForm, setShowPrecedentForm] = useState(false);

  if (!isOpen) return null;

  const handlePrecedentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || !pledgeChecked) return;
    onChooseB_Precedent(reason.trim());
    setReason('');
    setPledgeChecked(false);
    setShowPrecedentForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      {/* Alarm Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(239,68,68,0.08)_1px,transparent_1px)] bg-[size:100%_4px] opacity-70 animate-pulse" />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden relative rounded"
      >
        {/* Warning Badge Header */}
        <div className="bg-red-950/30 border-b border-zinc-700 p-4 flex items-center gap-3">
          <ShieldAlert className="text-red-500 animate-pulse w-7 h-7 shrink-0" />
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider text-red-500 font-mono">
              [ 判例法博弈审判 / GENERAL COURT MARTIAL ]
            </h2>
            <p className="text-xs text-red-400 font-mono">
              警告：专注过程即将中断或发生严重违约。检测到 {currentChainLength} 个沉没成本节点。
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Theoretical context display */}
          <div className="bg-red-950/10 border border-red-900/30 p-4 space-y-2 text-xs text-zinc-400 leading-relaxed rounded">
            <div className="text-red-400 font-bold flex items-center gap-2 uppercase">
              <AlertTriangle className="w-4 h-4" /> 行为经济学博弈说明 (CTDP Core Philosophy)
            </div>
            <p>
              你在面临自控力模型最核心的「双曲贴现」挑战。允许本次“特殊借口”虽然在眼前能避免损失，但会在你心智层面上确立首例「破窗判例」。系统信誉、戒律防御网一旦渗漏，随后便会发生「雪崩式崩解」。请在这项冷酷的契约前做出绝对理性的权衡抉择：
            </p>
          </div>

          {!showPrecedentForm ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A Card */}
              <div className="border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between hover:border-red-500/50 transition-colors group rounded">
                <div className="space-y-3">
                  <div className="text-red-500 font-bold tracking-wider flex items-center gap-2">
                    <Trash2 className="w-5 h-5 shrink-0" />
                    <span>选项 A：承认证伪・断链清零</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    承认个人在本阶段意志崩解。接受严苛的契约惩罚，彻底粉碎并<strong>清空当前积累的所有 ##1 到 ##{currentChainLength || 'N'} 个历史专注节点 </strong>。
                    下次必须老老实实回到 ##1，承受高昂的零起步重建成本。
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    onClick={onChooseA_Wipeout}
                    className="w-full py-2 bg-red-950 hover:bg-red-650 hover:text-white border border-red-500 text-red-400 font-bold uppercase text-xs font-mono tracking-widest transition-all cursor-pointer shadow-md active:scale-95 rounded"
                  >
                    接受清零・彻底伏法
                  </button>
                </div>
              </div>

              {/* Option B Card */}
              <div className="border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between hover:border-amber-500/50 transition-colors group rounded">
                <div className="space-y-3">
                  <div className="text-amber-500 font-bold tracking-wider flex items-center gap-2">
                    <Scale className="w-5 h-5 shrink-0" />
                    <span>选项 B：确立判例・永久赦免</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed font-mono">
                    判定当前分心/放弃行为合法。本次专注不断链、不扣分。
                    <span className="text-amber-400 font-semibold">代价极度致命：</span>从今以后，该规则将被刺穿，在整条链的生命周期中，只要遇到一模一样的情况，你均有权无条件免责、照此判例行事，使系统永久丧失绝对约束力。
                  </p>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => setShowPrecedentForm(true)}
                    className="w-full py-2 bg-amber-950 hover:bg-amber-600 hover:text-black border border-amber-500 text-amber-400 font-bold uppercase text-xs font-mono tracking-widest transition-all cursor-pointer shadow-md active:scale-95 rounded"
                  >
                    宣告合法・保留节点
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-amber-600/30 bg-zinc-950/40 p-5 space-y-4 rounded"
              onSubmit={handlePrecedentSubmit}
            >
              <div className="flex items-center gap-2 text-amber-500 text-sm font-bold uppercase tracking-wider font-mono">
                <Scale className="w-4 h-4" /> 宣誓登记新判例免责权
              </div>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                确立「先例合法权 (Grandfathered Precedent)」。为了让本条免责契约永久固化，您必须详实且严谨地描述当前分心脱逃的所谓“合理客观原因”。未来您一旦做出类似事由分心，系统将无权追责。
              </p>

              <div>
                <label className="block text-xs uppercase text-amber-500 mb-1 font-bold font-mono">
                  本次分心事由 / Exceptional Reason:
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如: '去洗手间 (紧急生理需求)', '接听紧急工作来电 (涉及财务安全)'"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-705 text-zinc-250 text-xs px-3 py-2 rounded focus:outline-none focus:border-amber-400 font-mono text-zinc-200 border-zinc-700"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pledge"
                  checked={pledgeChecked}
                  onChange={(e) => setPledgeChecked(e.target.checked)}
                  className="mt-1 accent-amber-500"
                />
                <label htmlFor="pledge" className="text-xs text-zinc-300 leading-normal select-none font-mono">
                  我已详读《契约博弈法》：我明确知晓，<strong>一经签署此条款，契约漏洞已在规则中凿开</strong>。我将永远无法假装该漏洞不存在，这是不可撤销的自主抉择。
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrecedentForm(false)}
                  className="flex-1 py-1.5 border border-zinc-700 text-amber-500 hover:bg-zinc-800 text-xs tracking-wider uppercase font-mono transition-all rounded"
                >
                  <span className="flex items-center justify-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> 返回审判选项
                  </span>
                </button>
                <button
                  type="submit"
                  disabled={!reason.trim() || !pledgeChecked}
                  className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs tracking-wider uppercase font-mono transition-all disabled:opacity-30 disabled:pointer-events-none rounded"
                >
                  确认宣誓・签注判例
                </button>
              </div>
            </motion.form>
          )}

          {/* Precedent Database List in current Chain */}
          {activePrecedents.length > 0 && (
            <div className="border border-zinc-800 bg-zinc-950/60 p-4 rounded text-xs space-y-2">
              <div className="text-zinc-450 font-bold uppercase tracking-wider font-mono flex items-center justify-between text-zinc-400">
                <span>目前已刺开的判例漏洞数据库</span>
                <span className="text-red-500 text-[10px] uppercase font-bold px-1 border border-zinc-800 bg-red-950/20 rounded">
                  规则系统完整度: {Math.max(0, 100 - activePrecedents.length * 15)}%
                </span>
              </div>
              <div className="divide-y divide-zinc-800 max-h-36 overflow-y-auto custom-scrollbar">
                {activePrecedents.map((prec) => (
                  <div key={prec.id} className="py-2 flex items-center justify-between font-mono">
                    <div className="pr-4">
                      <p className="text-amber-400 text-xs font-semibold">【判例 #{prec.id.substring(0, 5)}】{prec.reason}</p>
                      <p className="text-[10px] text-zinc-500">{prec.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] px-2 py-0.5 bg-amber-950 border border-amber-900 text-amber-400 rounded-full font-bold">
                        累计违约免责: {prec.invocations} 次
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Option C: Return to seat */}
        <div className="bg-zinc-950/80 border-t border-zinc-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold uppercase text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 rounded"
          >
            <ArrowLeft className="w-4 h-4" /> 挣脱软弱・回到神圣座位
          </button>
        </div>
      </motion.div>
    </div>
  );
};
