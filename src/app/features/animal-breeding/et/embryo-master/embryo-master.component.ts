import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { GroupDialogComponent } from 'src/app/features/animal-health/groups-disease-testing/group-dialog/group-dialog.component';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { EmbryoMasterList } from '../et.model';
import { EtService } from '../et.service';
import { AllocateDialogComponent } from './allocate-dialog/allocate-dialog.component';
import { MasterConfig } from 'src/app/shared/master.config';


@Component({
  selector: 'app-embryo-master',
  templateUrl: './embryo-master.component.html',
  styleUrls: ['./embryo-master.component.css']
})

export class EmbryoMasterComponent implements OnInit {
  masterConfig = MasterConfig
  spotTestingDisplayedColumns: string[] = ['checkbox','sr_no','flushing_date','embryo_id','donor_id','sire_id','grade','stage','age','allocated','allocated_to','action'];
  dataSource = new MatTableDataSource<EmbryoMasterList>();
  animalDetail = [];
  embryoDetails:EmbryoMasterList[] = []
  isLoadingSpinner: boolean = false
  step = 0;
  private paginator!: MatPaginator;
  private sort!: MatSort;
  submitStatus = {
    selectAnimalForm: true,
    testingDetailForm: false,
  };

  constructor( private dialog:MatDialog,
    private _fb: FormBuilder,private etService:EtService,
     private router: Router,private _snackBar: MatSnackBar,) { }

    @ViewChild(MatSort) set matSort(ms: MatSort) {
      this.sort = ms;
      this.setDataSourceAttributes();
    }
  
    @ViewChild('paginatorRef') set matPaginator(mp: MatPaginator) {
      this.paginator = mp;
      this.setDataSourceAttributes();
    }
  
  
    setDataSourceAttributes() {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

  ngOnInit(): void {

    this.getEmbryoMasterList()   

  }
  // onFilter() {
  //   this.dataSource.filter = this.filterForm.get('filter').value;
  //    this.animalDetail = this.animalDetail.filter(value=>this.dataSource.filteredData.includes(value))
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
}


  checkAllBoxes(event: Event) {
    this.animalDetail.length = 0;
    if ((event.target as HTMLInputElement)?.checked) {
      for (var i = 0; i < this.dataSource.filteredData.length; i++) {
        this.animalDetail.push(this.dataSource.filteredData[i]);
      }
    }else{
      this.animalDetail = []
    }
  }

  // onCheckboxChange(event, element) {
  //   if (event.target.checked) {
  //     this.animalDetail.push(element);
  //   } else {
  //     this.animalDetail.forEach((value, index) => {
  //       if (value.embryo_id === element.embryo_id ) this.animalDetail.splice(index, 1);
  //     });
  //   }
  // }

  // checkIfInSelectedList(element) {
  //   return this.animalDetail.includes(element);
  // }

  onCheckboxChange(event: Event, clickedAnimalData: object) {
    if ((event.target as HTMLInputElement).checked) {
    
        this.animalDetail?.push(clickedAnimalData);
  
    } else {
      this.animalDetail?.forEach((value, index) => {
        if (value == clickedAnimalData) {
          this.animalDetail.splice(index, 1);
        }
      });
    }
  }

  checkIfInSelectedList(data: any) {
    if (this.animalDetail?.length > 0) {
      return this.animalDetail?.includes(data);
    } else {
      return false;
    }
  }



  onClickingRemove(element) {
    this.animalDetail.forEach((value, index) => {
      if (value.embryo_id === element.embryo_id) this.animalDetail.splice(index, 1);
    });
  }



  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

    // dialog
    groupDialogSubmit() {
      
      const dialogRef = this.dialog.open(GroupDialogComponent, {
        width: '400px',
      });
      dialogRef.afterClosed().subscribe((res) => {});
    }

   allocateEmbryo(action:string) {
    this.dialog
      .open(AllocateDialogComponent, {
        data: {
          title: 'animalBreeding.allocate_embryo',
          animalDetail: this.animalDetail,
          action:action
        },
        width: '620px',
        height: '400px',
        panelClass: 'makeItMiddle'
      }).afterClosed()
      .subscribe(data => {
        if(data){
          this.animalDetail = []
          this.getEmbryoMasterList()
        }
    
       
      });
  }
  getEmbryoMasterList():void{
    this.isLoadingSpinner = true
      this.embryoDetails = []
    this.etService.getEmbryoMasterList().subscribe((data:EmbryoMasterList[])=>{
      this.embryoDetails = data
      this.isLoadingSpinner = false
      if(this.embryoDetails && this.embryoDetails?.length > 0){
        this.dataSource = new MatTableDataSource(
          this.embryoDetails
        );
      }
     
    },error=>{this.isLoadingSpinner = false}
    )
  }
  deleteRow(type:string) {

    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: "",
          title: 'common.alert',
          message: `animalBreeding.commonLabel.discard_animal`,
          icon:"assets/images/alert.svg",
          primaryBtnText: 'common.ok',
          secondaryBtnText: 'animalDetails.cancel',
        },
      }).afterClosed()
      .subscribe({
        next: (result) => {
          if (result) {
            this.isLoadingSpinner = true
            const getEmbryoID = this.getEmbryoList(type)
            this.etService.deleteAndDiscardEmbryo(getEmbryoID).subscribe((response) => {
              this.isLoadingSpinner = false
              this.animalDetail = []
              this.getEmbryoMasterList()
              // const message = `Embryo's ${type} Successfully.`
              // this.snackBarMessage(message,'green-snackbar')
              this.confirmtionDialoug('animalDetails.embryo_discard_success')
            },error=>{
              this.isLoadingSpinner = false
            }
            );
          }
        },
      });


  }
  editEmbryoDetails():void{
    this.router.navigate(['./dashboard/animal-breeding/et//edit-embryo-detail'])
    sessionStorage.setItem('animalData', JSON.stringify(this.animalDetail));
  }
  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
   
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  private getEmbryoList(type:string){
    const embryoList = this.animalDetail?.length > 0
                       ? this.animalDetail : []
    const embryoIdList = []
    if(embryoList?.length > 0){
      embryoList.forEach(element => {
        embryoIdList.push({action:type,embryoId:element?.embryoId})
      });
    }

    return embryoIdList
  }
  private snackBarMessage(message: string,color:string): void {
    new SnackBarMessage(this._snackBar).onSucessMessage(
      message,
      'Ok',
      'center',
      'top',
      color
    );
  }
  private confirmtionDialoug(message:string):void{
    this.dialog.open(ConfirmationDeleteDialogComponent, {
      data: {
        id: "",
        title: 'common.alert',
        message: message,
        icon:"assets/images/alert.svg",
        primaryBtnText: 'common.ok'
      },
      panelClass:'common-alert-dialog'
    }).afterClosed()
  }
}
