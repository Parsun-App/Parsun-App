import { Injector } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { QUOTE_LOOKUP } from '@features/sales/quotes/navigation/quote.lookup';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';
import { QuoteList } from '@features/sales/quotes/models/interfaces/quote-list.interface';
import { LookupFilterSources } from '@core/layouts/models/lookup-definition.model';
import { PagedResponse } from '@shared/models/interfaces/paged-response.interface';

const customerDraft: QuoteList = {
  id: 'quote-001',
  quoteNumber: 'COT-001',
  customerName: 'Cliente Portal',
  customerRif: 'J-12345678-9',
  status: QuoteStatus.CUSTOMER_DRAFT,
  subtotal: 500,
  expiryDate: '2026-02-01',
  createdBy: null,
  createdByName: null,
  createdAt: '2026-01-01T00:00:00Z',
};

function pageOf(content: QuoteList[]): PagedResponse<QuoteList> {
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

describe('QUOTE_LOOKUP', () => {
  it('loads only customer drafts when the action is assign stock', () => {
    const getAll = vi.fn().mockReturnValue(of(pageOf([customerDraft])));

    QUOTE_LOOKUP.load(lookupInjector(getAll), {
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
      status: QuoteStatus.CUSTOMER_DRAFT,
    });
  });

  it('maps the customer draft status to its translation key', () => {
    const getAll = vi.fn().mockReturnValue(of(pageOf([customerDraft])));
    let description = '';

    QUOTE_LOOKUP.load(lookupInjector(getAll), {
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

    QUOTE_LOOKUP.load(lookupInjector(getAll), {
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

    QUOTE_LOOKUP.load(lookupInjector(getAll), {
      label: 'Ver detalle',
      search: '',
      page: 0,
      size: 10,
      filters: { status: QuoteStatus.CONVERTED_TO_ORDER },
    }).subscribe();

    expect(getAll).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      search: undefined,
      status: QuoteStatus.CONVERTED_TO_ORDER,
    });
  });

  it('restricts the status filter to customer drafts when assigning stock', () => {
    const filters = QUOTE_LOOKUP.filters(filterSources('Asignar stock'));

    expect(filters).toHaveLength(1);
    expect(filters[0].defaultValue).toBe(QuoteStatus.CUSTOMER_DRAFT);
    expect(filters[0].options.map((option) => option.value)).toEqual([
      QuoteStatus.CUSTOMER_DRAFT,
    ]);
  });

  it('keeps every status option for the remaining actions', () => {
    const filters = QUOTE_LOOKUP.filters(filterSources('Ver detalle'));

    expect(filters[0].defaultValue).toBe('');
    expect(filters[0].options.map((option) => option.value)).toEqual([
      '',
      QuoteStatus.DRAFT,
      QuoteStatus.CUSTOMER_DRAFT,
      QuoteStatus.CONVERTED_TO_ORDER,
      QuoteStatus.CONVERTED_TO_INVOICE,
      QuoteStatus.CANCELLED,
    ]);
  });
});
