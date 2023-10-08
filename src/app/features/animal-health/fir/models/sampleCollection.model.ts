

export interface SampleCollection {
    saveSampleRequestDtos: SaveSampleRequestDto[];
}

export interface SaveSampleRequestDto {
    animalId:              number;
    labTestingRequestDtos: LabTestingRequestDto[];
    onSpotRequestDtos:     OnSpotRequestDto[];
    ownerId:               number;
    tagId:                 number;
}

export interface LabTestingRequestDto {
    diseaseCd:                number;
    sampleExaminationDetails: SampleExaminationDetail[];
    sampleType:               number;
}

export interface SampleExaminationDetail {
    courierId:                  number;
    labCd:                      number;
    labCharges:                 number;
    modeOfTransport:            number;
    receiptNo:                  string;
    sampleExaminationSubtypeCd: number;
    sampleExaminationTypeCd:    number;
    testImageUrl1:              string;
    testRemarks:                string;
}

export interface OnSpotRequestDto {
    diseaseCd:                number;
    finalSampleResultValue:   string;
    initialSampleResultValue: string;
    onSpotTestCd:             number;
    sampleResult:             number;
    sampleType:               number;
    testRemarks:              string;
}
