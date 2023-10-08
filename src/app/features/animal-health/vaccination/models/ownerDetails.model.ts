

export interface OwnerDetails {
    ownerId: string;
    animalsList?: AnimalsList[];
    ownerName: string;
    ownerFirstName: string;
    ownerMiddleName?: string;
    ownerLastName: string;
    fatherName: string;
    emailId?: string;
    ownerDateOfbirth: string;
    ownerGender: string;
    ownerMobileNo: number;
    ownerAddress?: string;
    ownerAddressPincode: number;
    ownerAddressStateCd: number;
    ownerAddressDistrictCd: number;
    ownerAddressCityVillageCd: number;
    ownerVillageName: string;
    ownerAddressHamletCd: number;
    ownerAddressTehsilCd: number;
    affiliatedAgencyUnionOrPc: boolean;
    registrationStatus: string;
    villageInstitutionType: number;
    villageInstitutionCode: number;
    membershipNumber: string;
    alternateMobileNo: number;
    ownerCastCategoryCd: number;
    ownerLandHoldingCd: number;
    isPourerMember: boolean;
    isOwnerBelowPovertyLine: boolean;
    isCategoryVerified: boolean;
    hhid: string;
    isOwnerMobileVerified: boolean;
    orgId: string;
    orgDistrictCd: number;
    orgAddress: string;
    orgMobileNo?: string;
    orgName: string;
    orgPin: number;
    orgRegistrationNo: number;
    orgType: number;
    orgStateCd: number;
    orgDistrictCdAreaOperating: string;
}

export interface AnimalsList {
    animalId:              number;
    animalName:            AnimalName;
    animalPicUrl:          string;
    ageInMonths: number | string;
    animalStatusCd:        number;
    animalStatus:          AnimalStatus;
    dateOfBirth:           string;
    isLoanOnAnimal:        boolean;
    ownerId:               number;
    registrationDate:      string;
    registrationStatus:    string;
    sex:                   Sex;
    speciesCd:             number;
    species:               Species;
    tagId:                 number;
    taggingDate?:           string;
    pregnancyMonth:        number;
    pregnancyStatus:       PregnancyStatus;
    imagePreviewUrl:       string;
    breedAndExoticLevels?: BreedAndExoticLevel[];
    sireId?:               number;
    sireSireId?:           number;
}

export enum AnimalName {
    Jwala = "jwala",
}

export enum AnimalStatus {
    Active = "Active",
}

export interface BreedAndExoticLevel {
    breed:            string;
    bloodExoticLevel: string;
}

export enum PregnancyStatus {
    Y = "Y",
}

export enum Sex {
    F = "F",
}

export enum Species {
    Yak = "Yak",
}
