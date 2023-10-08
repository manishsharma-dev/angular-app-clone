import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-interim-report',
  templateUrl: './interim-report.component.html',
  styleUrls: ['./interim-report.component.css']
})
export class InterimReportComponent implements OnInit {
  affectedAnimalDetails = Affected_Animals_List;
  constructor() { }

  ngOnInit(): void {
  }

}
const Affected_Animals_List = [
  {
    affected_species : "Cattle",
    no_of_animals_affected : 17,
    no_of_animals_died : 5
  }
]
