import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-final-report',
  templateUrl: './final-report.component.html',
  styleUrls: ['./final-report.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FinalReportComponent implements OnInit {
  step = 0;
  finalReportData = final_report_data;
  constructor() { }

  ngOnInit(): void {
  }
  setStep(step: number) {
    this.step = step;
  }

  downloadFinalReport() {

  }

}


const final_report_data =
{
  outbreak_id: "202104",
  case_status: "Closed",
  date_of_first_incidence: "01/01/2022",
  disease_confirmed: "Yes",
  probable_source_of_infection: "Migrated Animal",
  village: "Ambre, Aradika",
  tehsil: "Ajmer",
  district: "Ajmer",
  interim_report: [
    {
      severity_of_outbreak: "High",
      date_of_interim_report: "20/01/2022",
      action_taken: ['Targetted Surveillance', 'Vaccination in response to outbreak'],
      affected_animal_detail: [
        {
          affected_species: "Cattle",
          no_of_animals_affected: 20,
          no_of_animals_died: 15
        }
      ]
    },
    {
      severity_of_outbreak: "High",
      date_of_interim_report: "20/01/2022",
      action_taken: ['Targetted Surveillance', 'Vaccination in response to outbreak'],
      affected_animal_detail: [
        {
          affected_species: "Cattle",
          no_of_animals_affected: 10,
          no_of_animals_died: 5
        }
      ]
    },
    {
      severity_of_outbreak: "High",
      date_of_interim_report: "20/01/2022",
      action_taken: ['Targetted Surveillance', 'Vaccination in response to outbreak'],
      affected_animal_detail: [
        {
          affected_species: "Cattle",
          no_of_animals_affected: 5,
          no_of_animals_died: 3
        }
      ]
    }
  ]
}
