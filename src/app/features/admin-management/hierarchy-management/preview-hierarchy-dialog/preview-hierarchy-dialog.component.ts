import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HierarchyService } from '../hierarchy.service';
import { HierarchyDetails } from '../models/hierarchy.model';

@Component({
  selector: 'app-preview-hierarchy-dialog',
  templateUrl: './preview-hierarchy-dialog.component.html',
  styleUrls: ['./preview-hierarchy-dialog.component.css']
})
export class PreviewHierarchyDialogComponent implements OnInit {
  public getHierarchyDetail:HierarchyDetails[]=[];
  public isLoadingSpinner:boolean=false;
  constructor(public dialogRef: MatDialogRef<PreviewHierarchyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data:any,private hierarchyService:HierarchyService) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('500px');
    this.getHierarchyDetails();
  }

  getHierarchyDetails(){
   
    this.isLoadingSpinner=true;
    this.hierarchyService.getHierarchyDetails(this.data).subscribe((response)=>{
      this.getHierarchyDetail=response;
      this.isLoadingSpinner=false;
    },error=>{
      this.isLoadingSpinner=false;
    })
  }

}
