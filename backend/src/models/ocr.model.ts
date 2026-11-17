import { BloomLevel } from './assessment.model';

export interface RubricAllocation {
  component: string;
  marksAllocated: number;
  examinerTip: string;
}

export interface UniversityRecurrence {
  university: string;
  year: string;
  occurrences: number;
}

export interface DetailedIndianSolution {
  // 7-Pillar Standard Structure
  definitionAndContext?: string;
  intuitiveAnalogy?: string;
  stepByStepDerivation?: string[];
  diagramAscii?: string;
  examinerRubric?: RubricAllocation[];
  commonTrapsAndMistakes?: string[];
  crossUniversityFrequency?: UniversityRecurrence[];
  // Alternative Structure fields
  keyFactors?: string[];
  mainPoints?: string[];
  highlightPoints?: string[];
  simpleExplanation?: string;
  mathematicalDerivation?: string;
  architectureDiagram?: string;
  examinerRubricCriteria?: Array<{
    criterion: string;
    marks: number;
    description: string;
  }>;
  commonPitfallsToAvoid?: string[];
  crossUniversityRecurrence?: string[];
  realWorldApplications?: string[];
}

export interface MinedPYQ {
  id: string;
  questionNumber?: string;
  subjectCode?: string;
  subjectName?: string;
  topic: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  format?: 'MCQ' | 'DESCRIPTIVE' | 'VIVA';
  questionText: string;
  question?: string;
  marks?: number;
  frequencyBadge?: string;
  targetCO?: string;
  bloomLevel?: BloomLevel;
  universityTags?: string[];
  yearAsked?: string;
  detailedSolution?: DetailedIndianSolution;
  detailedIndianSolution?: DetailedIndianSolution;
  // Section & Choice Hierarchy
  section?: string;
  sectionName?: string;
  sectionMarksFormula?: string;
  isOrChoice?: boolean;
  orChoiceGroup?: string;
  orPartLabel?: 'a' | 'b' | 'c' | string;
  hasOrAlternative?: boolean;
  orAlternativeId?: string;
  orAlternativeQuestionId?: string;
  orAlternativePartLabel?: string;
  paperReference?: string;
  serialNumber?: number;
  rawOcrConfidence?: number;
}

export interface ProcessedDocumentResult {
  documentId?: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  previewUrl?: string;
  rawTranscript?: string;
  confidence?: number;
  pageCount?: number;
  extractedQuestionsCount?: number;
  averageConfidence?: number;
  processingTimeMs?: number;
  minedQuestions?: MinedPYQ[];
  sectionFormulas?: string[] | Record<string, string>;
}

export interface ParsePaperResult {
  questions: MinedPYQ[];
  sectionFormulas: Record<string, string>;
  detectedQuestionsCount: number;
}
