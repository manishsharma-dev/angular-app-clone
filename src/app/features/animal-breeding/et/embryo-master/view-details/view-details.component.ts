import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EtService } from '../../et.service';
import { EditEmbryoDialogComponent } from '../edit-embryo-dialog/edit-embryo-dialog.component';
import { Location } from '@angular/common';
import { ConfirmationDeleteDialogComponent } from 'src/app/shared/confirmation-delete-dialog/confirmation-delete-dialog.component';
import { SnackBarMessage } from 'src/app/shared/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MasterConfig } from 'src/app/shared/master.config';

@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.css']
})
export class ViewDetailsComponent implements OnInit {
  masterConfig = MasterConfig
  isLoadingSpinner:boolean =false
  embryoId:string;
  getCommonMasterDetail :Array<{}> = []
  embryoDetails:any

  constructor(
    public dialog: MatDialog,
    private etService:EtService,
    private route: ActivatedRoute,
    private location:Location,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.embryoId = this.route.snapshot.queryParams['embryoId']
    this.getCommonMaster()
    this.getEmbryoDetails()
  }


  openEditEmbryoDialog() {
    const dialogRef = this.dialog.open(EditEmbryoDialogComponent, {
      data: {
        embryoDetail: this.embryoDetails,
       
      },
      position: {
        right: '0px',
        top: '0px',
      },
      width: '40vw',
      height: '100vh',
    });
    dialogRef.afterClosed().subscribe((res) => {
      if(res) this.getEmbryoDetails()
    });
  }


  getKeyValue(type:number,key:string){
    const value  = this.getCommonMasterDetail[key]?.filter(val=>val?.cd == type)
    let keyValue = '--'
    if(value && value?.length)  keyValue = value[0]?.value
    return keyValue

  }
  goBack() {
    this.location.back()
  }
  deleteRow(type:string) {
 const message = type == 'Discarded' ? 'animalBreeding.commonLabel.discard_animal'
                          : 'animalBreeding.commonLabel.delete_animal'
    this.dialog
      .open(ConfirmationDeleteDialogComponent, {
        data: {
          id: "",
          title: 'common.alert',
          message: message,
          icon:"assets/images/alert.svg",
          primaryBtnText: 'Yes',
          secondaryBtnText: 'Cancel',
        },
      }).afterClosed()
      .subscribe({
        next: (result) => {
          if (result) {
            this.isLoadingSpinner = true
            let embryoIdList = []
             embryoIdList.push({action:type,embryoId:this.embryoId})
            this.etService.deleteAndDiscardEmbryo(embryoIdList).subscribe((response) => {
              this.isLoadingSpinner = false
              // const message = `Embryo's ${type} Successfully.`
              // this.snackBarMessage(message,'green-snackbar')
              const message = type == 'Discarded' ? 'animalDetails.embryo_discard_success' 
                                      : 'animalDetails.embryo_delete_success'
              this.confirmtionDialoug(message)
              this.goBack()
            },error=>{
              this.isLoadingSpinner = false
            }
            );
          }
        },
      });


  }
  deallocateEmbryo():void{
    const embryoDetail = {
      action:'deallocation',
      allocatedTo: this.embryoDetails?.allocatedTo,
      allocatedToId: this.embryoDetails?.allocatedToId,
      embryoId: [this.embryoDetails?.embryoId],
    }
    this.isLoadingSpinner = true
    this.etService.allocateEmbryoIds(embryoDetail).subscribe((data:any)=>{
      this.getEmbryoDetails()
      this.isLoadingSpinner = false
    },
    error=>{
      this.isLoadingSpinner = false
    }
    )
  }
  
 private getEmbryoDetails():void{ 
  this.isLoadingSpinner = true
  this.etService.verifyEmbryoID(this.embryoId).subscribe(data=>{
    this.embryoDetails = data
    this.isLoadingSpinner = false
  },error => {this.isLoadingSpinner = false}
  )

  }

  private getCommonMaster():void{
    this.isLoadingSpinner = true
   const key = ['embryo_type','embryo_grade','semen_type','sexed_semen','embryo_status','allocated_to','embryo_production_type','embryo_stage']
 key.forEach(val=>{
  this.etService.getCommonMaster(val).subscribe(data=>{
    this.isLoadingSpinner = false
    this.getCommonMasterDetail[val] = data
   },
   error => {this.isLoadingSpinner = false}
   )
 })

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
        primaryBtnText: 'Ok'
      },
      panelClass:'common-alert-dialog'
    }).afterClosed()
  }

}
