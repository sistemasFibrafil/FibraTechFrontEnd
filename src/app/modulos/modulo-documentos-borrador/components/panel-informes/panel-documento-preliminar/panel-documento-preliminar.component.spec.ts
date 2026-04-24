import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelDocumentoPreliminarComponent } from './panel-documento-preliminar.component';

describe('PanelDocumentoPreliminarComponent', () => {
  let component: PanelDocumentoPreliminarComponent;
  let fixture: ComponentFixture<PanelDocumentoPreliminarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelDocumentoPreliminarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelDocumentoPreliminarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
