import { create } from 'zustand';
import { Person, FunctionalCommittee, ProgramTeam, Assignment } from '@/types/volunteer';
import { API_URL } from '@/lib/api';

interface VolunteerState {
  people: Person[];
  committees: FunctionalCommittee[];
  programs: ProgramTeam[];
  assignments: Assignment[];
  selectedPersonId: string | null;
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;
  
  // Data persistence
  fetchData: () => Promise<void>;
  saveData: () => Promise<void>;
  
  // Auth
  setIsAdmin: (isAdmin: boolean) => void;

  // People actions
  addPerson: (person: Omit<Person, 'id'>) => void;
  updatePerson: (id: string, person: Partial<Person>) => void;
  deletePerson: (id: string) => void;
  
  // Committee actions
  addCommittee: (committee: Omit<FunctionalCommittee, 'id'>) => void;
  updateCommittee: (id: string, committee: Partial<FunctionalCommittee>) => void;
  deleteCommittee: (id: string) => void;
  setCommittees: (committees: FunctionalCommittee[]) => void;
  
  // Program actions
  addProgram: (program: Omit<ProgramTeam, 'id'>) => void;
  updateProgram: (id: string, program: Partial<ProgramTeam>) => void;
  deleteProgram: (id: string) => void;
  setPrograms: (programs: ProgramTeam[]) => void;
  
  // Assignment actions
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  removeAssignment: (assignmentId: string) => void;
  
  // Selection
  setSelectedPerson: (personId: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

let saveTimeout: any;

const triggerSave = (get: () => VolunteerState) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    get().saveData();
  }, 1000);
};

export const useVolunteerStore = create<VolunteerState>((set, get) => ({
  people: [],
  committees: [],
  programs: [],
  assignments: [],
  selectedPersonId: null,
  isLoading: false,
  error: null,
  isAdmin: false,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      set({
        people: data.people || [],
        committees: data.committees || [],
        programs: data.programs || [],
        assignments: data.assignments || [],
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  saveData: async () => {
    const { people, committees, programs, assignments } = get();
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ people, committees, programs, assignments }),
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  setIsAdmin: (isAdmin) => set({ isAdmin }),

  addPerson: (person) => {
    // Allows passing colorIndex in person object, defaults to sequential if not present (handling in component now)
    const colorIndex = person.colorIndex !== undefined ? person.colorIndex : (get().people.length % 8);
    set((state) => ({
      people: [...state.people, { ...person, id: generateId(), colorIndex }],
    }));
    triggerSave(get);
  },

  updatePerson: (id, person) => {
    set((state) => ({
      people: state.people.map((p) =>
        p.id === id ? { ...p, ...person } : p
      ),
    }));
    triggerSave(get);
  },

  deletePerson: (id) => {
    set((state) => ({
      people: state.people.filter((p) => p.id !== id),
      assignments: state.assignments.filter((a) => a.personId !== id),
    }));
    triggerSave(get);
  },

  addCommittee: (committee) => {
    set((state) => ({
      committees: [...state.committees, { ...committee, id: generateId() }],
    }));
    triggerSave(get);
  },

  updateCommittee: (id, committee) => {
    set((state) => ({
      committees: state.committees.map((c) =>
        c.id === id ? { ...c, ...committee } : c
      ),
    }));
    triggerSave(get);
  },

  deleteCommittee: (id) => {
    set((state) => ({
      committees: state.committees.filter((c) => c.id !== id),
      assignments: state.assignments.filter((a) => a.committeeId !== id),
    }));
    triggerSave(get);
  },

  setCommittees: (committees) => {
      set({ committees });
      triggerSave(get);
  },

  addProgram: (program) => {
    set((state) => ({
      programs: [...state.programs, { ...program, id: generateId() }],
    }));
    triggerSave(get);
  },

  updateProgram: (id, program) => {
    set((state) => ({
      programs: state.programs.map((p) =>
        p.id === id ? { ...p, ...program } : p
      ),
    }));
    triggerSave(get);
  },

  deleteProgram: (id) => {
    set((state) => ({
      programs: state.programs.filter((p) => p.id !== id),
      assignments: state.assignments.filter((a) => a.programId !== id),
    }));
    triggerSave(get);
  },

  setPrograms: (programs) => {
      set({ programs });
      triggerSave(get);
  },

  addAssignment: (assignment) => {
    const exists = get().assignments.some(
      (a) =>
        a.personId === assignment.personId &&
        a.committeeId === assignment.committeeId &&
        a.programId === assignment.programId
    );
    if (!exists) {
      set((state) => ({
        assignments: [...state.assignments, { ...assignment, id: generateId() }],
      }));
      triggerSave(get);
    }
  },

  removeAssignment: (assignmentId) => {
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== assignmentId),
    }));
    triggerSave(get);
  },

  setSelectedPerson: (personId) => {
    set({ selectedPersonId: personId });
  },
}));
