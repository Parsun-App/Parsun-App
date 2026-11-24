import { map } from 'rxjs';
import {
  LookupDefinition,
  LookupFilterDefinition,
  LookupFilterOption,
} from '@core/layouts/models/lookup-definition.model';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { OrderStatus } from '@features/sales/orders/models/enums/order-status.enum';
import { documentListAction } from '@shared/models/document-list-action';
import {
  lookupDescription,
  lookupStatusKey,
  pageLookupResult,
} from '@shared/utils/navigation-lookup';

const STOCK_ACTION_LABEL = 'Asignar stock';

const option = (label: string, value: string) => ({ label, value });

const ORDER_STATUS_OPTIONS = [
  option('navigation.options.all', ''),
  option('navigation.options.draft', OrderStatus.DRAFT),
  option('navigation.options.customerDraft', OrderStatus.CUSTOMER_DRAFT),
  option('navigation.options.confirmed', OrderStatus.CONFIRMED),
  option('navigation.options.cancelled', OrderStatus.CANCELLED),
  option('navigation.options.invoiced', OrderStatus.INVOICED),
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

export const ORDER_LOOKUP: LookupDefinition = {
  route: '/sales/orders',
  load: (injector, query) => {
    const api = injector.get(OrderApiService);
    const stockAction = query.label === STOCK_ACTION_LABEL;
    const action = documentListAction(query.label);
    const requestedAction = action === 'DELETE' ? 'DELETE' : undefined;
    const listAction = stockAction || action === 'CANCEL' ? undefined : action;
    const status = stockAction ? OrderStatus.CUSTOMER_DRAFT : query.filters['status'] || 'DRAFTS';
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
            label: item.orderNumber,
            description: lookupDescription(item.customerAlias, lookupStatusKey(item.status)),
          })),
        ),
      );
  },
  filters: (sources) =>
    sources.actionLabel === STOCK_ACTION_LABEL
      ? [
          statusFilter(
            [option('navigation.options.customerDraft', OrderStatus.CUSTOMER_DRAFT)],
            OrderStatus.CUSTOMER_DRAFT,
          ),
        ]
      : [statusFilter(ORDER_STATUS_OPTIONS, '')],
  recordRoutes: {
    detail: (id: string) => ['/sales/orders', id],
    edit: (id: string) => ['/sales/orders', id, 'edit'],
  },
};
