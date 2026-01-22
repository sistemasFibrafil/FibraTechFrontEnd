import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelGuiaListComponent } from './panel-guia-list.component';

describe('PanelGuiaListComponent', () => {
  let component: PanelGuiaListComponent;
  let fixture: ComponentFixture<PanelGuiaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanelGuiaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanelGuiaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
