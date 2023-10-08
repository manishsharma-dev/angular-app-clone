import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Breed } from '../../animal-management/animal-registration/models-animal-reg/breed-list.model';
import { OrgList } from '../../animal-management/animal-registration/models-animal-reg/org-list.model';
import { SubModule } from '../access-management/model/role.model';
import { Common } from './models/common.model';
import { Project } from './models/project.model';
import { ProjectUserAllocDelloc } from './models/user-alloc-dealloc.model';

@Injectable({
  providedIn: 'root',
})

export class ProjectManagementService {
  public url = environment.apiURL
 

  constructor(private http: HttpClient) {
    
  }

  getProjectList(val):Observable<Project[]> {
    return this.http.get<Project[]>( this.url+`admin/project/getProjectList?ownerText=${val}`)
    // return this.http.get<Project[]>( `http://localhost:8099/epashu/v1/admin/project/getProjectList?ownerText=${val}`)
  }


  GetUserlistAreaWise(payload:ProjectUserAllocDelloc):Observable<ProjectUserAllocDelloc[]>{
   
    return this.http.post<ProjectUserAllocDelloc[]>( this.url+'admin/project/GetUserlistAreaWise',payload)
  }
  getProjectDetail(projectId):Observable<any[]>{
    let payload={
      "projectId":projectId
    }
    return this.http.post<any[]>( this.url+'admin/project/getProjectDetails',payload)
    // return this.http.post<any[]>('http://localhost:8099/epashu/v1/admin/project/getProjectDetails',payload)

  }

  createProject(project):Observable<Project>{
    return this.http.post<Project>(this.url+`admin/project/createProject`, project)
    // return this.http.post<Project>('http://localhost:8099/epashu/v1/admin/project/createProject', project)
  }

  updateProject(project):Observable<Project>{
    return this.http.post<Project>(this.url+'admin/project/updateProject',project)
    // return this.http.post<Project>("http://localhost:8099/epashu/v1/admin/project/updateProject",project)
  }

  getOrgName(){
    return this.http.get<OrgList>(this.url+"admin/organization/getOrgList");
  }

  getCommonList($value: string){
    var payload = {
      key: $value
    }
    return this.http.post<Common[]>(this.url+"commonutility/getCommonMaster", payload);
  }

  getBreedList(breedCd: string){
    var payload = {
      speciesCode: breedCd 
    }
    return this.http.post<Breed[]>(this.url+"commonutility/getBreed",payload)
  }

  getParameterList(activityCd):Observable<any[]>{
    var payload = {
      subModuleCd: activityCd
    }
    return this.http.post<SubModule[]>(this.url+"admin/project/getParameterList",payload)
    // return this.http.post<SubModule[]>(this.url+"commonutility/getParameterList",payload)
    // return this.http.post<SubModule[]>('http://localhost:8099/epashu/v1/admin/project/getParameterList',payload)
  }

  getSubmodulesList(){
    return this.http.get<Project[]>(this.url+"admin/user/getModulesList");
  }
  getUserAllocated(payload){
    return this.http.post<Project[]>(this.url+"admin/project/projectUserAllocation",payload);
  }
  getUserDeAllocated(payload){
    return this.http.put<Project[]>(this.url+"admin/project/saveProjectUserDeAllocation",payload);
  }
  createProjectExtension(payload){
    return this.http.post<Project[]>(this.url+"admin/project/orgExtensionProject",payload);
  }

  getProjectUserDeAllocation(payload):Observable<ProjectUserAllocDelloc[]>{
   
    return this.http.post<ProjectUserAllocDelloc[]>(this.url+"admin/project/projectUserDeAllocation",payload);
  }

  uploadProjectUserDeAllocation(payload){
    return this.http.post<any>(this.url+"admin/project/bulkAllocateProjectsXML",payload);

  }
  downloadBulkUserExcel(data){

    const requestOptions: Object = {
      observe: 'response',
      responseType: 'blob' as 'json',
    };

    const payload={
      "projectId":data
    }
    return this.http.post<any>(this.url+"admin/project/exportExcel",payload,requestOptions);

  }

}
