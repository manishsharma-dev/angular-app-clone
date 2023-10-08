export interface IntimationListRes {
  intimationId: number;
  firstIntimationDate: string;
  intimationReportVillageDetails: IntimationReportVillageDetail[];
  intimationReportSymptomDetails: IntimationReportSymptomDetail[];
  intimationReportDiseaseDetails: IntimationReportDiseaseDetail[];
  firId: number;
}

export interface IntimationReportDiseaseDetail {
  diseaseCd: number;
  diseaseDesc: string;
}

export interface IntimationReportSymptomDetail {
  symptomCd: number;
  symptomDesc: string;
}

export interface IntimationReportVillageDetail {
  villageCd: number;
  villageName: string;
}
