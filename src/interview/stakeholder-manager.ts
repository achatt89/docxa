import { Stakeholder, StakeholderRole } from '../models/stakeholder-model.js';
import { WorkspaceStore } from '../storage/workspace-store.js';

export class StakeholderManager {
  private store: WorkspaceStore;

  constructor(store: WorkspaceStore) {
    this.store = store;
  }

  async addStakeholder(name: string, role: StakeholderRole, email?: string): Promise<Stakeholder> {
    const stakeholders = await this.store.loadStakeholders();
    const newStakeholder: Stakeholder = {
      id: crypto.randomUUID(),
      name,
      role,
      email,
      interviews: [],
    };

    stakeholders.push(newStakeholder);
    await this.store.saveStakeholders(stakeholders);
    return newStakeholder;
  }

  async getStakeholderByRole(role: StakeholderRole): Promise<Stakeholder | undefined> {
    const stakeholders = await this.store.loadStakeholders();
    return stakeholders.find((s) => s.role === role);
  }

  async listStakeholders(): Promise<Stakeholder[]> {
    return this.store.loadStakeholders();
  }
}
