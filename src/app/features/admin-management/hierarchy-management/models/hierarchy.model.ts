export interface Hierarchy {
  stateName: string;
  hierarchyId: string;
  hierarchyName: string;
  creationDate: string;
  hierarchyStatus: string;
}

export interface RoleArea {
  key: string;
  cd: string;
  value: string;
 
}

export interface AddNewHierarchy {
  stateCd: number;
  hierarchyName: string;
  levelsInfo: [{}];
 
}

export interface HierarchyDetails {
  hierarchyId: string;
  stateCd: number;
  stateName:string
  hierarchyName:string
  levelsInfo: [{level:number,roleCd:number,roleArea:number,roleAreaValue:string,isActive:string}];
 
}