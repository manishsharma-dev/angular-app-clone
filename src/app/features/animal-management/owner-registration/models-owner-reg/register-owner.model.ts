export interface RegisterOwner {
    ownerId: string;
    ownerUuidKey1: string;
    ownerFirstName: string;
    ownerMiddleName: string;
    ownerLastName: string;
    fatherFirstName: string;
    fatherMiddleName: string;
    fatherLastName: string;
    ownerDateOfbirth: string;
    ownerGender: string;
    ownerMobileNo: number;
    ownerAddressPincode: number;
    ownerAddressStateCd: number;
    ownerAddressDistrictCd: number;
    ownerAddressCityVillageCd: number;
    ownerAddressHamletCd: number;
    affiliated_agency_union_or_pc?: string;
    affiliatedAgencyUnionOrPc?:boolean;
    ownerUuidKey2: string;
    registrationStatus: string;
    modifiedDate: string;
    modifiedBy: string;
    createdBy: string;
    creationDate: string;
  }
  