
export interface SaveRoundMaster {
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
    msgCode: number;
    msgDesc: string;
    msg: Msg;
}

export interface Msg {
    msgCode: number;
    msgDesc: string;
}
