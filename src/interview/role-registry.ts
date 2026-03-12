export interface RoleDefinition {
  roleId: string;
  displayName: string;
  responsibilityAreas: string[];
  documents: string[];
  questioningStyle: string;
}

export const ROLES: Record<string, RoleDefinition> = {
  business_stakeholder: {
    roleId: 'business_stakeholder',
    displayName: 'Business Stakeholder',
    responsibilityAreas: ['Business Objectives', 'Success Criteria', 'Market Context'],
    documents: ['BRD'],
    questioningStyle: 'Strategic and value-oriented',
  },
  product_manager: {
    roleId: 'product_manager',
    displayName: 'Product Manager',
    responsibilityAreas: ['Product Vision', 'User Personas', 'Feature Prioritization'],
    documents: ['BRD', 'PRD', 'FRD'],
    questioningStyle: 'User-centric and outcome-focused',
  },
  solution_architect: {
    roleId: 'solution_architect',
    displayName: 'Solution Architect',
    responsibilityAreas: ['System Architecture', 'Integration Patterns', 'Technology Choices'],
    documents: ['TRD', 'HLD', 'ADR', 'NFR'],
    questioningStyle: 'Structural and trade-off oriented',
  },
  engineering_lead: {
    roleId: 'engineering_lead',
    displayName: 'Engineering Lead',
    responsibilityAreas: ['Detailed Design', 'Implementation Strategy', 'Development Standards'],
    documents: ['LLD', 'TRD'],
    questioningStyle: 'Practical and execution-focused',
  },
  software_engineer: {
    roleId: 'software_engineer',
    displayName: 'Software Engineer',
    responsibilityAreas: ['Code Implementation', 'Unit Testing', 'Module Design'],
    documents: ['LLD'],
    questioningStyle: 'Technical and detail-oriented',
  },
  qa_lead: {
    roleId: 'qa_lead',
    displayName: 'QA Lead',
    responsibilityAreas: ['Testing Strategy', 'Quality Attributes', 'Acceptance Criteria'],
    documents: ['NFR'],
    questioningStyle: 'Verification and constraint-focused',
  },
  devops_engineer: {
    roleId: 'devops_engineer',
    displayName: 'DevOps Engineer',
    responsibilityAreas: ['Deployment Topology', 'CI/CD Pipeline', 'Infrastructure'],
    documents: ['HLD', 'NFR'],
    questioningStyle: 'Operational and automation-focused',
  },
  security_engineer: {
    roleId: 'security_engineer',
    displayName: 'Security Engineer',
    responsibilityAreas: ['Security Model', 'Compliance', 'Data Protection'],
    documents: ['HLD', 'NFR'],
    questioningStyle: 'Risk and compliance-focused',
  },
  delivery_manager: {
    roleId: 'delivery_manager',
    displayName: 'Delivery Manager',
    responsibilityAreas: ['Project Timeline', 'Resource Planning', 'Risk Management'],
    documents: ['BRD'],
    questioningStyle: 'Timeline and milestone-focused',
  },
};

export class RoleRegistry {
  getRole(roleId: string): RoleDefinition | undefined {
    return ROLES[roleId];
  }

  listRoles(): RoleDefinition[] {
    return Object.values(ROLES);
  }

  getRolesForDocument(documentId: string): RoleDefinition[] {
    return this.listRoles().filter((r) => r.documents.includes(documentId.toUpperCase()));
  }
}
