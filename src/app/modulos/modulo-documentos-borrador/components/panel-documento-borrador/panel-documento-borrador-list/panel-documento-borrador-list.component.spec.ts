import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDocumentoBorradorListComponent } from './panel-documento-borrador-list.component';

describe('PanelDocumentoBorradorListComponent', () => {
  let component: PanelDocumentoBorradorListComponent;
  let fixture: ComponentFixture<PanelDocumentoBorradorListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDocumentoBorradorListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDocumentoBorradorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
