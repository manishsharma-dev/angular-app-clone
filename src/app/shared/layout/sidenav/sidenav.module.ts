import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidenavComponent } from './sidenav.component';

@NgModule({
  declarations: [ SidenavComponent ],
  exports: [ SidenavComponent ],
  imports: [ CommonModule ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SideNavModule {}
