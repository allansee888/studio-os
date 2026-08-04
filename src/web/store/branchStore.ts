import { create } from 'zustand';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  isMain?: boolean;
}

export const defaultBranches: Branch[] = [
  { id: 'br-hq', name: 'Main Studio (HQ)', code: 'HQ', address: '100 Studio Way, Suite A', isMain: true },
  { id: 'br-dt', name: 'Downtown Branch', code: 'DT', address: '450 Commercial St' },
  { id: 'br-ws', name: 'Westside Print Shop', code: 'WS', address: '880 Ocean Blvd' },
];

interface BranchState {
  branches: Branch[];
  currentBranch: Branch;
  setCurrentBranch: (branch: Branch) => void;
}

export const useBranchStore = create<BranchState>((set) => ({
  branches: defaultBranches,
  currentBranch: defaultBranches[0],
  setCurrentBranch: (branch) => set({ currentBranch: branch }),
}));
