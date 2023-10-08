import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TagIdSearchValidation } from 'src/app/shared/utility/validation';

@Component({
  selector: 'app-animal-search',
  templateUrl: './animal-search.component.html',
  styleUrls: ['./animal-search.component.css']
})
export class AnimalSearchComponent implements OnInit {
  searchForm!: FormGroup;
  orgsList = [];
  searchBy = '';
  errorMessage = '';
  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.searchForm = this.fb.group({
      optRadio: ['individual'],
      searchValue: ['', [Validators.required, TagIdSearchValidation]],
      orgValue: ['']
    });
  }

  getOrgDetails() {

  }

  searchResults(param) {
  }

  resetValue() {

  }

}
