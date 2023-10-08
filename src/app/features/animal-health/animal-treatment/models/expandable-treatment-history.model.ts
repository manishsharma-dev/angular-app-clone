import { OpenTreatmentCasesResponse } from './open-treatment-response.model';

export interface ExpandableTreatmentHistory {
  cases: OpenTreatmentCasesResponse[];
  expanded: boolean;
}
