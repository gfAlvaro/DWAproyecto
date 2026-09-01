import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProductos } from './admin-productos';

describe('Productos', () => {
  let component: AdminProductos;
  let fixture: ComponentFixture<AdminProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProductos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
