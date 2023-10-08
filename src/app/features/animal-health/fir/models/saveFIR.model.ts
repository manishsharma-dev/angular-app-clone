

export interface SaveFIR {
    diseaseSuspected:            string;
    vaccinationDone:             string;
    publicHealthDisease:         string;
    firstIncidenceDate:          string;
    reportedBy:                  string;
    symptomDetail:               SymptomDetail[];
    sourceOfInfectionCd:         null;
    actionTakenList:             ActionTakenList[];
    diseaseDetail:               DiseaseDetail[];
    speciesImpacted:             any[];
    sample_for_lab_testing_flag: string;
    sample_for_lab_testing:      null;
    final_report:                string;
    firstIncidenceReportingDate: string;
    reportIds:                   number[];
    villageCds:                  string[];
    firDetails:                  FirDetails;
}

export interface ActionTakenList {
    actionTakenCd: number;
}

export interface DiseaseDetail {
    diseaseCd:    string;
    otherDisease: string;
    remarks:      string;
}

export interface FirDetails {
    diseaseSuspected:            string;
    firStatus:                   number;
    firstIncidenceDate:          string;
    firstIncidenceReportingDate: string;
    publicHealthDisease:         string;
    remarks:                     string;
    reportedBy:                  string;
    sourceOfInfectionCd:         null;
    vaccinationDone:             string;
    animalImageUrl1:             string;
}

export interface SymptomDetail {
    symptomCd:    string;
    otherSymptom: string;
    remarks:      string;
}
