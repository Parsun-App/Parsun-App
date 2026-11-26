import { provideRouter } from '@angular/router';
import { AuthorizationService } from '@features/platform/auth/authorization/services/authorization.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehouseStockOperationDialogComponent } from '@features/inventory/warehouses/components/warehouse-stock-operation-dialog/warehouse-stock-operation-dialog.component';
import { ProductApplicationService } from '@features/catalog/products/services/application/product-application.service';
import { ProductApiService } from '@features/catalog/products/services/api/product-api.service';
import { WarehouseApplicationService } from '@features/inventory/warehouses/services/application/warehouse-application.service';
import { StockOverviewApiService } from '@features/inventory/warehouses/services/api/stock-overview-api.service';

describe('WarehouseStockOperationDialogComponent', () => {
  let fixture: ComponentFixture<WarehouseStockOperationDialogComponent>;
  let component: WarehouseStockOperationDialogComponent;
  const warehouseService = {
    getStock: vi
      .fn()
      .mockReturnValue(
        of([{ productId: 'p1', productName: 'Motor', composite: false, quantity: 10 }]),
      ),
    addEntry: vi.fn().mockReturnValue(of(undefined)),
    addExit: vi.fn().mockReturnValue(of(undefined)),
  };
  const productService = {
    getById: vi.fn().mockReturnValue(
      of({
        id: 'p2',
        name: 'Kit eléctrico',
        composite: true,
        components: [
          {
            id: 'pc1',
            componentProductId: 'p1',
            componentProductCode: 'MOT-1',
            componentProductName: 'Motor',
            quantity: 2,
          },
        ],
      }),
    ),
  };
  const productApi = {
    getAll: vi.fn().mockReturnValue(
      of({
        content: [
          {
            id: 'p1',
            code: 'MOT-1',
            name: 'Motor',
            categoryId: 'cat-1',
            categoryName: 'Motores',
            composite: false,
            active: true,
            purchasePrice: 25,
            productPrices: [],
            deletable: true,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        number: 0,
      }),
    ),
  };
  const stockOverviewApi = {
    getOverview: vi.fn().mockReturnValue(
      of({
        groupBy: 'NONE',
        summary: {
          productCount: 1,
          warehouseCount: 1,
          totalQuantity: 10,
          reservedQuantity: 0,
          availableQuantity: 10,
        },
        warehouses: [],
        categories: [],
        stock: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
        },
        groups: null,
      }),
    ),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WarehouseStockOperationDialogComponent],
      providers: [
        provideRouter([]),
        { provide: AuthorizationService, useValue: { can: () => true } },
        { provide: WarehouseApplicationService, useValue: warehouseService },
        { provide: ProductApplicationService, useValue: productService },
        { provide: ProductApiService, useValue: productApi },
        { provide: StockOverviewApiService, useValue: stockOverviewApi },
        MessageService,
      ],
    });
    fixture = TestBed.createComponent(WarehouseStockOperationDialogComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('warehouseId', 'wh-1');
  });

  it('loads stock when opened', () => {
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(warehouseService.getStock).toHaveBeenCalledWith('wh-1');
    expect(component.stock()).toHaveLength(1);
  });

  it('submits an entry through the warehouse service', () => {
    fixture.componentRef.setInput('operation', 'entry');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.lines.at(0).patchValue({ productId: 'p1', quantity: 2 });

    component.submit();

    expect(warehouseService.addEntry).toHaveBeenCalledWith('wh-1', {
      items: [{ productId: 'p1', quantity: 2 }],
    });
  });

  it('submits an exit through the warehouse service', () => {
    fixture.componentRef.setInput('operation', 'exit');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.lines.at(0).patchValue({ productId: 'p1', quantity: 2 });

    component.submit();

    expect(warehouseService.addExit).toHaveBeenCalledWith('wh-1', {
      items: [{ productId: 'p1', quantity: 2 }],
    });
  });

  it('shows the components consumed by a composite entry', () => {
    fixture.componentRef.setInput('operation', 'entry');
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    component.lines.at(0).patchValue({ productId: 'p2', quantity: 3 });

    component.onProductSelected('p2');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Producto compuesto');
    expect(fixture.nativeElement.textContent).toContain('6 × Motor');
  });

  it('opens the product picker for a line', () => {
    component.openProductPicker(0);

    expect(component.pickerVisible()).toBe(true);
    expect(component.pickerLineIndex()).toBe(0);
  });

  it('fills the line with the product selected in the picker', () => {
    component.onProductsPicked([
      {
        product: {
          id: 'p1',
          code: 'MOT-1',
          name: 'Motor',
          categoryName: 'Motores',
          active: true,
          composite: false,
          price: 25,
          totalStock: 10,
          stockItems: [],
        },
        quantity: 1,
        unitPrice: 25,
        allocations: [],
      },
    ]);

    expect(component.lines.at(0).get('productId')?.value).toBe('p1');
    expect(component.lines.at(0).get('unitPrice')?.value).toBe(25);
    expect(component.productLabel('p1')).toBe('Motor');
  });
});
