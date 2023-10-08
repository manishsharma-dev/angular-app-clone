import {
  Component,
  OnChanges,
  AfterViewInit,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { OwnerDetails } from '../shareService/model/owner.detail';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { OwnerType } from '../common-search-box/common-search-box.component';

@Component({
  selector: 'app-common-owners-list',
  templateUrl: './common-owners-list.component.html',
  styleUrls: ['./common-owners-list.component.css'],
})
export class CommonOwnersListComponent implements OnChanges, AfterViewInit {
  ownersType: OwnerType;

  @Input() ownersList = [];
  @Output() showDetail = new EventEmitter<OwnerDetails>();

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ownerDataSource = new MatTableDataSource<any>([]);
  individualCols = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'ownerDateOfBirth',
    'ownerGender',
    'villageName',
    'arrow',
  ];
  nonIndividualCols = [
    'sNo',
    'ownerId',
    'ownerName',
    'ownerMobileNo',
    'ownerDateOfBirth',
    'ownerTypeCategory',
    'villageName',
    'arrow',
  ];
  ownerColumns = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.ownerDataSource.data =
      this.ownersList.map((owner) => ({
        ...owner,
        ownerType: owner?.ownerTypeCd ?? owner?.ownerType,
        ownerDateOfBirth: owner?.ownerDateOfBirth ?? owner?.ownerDateOfbirth,
        villageName: owner?.villageName ?? owner?.ownerVillageName,
      })) ?? [];
    if (
      this.ownerDataSource.data.some(
        (owner) => owner.ownerType === OwnerType.nonIndividual
      )
    ) {
      this.ownersType = OwnerType.nonIndividual;
      this.ownerColumns = this.nonIndividualCols;
    } else {
      this.ownersType = OwnerType.individual;
      this.ownerColumns = this.individualCols;
    }
  }

  ngAfterViewInit(): void {
    this.ownerDataSource.paginator = this.paginator;
    this.ownerDataSource.sort = this.sort;
  }

  showOwnerDetails(element: any) {
    this.showDetail.emit(element);
  }

  searchInTable(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.ownerDataSource.filter = filterValue.trim().toLowerCase();
    if (this.ownerDataSource.paginator) {
      this.ownerDataSource.paginator.firstPage();
    }
  }

  get ownerType() {
    return OwnerType;
  }
}
