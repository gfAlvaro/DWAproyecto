import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliminarProducto } from './eliminar-producto';

describe('EliminarProducto', () => {
  let component: EliminarProducto;
  let fixture: ComponentFixture<EliminarProducto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliminarProducto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliminarProducto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
