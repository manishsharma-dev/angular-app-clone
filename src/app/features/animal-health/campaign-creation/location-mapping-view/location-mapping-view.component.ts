import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LocationMappingEditComponent } from '../location-mapping-edit/location-mapping-edit.component';

@Component({
  selector: 'app-location-mapping-view',
  templateUrl: './location-mapping-view.component.html',
  styleUrls: ['./location-mapping-view.component.css']
})
export class LocationMappingViewComponent implements OnInit, OnChanges {
  @Input() locationDetailsResponseDto: any;
  selectedState: any[] = [];
  selectedVillage: any[] = [];
  selectedTehsil: any[] = [];
  selectedDistrict: any[] = [];
  areaAllocation: any[] = [];
  stateMaster: any[] = [];
  isLiveStackAdmin = false;
  constructor(private dialog: MatDialog) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.locationDetailsResponseDto?.currentValue) {
      this.areaAllocation = changes.locationDetailsResponseDto.currentValue
      this.mapArea();
    }
  }

  mapArea() {
    this.selectedState = Array.from(new Set(this.areaAllocation.map(obj => obj.stateCd)))
      .map(stateCd => this.areaAllocation.find(obj => obj.stateCd === stateCd));

    this.selectedDistrict = Array.from(new Set(this.areaAllocation.map(obj => obj.districtCd)))
      .map(districtCd => this.areaAllocation.find(obj => obj.districtCd === districtCd));

    this.selectedTehsil = Array.from(new Set(this.areaAllocation.map(obj => obj.tehsilCd)))
      .map(tehsilCd => this.areaAllocation.find(obj => obj.tehsilCd === tehsilCd));

    this.selectedVillage = Array.from(new Set(this.areaAllocation.map(obj => obj.villageCd)))
      .map(villageCd => this.areaAllocation.find(obj => obj.villageCd === villageCd));
  }

  ngOnInit() {
    this.isLiveStackAdmin = sessionStorage.getItem("isLivesatckAdmin") == "true";
  }

  manageAreaAllocation(areaSection: string) {
    var selectedParent;
    var selectedData;
    switch (areaSection) {
      case "state":
        selectedParent = [];
        selectedData = this.selectedState.slice();
        break;
      case "district":
        selectedParent = [...new Set(this.selectedState.map(state => state.stateCd))];
        selectedData = this.selectedDistrict.slice();
        break;
      case "tehsil":
        selectedParent = [...new Set(this.selectedDistrict.map(district => district.districtCd))];
        selectedData = this.selectedTehsil.slice();
        break;
      case "village":
        selectedParent = [...new Set(this.selectedTehsil.map(tehsil => tehsil.tehsilCd))];
        selectedData = this.selectedVillage.slice();
        break;
    }
    const areaAllocation = {
      selectedState: this.selectedState.slice(),
      selectedDistrict: this.selectedDistrict.slice(),
      selectedTehsil: this.selectedTehsil.slice(),
      selectedVillage: this.selectedVillage.slice()
    }
    const dialogRef = this.dialog.open(LocationMappingEditComponent, {
      width: '100vw',
      height: '100vh',
      panelClass: 'custom-dialog-container',
      disableClose: true,
      data: {
        stateMaster: this.stateMaster,
        selectedParent,
        selectedData,
        areaSection,
        areaAllocation
      },
    }).afterClosed().subscribe((res) => {
      if (res) {
        this.updateAreaAllocation(res);
      }
    });
  }

  updateAreaAllocation(res) {
    switch (res.areaSection) {
      case "state":
        // this.selectedState = res.data.selectedState.map((state: any) => {
        //   return {
        //     stateCd: state.stateCd ?? state.stateCode,
        //     stateName: state.stateName
        //   }
        // });
        this.selectedState = [{ ...res.data.selectedState, stateCd: res.data.selectedState.stateCd ?? res.data.selectedState.stateCode }]
        this.selectedDistrict = res.childSection.selectedDistrict;
        this.selectedTehsil = res.childSection.selectedTehsil;
        this.selectedVillage = res.childSection.selectedVillage;
        break;
      case "district":
        this.selectedDistrict = res.data.selectedDistrict;
        this.selectedTehsil = res.childSection.selectedTehsil;
        this.selectedVillage = res.childSection.selectedVillage;
        break;
      case "tehsil":
        this.selectedTehsil = res.data.selectedTehsil;
        this.selectedVillage = res.childSection.selectedVillage;
        break;
      case "village":
        this.selectedVillage = res.data.selectedVillage
        break;
    }
  }

}
