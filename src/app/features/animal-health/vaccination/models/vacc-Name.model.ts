

export interface VaccinationName {
    vaccineCd:    number;
    vaccineName:  string;
    manufacturer: string;
    diseaseCd:    number;
    diseaseDesc:  string;
    routeCd:      number;
    routeName:    string;
    formCd:       number;
    formName:     string;
    unitCd:       number;
    unitName:     string;
    speciesCd:    number;
    speciesName:  string;
    dosage:       number;
}


export interface VaccinationType {
    key:   string;
    cd:    number;
    value: string;
}
export interface RepeatVaccReason {
    key:   string;
    cd:    number;
    value: string;
}


export interface VaccType {
    vaccineCd:       number;
    vaccineTypeCd:   number;
    vaccineTypeName: string;
    manufacturer:    string;
    diseaseCd:       number;
    diseaseDesc:     string;
    vaccineName: string;
    vaccineSubtypeCd: number;
    vaccineSubtypeName: string;
}

export interface Species {
    speciesCd:   number;
    speciesName: string;
    routeCd:     number;
    routeName:   string;
    formCd:      number;
    formName:    string;
    dosage:      number;
    unitCd:      number;
    unitName:    string;
}