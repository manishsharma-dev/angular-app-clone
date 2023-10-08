import { Component, Input } from '@angular/core';

export interface BreadcrumbLink {
  label: string;
  link?: string | string[];
}

@Component({
  selector: 'app-common-breadcrumb',
  templateUrl: './common-breadcrumb.component.html',
  styleUrls: ['./common-breadcrumb.component.css'],
})
export class CommonBreadcrumbComponent {
  @Input() breadcrumbKeys: string[] = [];
  @Input() breadcrumbLinks: BreadcrumbLink[] = [];

  constructor() {}

  ngOnInit(): void {}
}
