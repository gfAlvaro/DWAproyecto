import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiMensajes } from './api-mensajes';

describe('ApiMensajes', () => {
  let component: ApiMensajes;
  let fixture: ComponentFixture<ApiMensajes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiMensajes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiMensajes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
