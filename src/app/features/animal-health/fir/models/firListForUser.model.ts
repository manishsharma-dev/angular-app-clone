

export interface FirListForUser {
    flg:  boolean;
    data: Datum[];
    msg:  null;
}

export interface Datum {
    firId:                          number;
    firstIncidenceDate:             string;
    status:                         string;
    intimationReportVillageDetails: IntimationReportVillageDetail[];
    intimationReportSymptomDetails: IntimationReportSymptomDetail[];
    intimationReportDiseaseDetails: IntimationReportDiseaseDetail[];
}

export interface IntimationReportDiseaseDetail {
    diseaseCd:   number;
    diseaseDesc: string;
}

export interface IntimationReportSymptomDetail {
    symptomCd:   number;
    symptomDesc: string;
}

export interface IntimationReportVillageDetail {
    villageCd:   number;
    villageName: string;
}
