import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDocumentoBorradorCreateComponent } from './panel-documento-borrador-create.component';

describe('PanelDocumentoBorradorCreateComponent', () => {
  let component: PanelDocumentoBorradorCreateComponent;
  let fixture: ComponentFixture<PanelDocumentoBorradorCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDocumentoBorradorCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDocumentoBorradorCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
