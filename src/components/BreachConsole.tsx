import React from 'react';
import { ShieldAlert, FileText, Scale } from 'lucide-react';
import { Precedent, BreachLog } from '../types';

interface BreachConsoleProps {
  precedents: Precedent[];
  logs: BreachLog[];
  onInvokePrecedent: (id: string) => void;
  onClearPrecedents: () => void;
  currentChainLength: number;
}

export const BreachConsole: React.FC<BreachConsoleProps> = ({
  precedents,
  logs,
  onInvokePrecedent,
  onClearPrecedents,
  currentChainLength,
}) => {
  // Calculate system health/integrity
  const integrityScore = Math.max(0, 100 - precedents.length * 15 - logs.filter(l => l.type === 'reservation_default').length * 5);
  
  return (
    <div className="space-y-6">
      {/* Integrity Index Header */}
      <div className="border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl">
        <div className="space-y-0.5">
          <div className="text-[10px] text-zinc-500 uppercase font-mono font-bold">// 规则可信度核电指示系统</div>
          <h4 className="text-sm font-extrabold uppercase tracking-widest text-[#ef4444] font-mono flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-500" /> 规则信誉等级考核 (System credibility)
          </h4>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto self-stretch">
          <div className="flex-1 md:w-36 bg-zinc-950/60 border border-zinc-800 p-2.5 text-center rounded-lg">
            <div className="text-[9px] text-zinc-400 font-mono font-bold uppercase">系统可信度</div>
            <div className={`text-base font-black font-mono mt-0.5 ${integrityScore > 75 ? 'text-emerald-400' : integrityScore > 40 ? 'text-amber-400' : 'text-red-500 animate-pulse'}`}>
              {integrityScore}%
            </div>
          </div>
          <div className="flex-1 md:w-36 bg-zinc-950/60 border border-zinc-800 p-2.5 text-center rounded-lg">
            <div className="text-[9px] text-zinc-400 font-mono font-bold uppercase">妥协判例数</div>
            <div className="text-base font-black font-mono text-amber-500 mt-0.5">
              {precedents.length} ACTIVE
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono">
        {/* Left Side: Precedent list with trigger invoke buttons */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="text-xs uppercase tracking-wider text-zinc-300 font-bold flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-500" /> 判例免责权快速裁决 (Grandfathered precedents)
            </h4>
            {precedents.length > 0 && (
              <button
                onClick={onClearPrecedents}
                className="text-[10px] text-zinc-400 hover:text-red-400 border border-zinc-850 hover:border-red-900 bg-red-950/20 px-2.5 py-1 transition-colors uppercase cursor-pointer rounded-lg"
                title="清除所有例外判例，强制净化系统到 100% 圣洁状态"
              >
                清退所有判例 [ 重归无瑕度 ]
              </button>
            )}
          </div>

          {precedents.length === 0 ? (
            <div className="border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500 rounded-xl">
              【无有效判例法规】<br />
              很好！目前无任何豁免例外。这说明您至今没有任何一次因妥协而刺穿规则体系的可耻行为。
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-[10px] text-amber-500/80 leading-relaxed bg-amber-950/10 border border-amber-900/30 p-3 rounded-xl">
                <span className="font-bold uppercase block mb-0.5">⚠️ 博弈陷阱提示：</span>
                下面的例外是您在历史中以“永久污染”为代价开设的逃避窗口。在下一次专注中，<strong>如果您确实遇到了一模一样的情况</strong>，您可以点击下方对应的判例诉诸免责权，避免断链，但请自省，过高的频次会导致您的规则完全瓦解。
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                {precedents.map((prec) => (
                  <div key={prec.id} className="border border-amber-950/60 bg-zinc-950/40 p-3 space-y-2 rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[9px] px-1.5 py-0.5 bg-amber-950 text-amber-400 font-bold border border-amber-800 rounded-lg">
                          【例外判例 #{prec.id.substring(0, 5)}】
                        </span>
                        <p className="text-xs font-bold text-zinc-200 uppercase tracking-tight mt-1">
                          {prec.reason}
                        </p>
                      </div>
                      <div className="text-[10px] text-zinc-500 text-right">
                        <span>签署于: {prec.timestamp.split('T')[0]}</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-amber-900/20 flex items-center justify-between gap-4 text-[10px]">
                      <span className="text-amber-400">
                        利用累积: {prec.invocations} 次豁免
                      </span>
                      <button
                        onClick={() => onInvokePrecedent(prec.id)}
                        disabled={currentChainLength === 0}
                        className="px-3 py-1 bg-amber-650 hover:bg-amber-500 text-black font-bold uppercase transition-all text-[9.5px] cursor-pointer disabled:opacity-20 disabled:pointer-events-none rounded-lg"
                        title="在当前计时器违约决策中，依据该判例免除断链清零惩罚"
                      >
                        依法豁免当前危机
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Breach activity ledger log */}
        <div className="lg:col-span-5 space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-gray-300 font-bold border-b border-zinc-800 pb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-red-500" /> 历史违约追责审计 (Internal Audit ledger)
          </h4>

          {logs.length === 0 ? (
            <div className="border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500 rounded-xl">
              【清白在案 // Clear record】<br />
              至今并无 any 违纪/清零记录。完美的自控执勤表现！
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar pr-1">
              {logs.map((log) => {
                let badgeStyle = 'border-red-900 text-red-405 bg-red-950/20';
                if (log.type === 'precedent_created') badgeStyle = 'border-amber-900 text-amber-500 bg-amber-955/20';
                if (log.type === 'precedent_invoked') badgeStyle = 'border-blue-900 text-blue-400 bg-blue-955/20';

                return (
                  <div key={log.id} className="border border-zinc-800 bg-zinc-950/40 p-3 text-[11px] leading-relaxed space-y-1 rounded-xl">
                    <div className="flex items-center justify-between text-[9px] text-zinc-500">
                      <span>{log.timestamp}</span>
                      <span className={`text-[8px] uppercase font-bold px-1 border rounded-lg ${badgeStyle}`}>
                        {log.type === 'wipeout' ? '断链清零' : log.type === 'precedent_created' ? '签注判例' : log.type === 'precedent_invoked' ? '援引例外' : '预约违约'}
                      </span>
                    </div>
                    <p className="text-zinc-300 font-semibold">{log.description}</p>
                    {log.formerChainLength > 0 && (
                      <p className="text-[10px] text-red-400 font-bold">
                        ⚠️ 瞬间灰飞烟灭的代价：损失了 {log.formerChainLength} 个连续专注节点！
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
