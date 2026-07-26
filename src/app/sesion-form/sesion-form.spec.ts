import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SesionForm } from './sesion-form';

describe('SesionForm', () => {
  let component: SesionForm;
  let fixture: ComponentFixture<SesionForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SesionForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SesionForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
