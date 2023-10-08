

export interface MergeIntimationReport {
    reportIds:                              number[];
    firstIncidenceDate:                     string;
    incidenceReportVillageCdAndNameDetails: { [key: string]: string };
    incidenceReportSymptomCdAndNameDetails: { [key: string]: string };
    incidenceReportOtherSymptomsDetails:    IncidenceReportOtherSymptomsDetail[];
    incidenceReportDiseaseCdAndNameDetails: { [key: string]: string };
    incidenceReportOtherDiseaseDetails:     IncidenceReportOtherDiseaseDetail[];
    speciesImpacted:                        SpeciesImpacted[];
    species:             string;
    noOfAnimalsAffected: number;
    noOfAnimalsDied:     number;
    speciesCd:           number;
    symptomCd:    number;
    symptomDesc:  string;
    diseaseCd:    number;
    diseaseDesc:  string;
    otherRemarks: string;
    reportedBy: string;
}

export interface IncidenceReportOtherDiseaseDetail {
    diseaseCd:    number;
    diseaseDesc:  string;
    otherRemarks: string;
}

export interface IncidenceReportOtherSymptomsDetail {
    symptomCd:    number;
    symptomDesc:  string;
    otherRemarks: string;
}

export interface SpeciesImpacted {
    species:             string;
    noOfAnimalsAffected: number;
    noOfAnimalsDied:     number;
    speciesCd:           number;
}
