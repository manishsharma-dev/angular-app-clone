

export interface ViewActionForm {
    actionTakenCd:   number;
    actionTakenDesc: string;
    imgFlag:                   boolean;
    firDetailsResponseDto:     FirDetailsResponseDto;
    areaMappingDetails:        AreaMappingDetail[];
    firAreaMappingDetailsDesc: FirAreaMappingDetailsDesc[];
    firSymptomDetailsDesc:     FirSymptomDetailsDesc[];
    firDiseaseDetailsDesc:     FirDiseaseDetailsDesc[];
    firSpeciesImpacted:        FirSpeciesImpacted[];
    actionTaken:               ActionTaken[];
    sampleDetails:             SampleDetails;
    districtCd:   number;
    districtName: string;
    tehsilCd:     number;
    tehsilName:   string;
    villageCd:    number;
    villageName:  string;
    sampleExaminationDetails: SampleExaminationDetail[];
    sampleId:                       string;
    runSeqNo:                       number;
    animalId:                       number;
    tagId:                          any;
    ownerId:                        number;
    courierId:                      null;
    diseaseCd:                      null;
    finalSampleResultValue:         null;
    followUpNo:                     number;
    initialSampleResultValue:       null;
    labCd:                          null;
    labCharges:                     null;
    modeOfTransport:                null;
    onSpotTestCd:                   null;
    poolNoOfAnimals:                null;
    receiptNo:                      string;
    sampleBarCd:                    null;
    sampleCollectionDate:           string;
    sampleExaminationSubtypeCd:     number;
    sampleExaminationTypeCd:        number;
    sampleReport:                   null;
    sampleResult:                   null;
    sampleResultRecievedDate:       null;
    sampleType:                     number;
    sourceOriginCd:                 number;
    sourceOriginId:                 number;
    testImageUrl1:                  null;
    testImageUrl2:                  null;
    testRemarks:                    string;
    testingLocation:                number;
    diseaseCdDesc:                  null;
    modeOfTransportDesc:            null;
    onSpotTestDesc:                 null;
    sampleExaminationTypeCdDesc:    any;
    sampleExaminationSubtypeCdDesc: any;
    sampleResultDesc:               null;
    sampleTypeDesc:                 string;
    samplingStatusDesc:             string;
    testingLocationDesc:            string;
    labCdDesc:                      null;
    samplingStatus:     number;
    onSpotDetails:      null;
    labTestingDetails:  LabTestingDetail[];
    
}

export interface ActionTaken {
    actionTakenCd:   number;
    actionTakenDesc: string;
}

export interface AreaMappingDetail {
    runSeqNo:       number;
    sourceOriginId: number;
    sourceOriginCd: number;
    districtCd:     number;
    tehsilCd:       number;
    villageCd:      number;
    isLatest:       string;
}

export interface FirAreaMappingDetailsDesc {
    districtCd:   number;
    districtName: string;
    tehsilCd:     number;
    tehsilName:   string;
    villageCd:    number;
    villageName:  string;
    runSeqNo:     number;
}

export interface FirDetailsResponseDto {
    firId:                       number;
    firstIncidenceDate:          string;
    firstIncidenceReportingDate: string;
    reportedBy:                  null;
    animalImageUrl1:             null;
    animalImageUrl2:             null;
    animalImageUrl3:             null;
    animalImageUrl4:             null;
    animalImageUrl5:             null;
    diseaseSuspected:            null;
    labConfirmed:                null;
    vaccinationDone:             string;
    publicHealthDisease:         string;
    sourceOfInfectionCd:         number;
    remarks:                     string;
    firStatus:                   number;
    firApprovalDate:             null;
    outbreakId:                  null;
    modifiedBy:                  string;
    modifiedDate:                string;
    createdBy:                   string;
    creationDate:                string;
    projectId:                   null;
    roleCd:                      null;
    isMigrated:                  null;
    sourceOfInfectionDesc:       string;
}

export interface FirDiseaseDetailsDesc {
    diseaseCd:   number;
    diseaseDesc: string;
}

export interface FirSpeciesImpacted {
    speciesCd:       number;
    speciesName:     string;
    noOfAnimals:     number;
    noOfAnimalsDied: number;
}

export interface FirSymptomDetailsDesc {
    symptomCd:   number;
    symptomDesc: string;
}

export interface SampleDetails {
    samplingStatus:     number;
    samplingStatusDesc: string;
    onSpotDetails:      null;
    labTestingDetails:  LabTestingDetail[];
}

export interface LabTestingDetail {
    sampleId:                 string;
    diseaseCd:                null;
    diseaseCdDesc:            null;
    sampleType:               number;
    sampleTypeDesc:           string;
    sampleCollectionDate:     string;
    sampleExaminationDetails: SampleExaminationDetail[];
}

export interface SampleExaminationDetail {
    sampleId:                       string;
    runSeqNo:                       number;
    animalId:                       number;
    tagId:                          number;
    ownerId:                        number;
    courierId:                      null;
    diseaseCd:                      null;
    finalSampleResultValue:         null;
    followUpNo:                     number;
    initialSampleResultValue:       null;
    labCd:                          null;
    labCharges:                     null;
    modeOfTransport:                null;
    onSpotTestCd:                   null;
    poolNoOfAnimals:                null;
    receiptNo:                      string;
    sampleBarCd:                    null;
    sampleCollectionDate:           string;
    sampleExaminationSubtypeCd:     number;
    sampleExaminationTypeCd:        number;
    sampleReport:                   null;
    sampleResult:                   null;
    sampleResultRecievedDate:       null;
    sampleType:                     number;
    samplingStatus:                 number;
    sourceOriginCd:                 number;
    sourceOriginId:                 number;
    testImageUrl1:                  null;
    testImageUrl2:                  null;
    testRemarks:                    string;
    testingLocation:                number;
    diseaseCdDesc:                  null;
    modeOfTransportDesc:            null;
    onSpotTestDesc:                 null;
    sampleExaminationTypeCdDesc:    string;
    sampleExaminationSubtypeCdDesc: string;
    sampleResultDesc:               null;
    sampleTypeDesc:                 string;
    samplingStatusDesc:             string;
    testingLocationDesc:            string;
    labCdDesc:                      null;
}
