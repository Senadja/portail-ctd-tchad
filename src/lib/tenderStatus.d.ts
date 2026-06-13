export interface TenderPhase {
  id?: string;
  label: string;
  start: string;
  end: string;
  color?: string;
  state?: "upcoming" | "current" | "done";
}

export interface TenderConfig {
  autoStatus: boolean;
  phases: TenderPhase[];
}

export interface EffectiveStatus {
  label: string;
  color: string;
  percentage?: number;
  phases: TenderPhase[];
  autoStatus: boolean;
  activePhase: (TenderPhase & { state: string }) | null;
}

export function parseTenderConfig(raw: any): TenderConfig;
export function serializeTenderConfig(autoStatus: boolean, phases: TenderPhase[]): string;
export function getActivePhase(phases: TenderPhase[], now?: Date): (TenderPhase & { state: string }) | null;
export function getEffectiveStatus(tender: any, globalStatuses: any[], now?: Date): EffectiveStatus;
