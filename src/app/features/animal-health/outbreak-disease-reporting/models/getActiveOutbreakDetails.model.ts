

export interface GetActiveOutBreakList {
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
    areaMappingDetailsDtos:      AreaMappingDetailsDto[];
    sampleDetails:               SampleDetails;
}

export interface AreaMappingDetailsDto {
    districtCd:   number;
    districtName: DistrictName;
    tehsilCd:     number;
    tehsilName:   string;
    villageCd:    number;
    villageName:  string;
}

export enum DistrictName {
    BanasKantha = "BANAS KANTHA",
    Budgam = "Budgam",
}

export interface SampleDetails {
    samplingStatus:     number;
    samplingStatusDesc: string;
    onSpotDetails:      null;
    labTestingDetails:  null;
}
