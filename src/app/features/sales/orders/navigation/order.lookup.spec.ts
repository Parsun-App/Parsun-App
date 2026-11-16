import { Injector } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { ORDER_LOOKUP } from '@features/sales/orders/navigation/order.lookup';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { OrderList } from '@features/sales/orders/models/interfaces/order-list.interface';
import { LookupFilterSources } from '@core/layouts/models/lookup-definition.model';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

const customerDraft: OrderList = {
  id: 'ord-001',
  orderNumber: 'ORD-001',
  customerAlias: 'Cliente Portal',
  customerId: 'customer-1',
  status: OrderStatus.CUSTOMER_DRAFT,
  totalAmount: 500,
  createdAt: '2026-01-01T00:00:00Z',
};

function pageOf(content: OrderList[]): PagedResponse<OrderList> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function lookupInjector(getAll: ReturnType<typeof vi.fn>): Injector {
  return { get: () => ({ getAll }) } as unknown as Injector;
}

function filterSources(actionLabel?: string): LookupFilterSources {
  return { values: {}, categories: [], registers: [], roles: [], actionLabel };
}

describe('ORDER_LOOKUP', () => {
  it('loads only customer drafts when the action is assign stock', () => {
    const getAll = vi.fn().mockReturnValue(of(pageOf([customerDraft])));

    ORDER_LOOKUP.load(lookupInjector(getAll), {
      label: 'Asignar stock',
      search: '',
      page: 0,
      size: 10,
      filters: { status: 'ALL' },
    }).subscribe();

    expect(getAll).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      search: undefined,
      status: OrderStatus.CUSTOMER_DRAFT,
    });
  });

  it('maps the customer draft status to its translation key', () => {
    const getAll = vi.fn().mockReturnValue(of(pageOf([customerDraft])));
    let description = '';

    ORDER_LOOKUP.load(lookupInjector(getAll), {
      label: 'Asignar stock',
      search: '',
      page: 0,
      size: 10,
      filters: {},
    }).subscribe((result) => {
      description = result.items[0].description;
    });

    expect(description).toBe('Cliente Portal · navigation.options.customerDraft');
  });

  it('defaults to drafts for actions without a document action', () => {
    const getAll = vi.fn().mockReturnValue(of(pageOf([customerDraft])));

    ORDER_LOOKUP.load(lookupInjector(getAll), {
      label: 'Ver detalle',
      search: '',
      page: 0,
      size: 10,
      filters: {},
    }).subscribe();

    expect(getAll).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      search: undefined,
      status: 'DRAFTS',
    });
  });

  it('honours the status filter for regular actions', () => {
    const getAll = vi.fn().mockReturnValue(of(pageOf([customerDraft])));

    ORDER_LOOKUP.load(lookupInjector(getAll), {
      label: 'Ver detalle',
      search: '',
      page: 0,
      size: 10,
      filters: { status: OrderStatus.CONFIRMED },
    }).subscribe();

    expect(getAll).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      search: undefined,
      status: OrderStatus.CONFIRMED,
    });
  });

  it('requests the delete action when deleting', () => {
    const getAll = vi.fn().mockReturnValue(of(pageOf([customerDraft])));

    ORDER_LOOKUP.load(lookupInjector(getAll), {
      label: 'Eliminar',
      search: 'ORD',
      page: 1,
      size: 5,
      filters: {},
    }).subscribe();

    expect(getAll).toHaveBeenCalledWith({
      page: 1,
      size: 5,
      search: 'ORD',
      action: 'DELETE',
    });
  });

  it('restricts the status filter to customer drafts when assigning stock', () => {
    const filters = ORDER_LOOKUP.filters(filterSources('Asignar stock'));

    expect(filters).toHaveLength(1);
    expect(filters[0].defaultValue).toBe(OrderStatus.CUSTOMER_DRAFT);
    expect(filters[0].options.map((option) => option.value)).toEqual([
      OrderStatus.CUSTOMER_DRAFT,
    ]);
  });

  it('keeps every status option for the remaining actions', () => {
    const filters = ORDER_LOOKUP.filters(filterSources('Ver detalle'));

    expect(filters[0].defaultValue).toBe('');
    expect(filters[0].options.map((option) => option.value)).toEqual([
      '',
      OrderStatus.DRAFT,
      OrderStatus.CUSTOMER_DRAFT,
      OrderStatus.CONFIRMED,
      OrderStatus.CANCELLED,
      OrderStatus.INVOICED,
    ]);
  });
});
