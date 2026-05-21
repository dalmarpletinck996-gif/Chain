/**
 * SacredSeat (神圣座位) - CTDP Type Declarations
 */

export type UnitType = 'assault' | 'recon' | 'engineer' | 'command' | 'logistics';

export interface SubGoal {
  id: string;
  name: string;
  estimatedTime: number; // in minutes
  incurredTime: number; // in minutes
  icon: string; // lucide icon name (e.g., 'Target', 'Swords', 'Shield', 'Cpu', 'BookOpen', 'Award', 'Flame', 'Zap')
  color: string; // color code or tailwind keyword ('red', 'amber', 'emerald', 'sky', 'purple')
}

export interface Legion {
  id: string;
  name: string;
  subGoals: SubGoal[];
}

export interface FocusNode {
  id: string;
  index: number;
  duration: number; // in minutes (e.g., 45, 60)
  completedAt: string;
  unitType: UnitType;
  taskName: string;
  isPrecedentLegalized?: boolean; // If this node was saved/altered due to a precedent
  selectedGoalId?: string; // Reference to sub-goal ID if completed for one
}

export interface Precedent {
  id: string;
  timestamp: string;
  reason: string; // The situation being grandfathered in
  compromiseExplanation: string; // The philosophical self-deception disclaimer the user agreed to
  invocations: number;
}

export interface BreachLog {
  id: string;
  timestamp: string;
  type: 'wipeout' | 'precedent_created' | 'precedent_invoked' | 'reservation_default';
  description: string;
  formerChainLength: number;
}

export interface AuxiliaryState {
  status: 'idle' | 'countdown' | 'lockout' | 'breached';
  timeLeft: number; // in seconds, starting from 900 (15 minutes)
  graceTimeLeft: number; // in seconds, starting from 60 (grace period to sit down)
}
