

export interface ActionTakenList {
    flg:  boolean;
    data: Datum[];
    msg:  null;
}

export interface Datum {
    actionTakenCd:     number;
    actionTakenDesc:   string;
    isActive:          IsActive;
    effectiveFromDate: string;
    effectiveToDate:   string;
}

export enum IsActive {
    Y = "Y",
}
