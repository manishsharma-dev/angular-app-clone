export interface UserAllocate {
    userID: number;
    userName: string;
    userType: string;
    role: string;
    organization:string;
    baseLocation:string
    startDate: string;
    endDate: string;
    status:string
  }

  export interface  ExtensionProject {
    orgType: string;
    p_org: string;
    p_state: string;
    p_district: string;
  }