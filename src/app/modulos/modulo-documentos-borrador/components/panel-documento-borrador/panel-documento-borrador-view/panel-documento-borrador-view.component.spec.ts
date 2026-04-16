import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDocumentoBorradorViewComponent } from './panel-documento-borrador-view.component';

describe('PanelDocumentoBorradorViewComponent', () => {
  let component: PanelDocumentoBorradorViewComponent;
  let fixture: ComponentFixture<PanelDocumentoBorradorViewComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDocumentoBorradorViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDocumentoBorradorViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should view', () => {
    expect(component).toBeTruthy();
  });
});
