
export interface Roles {
  roleCd: number;
  roleDesc:string,
  status:string,
  modules:string
}

export interface Module {
  moduleName: string;
  moduleCd:number
}
export interface SubModule {
  subModuleName: string;
  subModuleCd:number;
  moduleCd:string
}

export interface RoleDetails{
  roleDesc: string,
  roleCd: number,
  role: string,
  module: string,
  subModule: string,
  isActive: string
}

