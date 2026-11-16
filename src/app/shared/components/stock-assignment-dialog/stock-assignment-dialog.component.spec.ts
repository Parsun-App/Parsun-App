import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { MessageService } from 'primeng/api';
import {
  StockAssignmentDialogComponent,
  StockDocumentType,
} from '@shared/components/stock-assignment-dialog/stock-assignment-dialog.component';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { OrderDetails } from '@features/sales/orders/models/interfaces/order-details.interface';
import { QuoteDetails } from '@features/sales/quotes/models/interfaces/quote-details.interface';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';

const quoteDetails: QuoteDetails = {
  id: 'quote-1',
  quoteNumber: 'PRE-2026-0122',
  customerId: 'customer-1',
  customerName: 'Ana Pérez',
  customerRif: 'V-12345678',
  createdBy: 'user-1',
  createdByName: 'Gabriel',
  status: QuoteStatus.CUSTOMER_DRAFT,
  notes: null,
  subtotal: 21,
  lines: [
    {
      id: 'line-1',
      productId: 'product-1',
      productName: 'Ground coffee',
      productCode: 'PRD-0001',
      quantity: 21,
      unitPrice: 1,
      subtotal: 21,
      allocations: [
        { warehouseId: 'wh-reserve', warehouseName: 'Reserve warehouse', allocatedQuantity: 21 },
      ],
      warehouseStocks: [
        { warehouseId: 'wh-reserve', warehouseName: 'Reserve warehouse', available: 57 },
        { warehouseId: 'wh-main', warehouseName: 'Main warehouse', available: -1 },
      ],
    },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const orderDetails: OrderDetails = {
  id: 'order-1',
  orderNumber: 'PED-2026-0122',
  customerId: 'customer-1',
  customerAlias: 'Ana Pérez',
  customerLegalName: 'Ana Pérez',
  status: OrderStatus.CUSTOMER_DRAFT,
  notes: null,
  totalAmount: 21,
  items: [
    {
      id: 'item-1',
      productId: 'product-1',
      productName: 'Ground coffee',
      productCode: 'PRD-0001',
      quantity: 21,
      unitPrice: 1,
      subtotal: 21,
      warehouseAllocations: [
        {
          warehouseId: 'wh-reserve',
          warehouseCode: 'RES',
          warehouseName: 'Reserve warehouse',
          available: 57,
          allocated: 21,
        },
      ],
      warehouseStocks: [
        {
          warehouseId: 'wh-reserve',
          warehouseCode: 'RES',
          warehouseName: 'Reserve warehouse',
          quantity: 57,
          reserved: 0,
          available: 57,
        },
        {
          warehouseId: 'wh-main',
          warehouseCode: 'MAIN',
          warehouseName: 'Main warehouse',
          quantity: 0,
          reserved: 1,
          available: -1,
        },
      ],
    },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('StockAssignmentDialogComponent', () => {
  const orderApi = { getById: vi.fn(), update: vi.fn() };
  const quoteApi = { getById: vi.fn(), update: vi.fn() };

  beforeEach(() => {
    orderApi.getById.mockReturnValue(of(orderDetails));
    quoteApi.getById.mockReturnValue(of(quoteDetails));

    TestBed.configureTestingModule({
      providers: [
        { provide: OrderApiService, useValue: orderApi },
        { provide: QuoteApiService, useValue: quoteApi },
        { provide: MessageService, useValue: { add: vi.fn() } },
      ],
    });
  });

  function create(
    documentType: StockDocumentType,
    documentId: string,
  ): StockAssignmentDialogComponent {
    const fixture = TestBed.createComponent(StockAssignmentDialogComponent);
    fixture.componentRef.setInput('documentType', documentType);
    fixture.componentRef.setInput('documentId', documentId);
    fixture.componentInstance.ngOnChanges();
    return fixture.componentInstance;
  }

  it('normalizes negative availability to zero for quotes', () => {
    const component = create('quote', quoteDetails.id);
    const main = component.lines()[0].entries.find((entry) => entry.warehouseId === 'wh-main');

    expect(main?.available).toBe(0);
  });

  it('normalizes negative availability to zero for orders', () => {
    const component = create('order', orderDetails.id);
    const main = component.lines()[0].entries.find((entry) => entry.warehouseId === 'wh-main');

    expect(main?.available).toBe(0);
  });

  it('does not flag over stock when the exact quantity is assigned', () => {
    const component = create('quote', quoteDetails.id);
    const [state] = component.lineStates();

    expect(state.total).toBe(21);
    expect(state.matches).toBe(true);
    expect(state.overStock).toBe(false);
    expect(component.isValid()).toBe(true);
  });

  it('keeps allocations on warehouses without availability at zero', () => {
    const component = create('quote', quoteDetails.id);

    component.updateAllocation(0, 1, 5);

    expect(component.lines()[0].entries[1].allocated).toBe(0);
    expect(component.lineStates()[0].overStock).toBe(false);
  });

  it('clears an empty allocation to zero without going negative', () => {
    const component = create('quote', quoteDetails.id);

    component.updateAllocation(0, 1, null);

    expect(component.lines()[0].entries[1].allocated).toBe(0);
    expect(component.isValid()).toBe(true);
  });

  it('caps allocations at the available stock', () => {
    const component = create('quote', quoteDetails.id);

    component.updateAllocation(0, 0, 1000);

    expect(component.lines()[0].entries[0].allocated).toBe(57);
  });
});
