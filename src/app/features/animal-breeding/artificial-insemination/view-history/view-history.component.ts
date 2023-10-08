import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AnimalHistory } from '../ai-model/ai-details.model';

@Component({
  selector: 'app-view-history',
  templateUrl: './view-history.component.html',
  styleUrls: ['./view-history.component.css'],
})
export class ViewHistoryComponent implements OnInit {
  aiHistoryDisplayedColumns: string[] = [
    'aiLactationNumber',
    'aiDate',
    'bullId',
    'pdDate',
    'calvingDate',
    'aiType',
    'serviceType',
    'status',
    'actualAiNumber',
    'aiDoneBy',
  ];
  dataSource = new MatTableDataSource<AnimalHistory>();
  isLoadingSpinner: boolean = false;
  historyDetail: any;
  tagId: number;
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (!params['tagId']) {
        // this.router.navigate(['/not-found']);
        return false;
      }
      this.tagId = params['tagId'];

      return true;
    });
    this.historyDetail = {
      compDetail: 'AI',
      newPageUrl: './dashboard/animal-breeding/artificial-insemination/newai',
      tagId: this.tagId,
      isHistory: true,
      isBreed: true,
      name: 'animalBreeding.ai',
    };
  }
}
