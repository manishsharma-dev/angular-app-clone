import {
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appDragAndDrop]',
  exportAs: 'appDragAndDrop',
})
export class DragAndDropDirective {
  @HostBinding('class.active') fileOver!: boolean;
  @Output() fileDropped = new EventEmitter<FileList>();
  @Input() isDisabled: boolean = false;

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt: any) {
    if (this.isDisabled) return;
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt: any) {
    if (this.isDisabled) return;
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt: any) {
    if (this.isDisabled) return;
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
    let filesList = evt.dataTransfer.files as FileList;
    if (filesList.length > 0) {
      this.fileDropped.emit(filesList);
    }
  }
}
