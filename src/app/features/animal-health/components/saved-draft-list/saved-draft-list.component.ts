import {
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import moment from 'moment';
import { EventEmitter } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SaveInDraftResponse } from '../../post-mortem/models/saveInDraftResponse.model';
import { MasterConfig } from 'src/app/shared/master.config';

@Component({
  selector: 'app-saved-draft-list',
  templateUrl: './saved-draft-list.component.html',
  styleUrls: ['./saved-draft-list.component.css'],
})
export class SavedDraftListComponent implements OnChanges, OnInit {
  masterConfig = MasterConfig;
  draftColumns = ['#', 'tagId', 'creationDate', 'openDraft'];
  draftDataSource = new MatTableDataSource<SaveInDraftResponse>([]);
  @Input() draftList: SaveInDraftResponse[] = [];
  @Output() openDraft = new EventEmitter<{
    tagId: number;
    draftId: number;
    animalId: number;
  }>();

  @ViewChild(MatSort) set sort(ms: MatSort) {
    this.draftDataSource.sort = ms;
  }

  @ViewChild('draftPaginatorRef') set paginator(mp: MatPaginator) {
    this.draftDataSource.paginator = mp;
  }

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['draftList']) {
      this.draftDataSource.data = this.draftList;
    }
  }

  ngOnInit(): void { }

  getParsedDate(date: string) {
    return moment(date).format('LT') + ' ' + moment(date).format('DD/MM/YYYY');
  }

  onOpenDraft(draftId: number, tagId: number, animalId: number) {
    this.openDraft.emit({ draftId, tagId, animalId });
  }
}
