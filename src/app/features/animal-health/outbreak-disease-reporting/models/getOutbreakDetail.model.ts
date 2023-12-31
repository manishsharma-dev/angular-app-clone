

export interface OutBreakDetails {
    outbreakDetail:      OutbreakDetail;
    areaMappingDetails:  AreaMappingDetail[];
    actionTakenDetails:  ActionTakenDetail[];
    speciesImpactedList: SpeciesImpactedList[];
    runSeqNo:        number;
    sourceOriginId: number;
    interimReportNo:  number;
    sourceOriginCd:   number;
    speciesCd:   number;
    noOfAnimals:   number;
    noOfAnimalsDied:   number;
    formCd:   number;
    routeCd:   number;
    dosage:   number;
    unitCd:   number;
    originId:        number;
    actionTakenCd:   number;
    districtCd:   number;
    districtName: string;
    tehsilCd:     number;
    tehsilName:   string;
    villageCd:    number;
    villageName:  string;
}

export interface SpeciesImpactedList {
    runSeqNo:        number;
    sourceOriginId: number;
    interimReportNo:  number;
    sourceOriginCd:   number;
    speciesCd:   number;
    noOfAnimals:   number;
    noOfAnimalsDied:   number;
    formCd:   number;
    routeCd:   number;
    dosage:   number;
    unitCd:   number;
    
}

export interface ActionTakenDetail {// Generated by https://quicktype.io

    originId:        number;
    interimReportNo: number;
    sourceOriginCd:  number;
    actionTakenCd:   number;
}

export interface AreaMappingDetail {
    districtCd:   number;
    districtName: string;
    tehsilCd:     number;
    tehsilName:   string;
    villageCd:    number;
    villageName:  string;
}

export interface OutbreakDetail {
    outbreakId:                  number;
    interimReportNo:             number;
    firstIncidenceDate:          string;
    firstIncidenceReportingDate: string;
    diseaseConfirmed:            string;
    finalReport:                 string;
    interimReportDate:           string;
    severityOfOutbreak:          number;
    sourceOfInfectionCd:         number;
    totalNoOfAnimalsAffected:    number;
    reportedBy:                  string;
}
