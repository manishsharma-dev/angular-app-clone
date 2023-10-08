export interface GetAllOwners {
  individualOwners: IndividualOwner[];
  orgOwners: OrgOwner[];
}

export interface IndividualOwner {
  ownerId: string;
  ownerName: string;
  ownerDateOfBirth: string;
  ownerMobileNo: number;
  ownerAddressCityVillageCd: number;
  villageName: string;
}

export interface OrgOwner {
  orgId: string;
  districtCd: number;
  orgAddress: string;
  orgName: string;
  orgPin: number;
  orgRegistrationNo: number;
  orgType: number;
  stateCd: number;
  districtCdAreaOperating: string;
}
