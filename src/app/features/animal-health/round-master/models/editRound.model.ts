

export interface EditRoundMaster {
    roundNo:          number;
    stateCd:          number;
    diseaseCd:        number;
    fromDate:         string;
    toDate:           string;
    dataEntryEndDate: string;
    remarks:          string;
    createdBy:        string;
    creationDate:     string;
    modifiedBy:       string;
    modifiedDate:     string;
}

export interface Msg {
    msgCode: number;
    msgDesc: string;
}
