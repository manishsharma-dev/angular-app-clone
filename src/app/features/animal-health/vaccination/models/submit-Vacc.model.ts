

export interface SaveVaccination {
    selected_tagId_details: SelectedTagIDDetail[];
}

export interface SelectedTagIDDetail {
    animalId:                       number;
    batchNo:                        string;
    campaignId:                     string;
    createdBy:                      string;
    creationDate:                   string;
    diseaseCd:                      string;
    dosage:                         string;
    modifiedBy:                     string;
    modifiedDate:                   string;
    newDewormerRemarks:             string;
    ownerId:                        string;
    repeatVaccinationReasonCd:      string;
    ringVaccinationReason:          string;
    tagId:                          string;
    vaccinationDeWormerDate:        string;
    vaccinationDeWormingRecordDate: string;
    vaccinationDeWormingPhotoUrl:   string;
    vaccineCd:                      string;
    vaccinationType:                string;
    manufacturerNameCd:             string;
    vaccinationDewormingFlag:       string;
}
