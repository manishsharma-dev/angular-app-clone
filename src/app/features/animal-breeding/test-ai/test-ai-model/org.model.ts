export interface Organization {
  orgId: number;
  orgName: string;
  orgType: number;
  orgTypeDesc: any;
  stateCd: number;
  stateName: string;
  districtCd: number;
  districtName: string;
  orgStatus: number;
  orgStatusDesc: OrgStatusDesc;
}

export enum OrgStatusDesc {
  Active = 'Active',
  InActive = 'In Active',
}
