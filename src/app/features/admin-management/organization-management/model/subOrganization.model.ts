export interface subOrganization {
  id: number;
  UIN: number
  subOrganization: string;
  parentOrganization: string
  type: string;
  state: string;
  district: string;
  status: 'Active' | 'Inactive';
  subOrgName: string;
  orgId: number;
  stateCd: number | string;
  districtCd: number | string
  subOrgType: string
}

export interface SampleExaminationSubtypeMaster {
  sampleExaminationTypeCd: number;
  sampleExaminationSubtypeCd: number
  sampleExaminationSubtypeDesc: string;

}
