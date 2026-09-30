import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDescuentos } from './admin-descuentos';

describe('AdminDescuentos', () => {
  let component: AdminDescuentos;
  let fixture: ComponentFixture<AdminDescuentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDescuentos],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDescuentos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
