import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { ViewOrganizationComponent } from 'src/app/features/animal-management/animal-registration/view-organization/view-organization.component';
import { MasterConfig } from 'src/app/shared/master.config';
import { bullDetail, BullList, OrgList } from '../../bull-master/bull-master-model/bull-master.model';
import { BullMasterService } from '../../bull-master/bull-master.service';
import { AddStrawDialogComponent } from '../add-straw-dialog/add-straw-dialog.component';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-straw-listing',
  templateUrl: './straw-listing.component.html',
  styleUrls: ['./straw-listing.component.css']
})
export class StrawListingComponent implements OnInit {
  masterConfig = MasterConfig
  searchForm!: FormGroup;
  semanStationDetailSection:boolean =  false
  animalDetailsSection:boolean = false
  tableDataSource = new MatTableDataSource<bullDetail>();
  displayedColumns: string[] = [
    '#',
    'bullId',
    'tagId',
    'bullRegistrationDate',
    'species',
    'breed',
    'dateOfBirth',
    'nominatedBullFlag',
    'importedSemenFlag',
    'action',
  ];
  private sort!: MatSort;
  errorMessage:string;
  isLoadingSpinner:boolean = false
  ownerDetailsRecord: any;
  bullList: BullList
  ownerDetailsLength: number = 0;
  orgsList!: OrgList[];
  orgDetailsByID:any
  animalData: any = [];
  totalRows = 0;
  pageSize = 5;
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];
  searchBy: string = 'semenStation';
  isSemenStationSelected:boolean = true
  isbeingSearched: boolean = false;
  isBullAvailable :any

  @ViewChild('select1') select1Comp: NgSelectComponent;
  constructor(private _formBuilder: FormBuilder,
     private bullMasterService: BullMasterService,
    private route: ActivatedRoute,private router:Router,
    public dialog: MatDialog,) { }

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }
  
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;

 
  ngOnInit(): void {
    this.getOrgnizationList()
    this.initSearchForm()
    
   
  }
 

  searchResults(isPaginator?:boolean,isBull?:boolean){
    if(isBull){
      this.searchForm.get("searchValue").reset()
      this.searchBullViaSemenStation()
    }else{
      let reqObj :any = {}
      reqObj.orgSubOrgId = this.searchForm.value.searchValue
      reqObj.pageNo = isPaginator ? this.currentPage : 0
      reqObj.itemPerPage = this.pageSize
      this.animalDetailsSection = false;
      this.semanStationDetailSection =false
      this.putQueryParam(reqObj.orgSubOrgId)
      // this.ownerDetailsByID = this.orgsList?.filter(org=>org.subOrgId == orgID)
        this.isLoadingSpinner = true;
        this.bullMasterService.getBullDetails(reqObj).subscribe((data) => {
          this.isLoadingSpinner = false;
         this.setBullInformation(data,isPaginator)
  
        },
        error=>{
          this.isLoadingSpinner = false;
        }
        );
    }
  
   

  }
  searchBullViaSemenStation(){
    const bullId = this.searchForm.get("bullId").value
    this.isLoadingSpinner = true
    this.bullMasterService.getBullDetailsByID(bullId).subscribe(
      (data)=>{
        this.isLoadingSpinner = false
        const bullDetail = new Array(data)
        this.tableDataSource = new MatTableDataSource(
          bullDetail
        );
        this.animalDetailsSection = true
        this.searchForm.get("searchValue").setValue(data?.semenStationId)
         const suborgList = this.orgsList.filter(subOrg=>subOrg?.subOrgId == data?.semenStationId )
        this.orgDetailsByID =(suborgList && suborgList?.length) > 0 ? 
                                                           suborgList[0] : [];
        this.semanStationDetailSection = true   
        this.isBullAvailable = bullDetail
        this.changePaginatorIndex(false)                                                  
        this.removeParam()
      },
      error=>{
        this.isLoadingSpinner = false
      }
    )
  }

  resetValue() {
    this.searchForm.get("searchValue").reset();
    this.searchForm.get("semenCenter").reset()
    // this.ownerRegistrationFlag = false;
    this.semanStationDetailSection = false;
    this.animalDetailsSection = false;
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
    if (this.tableDataSource.paginator) {
      this.tableDataSource.paginator.firstPage();
    }
  }
  setDataSourceAttributes() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sort = this.sort;
  }
  onSelectingSearchBy(event: Event) {
    this.searchBy = (event.target as HTMLInputElement)?.value;
    this.semanStationDetailSection =false
    this.animalDetailsSection =false
    this.searchForm.get("searchValue").reset();
      this.searchForm.get("semenCenter").reset()
      this.searchForm.get("bullId").reset()
  }

  formatDate(date: string) {
    if (date) {
      return moment(new Date(date)).format('DD/MM/YYYY');
    }
    return null;
  }
  viewOrgDetailsDialog(orgId:number) {
    const dialog = this.dialog.open(ViewOrganizationComponent, {
      data: { orgData: orgId },
      width: '500px',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      position: {
        right: '0px',
        top: '0px',
      },
    });
  }
  animalSelected(event: Event, element: any) {
    
      this.animalData = element;
    
  }
  private setBullInformation(data:any,isPaginator?:boolean):void{
    this.bullList = data;
       this.animalDetailsSection = true
       if(this.bullList && this.bullList?.subOrganizationDetailsResponceDto){
        this.semanStationDetailSection = true
        this.orgDetailsByID = this.bullList?.subOrganizationDetailsResponceDto
       }
       if(this.bullList && this.bullList?.bullMasterDtoList?.length > 0){
        this.totalRows = this.bullList?.bullMasterDtoList?.length > 4 ? 
        this.totalRows = this.totalRows + this.pageSize * 2
         : this.totalRows = this.pageSize * 2
        this.tableDataSource = new MatTableDataSource(
          this.bullList?.bullMasterDtoList
        );
        this.isBullAvailable = this.bullList?.bullMasterDtoList
        this.changePaginatorIndex(isPaginator)
        // this.animalDetailsSection = true;
       }
  }

  private initSearchForm(): void {
  
    this.searchForm = this._formBuilder.group({
      optRadio: ['semenStation'],
      searchValue: [null, [Validators.required]],
    bullId:  ['',
      {
        updateOn: 'blur',
      },],
      semenCenter:[null]

    });
  }


