export interface OwnerData {
  ownerId: string;
  ownerUuidKey1: string | null;
  ownerUuidKey2: string | null;
  ownerFirstName: string;
  ownerLastName: string;
  ownerMiddleName: string | null ;
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
  villageName: string;
  ownerAddressHamletCd: number;
  affiliatedAgencyUnionOrPc?: boolean;
  registrationStatus: string;
  ownerName?: string;
}

