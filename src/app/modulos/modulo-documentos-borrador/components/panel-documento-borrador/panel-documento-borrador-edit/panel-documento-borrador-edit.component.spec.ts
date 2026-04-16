import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDocumentoBorradorEditComponent } from './panel-documento-borrador-edit.component';

describe('PanelDocumentoBorradorEditComponent', () => {
  let component: PanelDocumentoBorradorEditComponent;
  let fixture: ComponentFixture<PanelDocumentoBorradorEditComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDocumentoBorradorEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDocumentoBorradorEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should edit', () => {
    expect(component).toBeTruthy();
  });
});
