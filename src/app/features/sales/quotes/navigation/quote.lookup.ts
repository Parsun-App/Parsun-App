import { map } from 'rxjs';
import {
  LookupDefinition,
  LookupFilterDefinition,
  LookupFilterOption,
} from '@core/layouts/models/lookup-definition.model';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { QuoteStatus } from '@features/sales/quotes/models/enums/quote-status.enum';
import { documentListAction } from '@shared/models/document-list-action';
import {
  lookupDescription,
  lookupStatusKey,
  pageLookupResult,
} from '@shared/utils/navigation-lookup';

const STOCK_ACTION_LABEL = 'Asignar stock';

const option = (label: string, value: string) => ({ label, value });

const QUOTE_STATUS_OPTIONS = [
  option('navigation.options.all', ''),
  option('navigation.options.draft', QuoteStatus.DRAFT),
  option('navigation.options.customerDraft', QuoteStatus.CUSTOMER_DRAFT),
  option('navigation.options.convertedToOrder', QuoteStatus.CONVERTED_TO_ORDER),
  option('navigation.options.convertedToInvoice', QuoteStatus.CONVERTED_TO_INVOICE),
  option('navigation.options.cancelled', QuoteStatus.CANCELLED),
];

const statusFilter = (
  options: readonly LookupFilterOption[],
  defaultValue: string,
): LookupFilterDefinition => ({
  key: 'status',
  label: 'navigation.filters.status',
  options,
  defaultValue,
});

export const QUOTE_LOOKUP: LookupDefinition = {
  route: '/sales/quotes',
  load: (injector, query) => {
    const api = injector.get(QuoteApiService);
    const stockAction = query.label === STOCK_ACTION_LABEL;
    const action = documentListAction(query.label);
    const requestedAction = action === 'DELETE' ? 'DELETE' : undefined;
    const listAction = stockAction || action === 'CANCEL' ? undefined : action;
    const status = stockAction ? QuoteStatus.CUSTOMER_DRAFT : query.filters['status'] || 'DRAFTS';
    const paging = { page: query.page, size: query.size };
    return api
      .getAll(
        requestedAction
          ? { ...paging, search: query.search || undefined, action: requestedAction }
          : {
              ...paging,
              search: query.search || undefined,
              ...(listAction ? { action: listAction } : { status }),
            },
      )
      .pipe(
        map((response) =>
          pageLookupResult(response, (item) => ({
            id: item.id,
            label: item.quoteNumber,
            description: lookupDescription(item.customerName, lookupStatusKey(item.status)),
          })),
        ),
      );
  },
  filters: (sources) =>
    sources.actionLabel === STOCK_ACTION_LABEL
      ? [
          statusFilter(
            [option('navigation.options.customerDraft', QuoteStatus.CUSTOMER_DRAFT)],
            QuoteStatus.CUSTOMER_DRAFT,
          ),
        ]
      : [statusFilter(QUOTE_STATUS_OPTIONS, '')],
  recordRoutes: {
    detail: (id: string) => ['/sales/quotes', id],
    edit: (id: string) => ['/sales/quotes', id, 'edit'],
  },
};
