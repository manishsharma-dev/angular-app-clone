export interface GetBullListRes {
  animalId: any;
  bullMasterDtoList: BullMasterDtoList[];
  subOrganizationDetailsResponceDto: SubOrganizationDetailsResponceDto;
}

export interface BullMasterDtoList {
  bullId: string;
  animalId: number;
  tagId: number;
  dateOfBirth: string;
  sireId: string;
  damId: number;
  sireSireId: string;
  damSireId: string;
  bullRegistrationDate: string;
  bullRegistrationRecordDate: string;
  semenStationId: number;
  bullSource: number;
  nominatedBullFlag: string;
  sexSortedFlag: string;
  etBullFlag: string;
  importedSemenFlag: string;
  nominatedStartDate: string;
  nominatedEndDate: string;
  activeStartDate: string;
  activeEndDate: string;
  bullStatus: number;
  modifiedBy: string;
  createdBy: string;
}

export interface SubOrganizationDetailsResponceDto {
  subOrgId: number;
  orgId: number;
  orgName: string;
  subOrganizationBasicInfo: SubOrganizationBasicInfo;
  subOrgStatus: number;
  subOrgStatusDesc: string;
}

export interface SubOrganizationBasicInfo {
  orgId: number;
  subOrgName: string;
  subOrgType: number;
  subOrgTypeDesc: string;
  subOrgOnboardDate: string;
  subOrgTenureCompleteDate: string;
  subOrgIdentificationNo: string;
  subOrgIdentificationProofUrl: string;
}
