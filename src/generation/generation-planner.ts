import { InterviewSession } from '../interview/interview-schema.js';

export type EvidenceSource =
    | "document"
    | "interview"
    | "repository_analysis"
    | "manual_context";

export interface EvidenceRequirement {
    key: string;
    description: string;
    required: boolean;
    satisfiesWith: Array<{
        sourceType: EvidenceSource;
        sourceId: string; // The specific documentId or roleId or analysisKey
    }>;
}

export type ReadinessStatus = 'ready' | 'partial_ready' | 'blocked';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface ReadinessReport {
    documentId: string;
    status: ReadinessStatus;
    hardDependenciesSatisfied: boolean;
    missingRequiredEvidence: string[];
    missingOptionalEvidence: string[];
    availableInputs: string[];
    alternativeEvidenceUsed: string[];
    confidence: ConfidenceLevel;
    warnings: string[];
    suggestions: string[];
}

export type GenerationMode = 'strict' | 'flexible' | 'assisted';

export class GenerationPlanner {
    private readonly evidenceMap: Record<string, EvidenceRequirement[]> = {
        BRD: [
            {
                key: 'business_context',
                description: 'Core business objectives and vision',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'BRD' },
                    { sourceType: 'interview', sourceId: 'business_stakeholder' }
                ]
            }
        ],
        PRD: [
            {
                key: 'business_context',
                description: 'Business vision and objectives from BRD',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'BRD' },
                    { sourceType: 'interview', sourceId: 'business_stakeholder' }
                ]
            },
            {
                key: 'product_context',
                description: 'Product features, user personas, and journeys',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'PRD' },
                    { sourceType: 'interview', sourceId: 'product_manager' }
                ]
            }
        ],
        FRD: [
            {
                key: 'product_context',
                description: 'Features and requirements from PRD',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'PRD' },
                    { sourceType: 'interview', sourceId: 'product_manager' }
                ]
            },
            {
                key: 'functional_context',
                description: 'Detailed functional specifications',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'FRD' },
                    { sourceType: 'repository_analysis', sourceId: 'frameworks' }
                ]
            }
        ],
        TRD: [
            {
                key: 'functional_context',
                description: 'Functional requirements to be technicalized',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'FRD' },
                    { sourceType: 'document', sourceId: 'PRD' }
                ]
            },
            {
                key: 'technical_context',
                description: 'Technical constraints and stack choices',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'TRD' },
                    { sourceType: 'interview', sourceId: 'solution_architect' },
                    { sourceType: 'repository_analysis', sourceId: 'frameworks' }
                ]
            }
        ],
        NFR: [
            {
                key: 'technical_context',
                description: 'Overall technical landscape',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'TRD' },
                    { sourceType: 'interview', sourceId: 'solution_architect' }
                ]
            },
            {
                key: 'quality_attribute_context',
                description: 'Performance, security, and availability goals',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'NFR' },
                    { sourceType: 'interview', sourceId: 'devops_engineer' },
                    { sourceType: 'interview', sourceId: 'solution_architect' }
                ]
            }
        ],
        HLD: [
            {
                key: 'technical_context',
                description: 'Technical requirements and constraints',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'TRD' },
                    { sourceType: 'interview', sourceId: 'solution_architect' }
                ]
            },
            {
                key: 'architecture_context',
                description: 'High level system structure',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'HLD' },
                    { sourceType: 'interview', sourceId: 'solution_architect' },
                    { sourceType: 'repository_analysis', sourceId: 'architecture' }
                ]
            },
            {
                key: 'quality_attribute_context',
                description: 'Operational characteristics',
                required: false,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'NFR' },
                    { sourceType: 'interview', sourceId: 'devops_engineer' }
                ]
            }
        ],
        LLD: [
            {
                key: 'architecture_context',
                description: 'High level design to detail out',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'HLD' },
                    { sourceType: 'interview', sourceId: 'solution_architect' }
                ]
            },
            {
                key: 'implementation_context',
                description: 'Detailed code and schema design',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'LLD' },
                    { sourceType: 'interview', sourceId: 'engineering_lead' }
                ]
            }
        ],
        ADR: [
            {
                key: 'architecture_context',
                description: 'System context for the decision',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'HLD' },
                    { sourceType: 'document', sourceId: 'TRD' }
                ]
            },
            {
                key: 'decision_context',
                description: 'Rationale and trade-offs of the decision',
                required: true,
                satisfiesWith: [
                    { sourceType: 'document', sourceId: 'ADR' },
                    { sourceType: 'interview', sourceId: 'solution_architect' }
                ]
            }
        ]
    };

    plan(
        documentId: string,
        existingDocs: string[],
        sessions: InterviewSession[],
        mode: GenerationMode = 'flexible',
        analysisAvailable: string[] = []
    ): ReadinessReport {
        const requirements = this.evidenceMap[documentId] || [];
        const missingRequired: string[] = [];
        const missingOptional: string[] = [];
        const availableInputs: string[] = [...existingDocs];
        const alternativeEvidenceUsed: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        let hardSatisfied = true;

        for (const req of requirements) {
            let satisfied = false;
            let usedAlternative = false;

            for (const option of req.satisfiesWith) {
                if (option.sourceType === 'document' && existingDocs.includes(option.sourceId)) {
                    satisfied = true;
                } else if (option.sourceType === 'interview' && sessions.some(s => s.roleId === option.sourceId && s.status === 'completed')) {
                    satisfied = true;
                    usedAlternative = true;
                    alternativeEvidenceUsed.push(`${req.key} (Interview: ${option.sourceId})`);
                } else if (option.sourceType === 'repository_analysis' && analysisAvailable.includes(option.sourceId)) {
                    satisfied = true;
                    usedAlternative = true;
                    alternativeEvidenceUsed.push(`${req.key} (Repo Analysis: ${option.sourceId})`);
                }
            }

            if (!satisfied) {
                if (req.required) {
                    hardSatisfied = false;
                    missingRequired.push(req.key);
                    this.addSuggestions(suggestions, req, documentId);
                } else {
                    missingOptional.push(req.key);
                }
            }
        }

        // Determine status
        let status: ReadinessStatus = 'ready';
        if (!hardSatisfied) {
            status = mode === 'strict' ? 'blocked' : 'partial_ready';
            if (mode === 'flexible') {
                warnings.push(`Generating with missing required evidence: ${missingRequired.join(', ')}`);
            }
        } else if (missingOptional.length > 0) {
            status = 'partial_ready';
            warnings.push(`Recommended context missing: ${missingOptional.join(', ')}`);
        }

        // Confidence calculation
        let confidence: ConfidenceLevel = 'high';
        if (!hardSatisfied) {
            confidence = 'low';
        } else if (missingOptional.length > 0 || alternativeEvidenceUsed.length > 0) {
            confidence = 'medium';
        }

        return {
            documentId,
            status,
            hardDependenciesSatisfied: hardSatisfied,
            missingRequiredEvidence: missingRequired,
            missingOptionalEvidence: missingOptional,
            availableInputs,
            alternativeEvidenceUsed,
            confidence,
            warnings,
            suggestions
        };
    }

    private addSuggestions(suggestions: string[], requirement: EvidenceRequirement, documentId: string) {
        for (const option of requirement.satisfiesWith) {
            if (option.sourceType === 'interview') {
                suggestions.push(`Start ${documentId} interview with role ${option.sourceId} to satisfy ${requirement.key}`);
            } else if (option.sourceType === 'repository_analysis') {
                suggestions.push(`Run repository discovery for existing project to satisfy ${requirement.key}`);
            } else if (option.sourceType === 'document') {
                suggestions.push(`Generate ${option.sourceId} first to satisfy ${requirement.key}`);
            }
        }
    }
}