private getOrgnizationList(){
  this.isLoadingSpinner = true
  const subOrganisationType = {
    subOrgType : 2,
    stateCheck : true
  }
  this.bullMasterService.getOrganizationList(subOrganisationType).subscribe((data: OrgList[]) => {
    this.isLoadingSpinner = false
    this.orgsList = data;
    this.orgsList = this.orgsList.filter(org=> org.subOrgStatus == 1)
     const isSemenID = this.route.snapshot.queryParams['semenId']
    if (isSemenID) {
      // const semenName = this.orgsList.filter(org=>org.subOrgId == isSemenID)
      this.searchForm.get('searchValue').setValue(isSemenID)
      this.searchResults()
    }
  },error=>{this.isLoadingSpinner = false}
  );
}
private putQueryParam(id: string) {
  this.router.navigate(
    [],
    {
      relativeTo: this.route,
      queryParams: { semenId: id },
      queryParamsHandling: 'merge', // remove to replace all query params by provided
    });
}
 addSemenDetails(data?: any): void {
  this.dialog
    .open(AddStrawDialogComponent, {
      data: data,
      width: '620px',
      panelClass: 'makeItMiddle',
    })
    .afterClosed()
    .subscribe((res) => {
      
    });
}
private removeParam(){
  this.router.navigate([], {
    queryParams: {
      'semenId': null,
    },
    queryParamsHandling: 'merge'
  })
}
ngAfterViewInit() {
  this.tableDataSource.paginator = this.paginator;
}
pageChanged(event: PageEvent) {
  this.pageSize = event.pageSize;
  this.currentPage = event.pageIndex;
  this.searchResults(true);
}
private changePaginatorIndex(isPaginator){
  if(!isPaginator)
        setTimeout(() => {
          this.paginator.pageIndex = 0;
         }, 0);
}
OnOpen(){
  if(!this.isbeingSearched)
  {
    this.select1Comp.close()      
  }
 
}

OnSearch(){
  this.isbeingSearched = true;
  this.select1Comp.open()
}

OnBlue(){
  this.isbeingSearched = false;
  this.select1Comp.close()
}
addSemenCode(type){
  if(type == "semenCode"){
    const semenCode = this.searchForm.get("semenCenter").value
    this.searchForm.get("searchValue").setValue(semenCode)
  }else{
    const semenStation = this.searchForm.get("searchValue").value
    this.searchForm.get("semenCenter").setValue(semenStation)
  }

}
}
