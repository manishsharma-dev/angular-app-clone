

export interface SaveUntagged {
    requestorName:  string;
    requestorMobNo: string;
    villages:       Village[];
    ailmentCd:      string;
    speciesCd:      number;
    diseaseCd:      number;
    prescription:   string;
    specifyReason:  string;
}

export interface Village {
    districtCd:        number;
    stateCd:           number;
    tehsilCd:          number;
    villageCd:         number;
    stateName:         string;
    villageName:       string;
    districtName:      string;
    tehsilName:        string;
    pinCd:             null;
    nearbyVillageCd:   null;
    nearbyVillageName: null;
    selectedAllGroup:  string;
}
