export interface MemberList {
    roleCd:[number],
    roleDesc:[string],
    firstName:[string]
    defaultRoleAccess:[{roleDesc:string, roleCd:number}],  
    additionalRoleAccess:[{roleDesc:string, roleCd:number}],  
    
    
}
