
export enum ComplianceStatus {
  MET = 'Met',
  PARTIALLY_MET = 'Partially Met',
  NOT_MET = 'Not Met',
  NA = 'N/A'
}

export interface ChecklistItem {
  id: string;
  label: string;
}

export interface SectionData {
  items: Record<string, ComplianceStatus>;
  finding: string;
}

export interface TracerRound {
  id: string;
  year: number;
  month: string;
  date: string;
  sourceOfData: string;
  depType: string;
  department: string;
  rnLevel: string;
  principalDiagnosis: string;
  comorbidity: string;
  specialty: string;
  patientAge: number;
  
  sections: {
    nursingAssessment: SectionData;
    reAssessment: SectionData;
    nursingDiagnosis: SectionData;
    planning: SectionData;
    implementation: SectionData;
    nursingEvaluation: SectionData;
    medicalRecordCompleteness: SectionData;
  };

  developmentIssues: string;
  appreciations: string;
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
