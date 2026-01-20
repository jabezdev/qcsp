export interface Person {
  id: string;
  nickname: string;
  fullName: string;
  email: string;
  colorIndex: number;
}

export interface FunctionalCommittee {
  id: string;
  name: string;
  description?: string;
}

export interface ProgramTeam {
  id: string;
  name: string;
  description?: string;
  group?: string; // Umbrella grouping
  order?: number; // For sorting/drag-drop ordering
}

export interface Assignment {
  id: string;
  personId: string;
  committeeId: string;
  programId: string;
}

export const PERSON_COLORS = [
  'quantum-cyan',
  'quantum-purple',
  'quantum-blue',
  'quantum-teal',
  'quantum-pink',
  'quantum-orange',
  'quantum-green',
  'quantum-yellow',
] as const;

export type PersonColor = typeof PERSON_COLORS[number];
