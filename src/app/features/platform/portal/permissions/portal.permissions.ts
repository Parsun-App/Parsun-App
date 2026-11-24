export enum PortalDashboardPermission {
  VIEW = 'PORTAL_DASHBOARD_VIEW',
}

export enum PortalProductPermission {
  VIEW_LIST = 'PORTAL_PRODUCTS_VIEW_LIST',
  COMMERCIAL_CATALOG_PDF = 'PORTAL_PRODUCTS_COMMERCIAL_CATALOG_PDF',
}

export enum PortalQuotePermission {
  VIEW_LIST = 'PORTAL_QUOTES_VIEW_LIST',
  VIEW_DETAIL = 'PORTAL_QUOTES_VIEW_DETAIL',
  CREATE = 'PORTAL_QUOTES_CREATE',
  EDIT = 'PORTAL_QUOTES_EDIT',
  CANCEL = 'PORTAL_QUOTES_CANCEL',
  CONVERT_TO_ORDER = 'PORTAL_QUOTES_CONVERT_TO_ORDER',
}

export enum PortalOrderPermission {
  VIEW_LIST = 'PORTAL_ORDERS_VIEW_LIST',
  VIEW_DETAIL = 'PORTAL_ORDERS_VIEW_DETAIL',
  CREATE = 'PORTAL_ORDERS_CREATE',
  EDIT = 'PORTAL_ORDERS_EDIT',
  CONFIRM = 'PORTAL_ORDERS_CONFIRM',
  CANCEL = 'PORTAL_ORDERS_CANCEL',
}

export enum PortalInvoicePermission {
  VIEW_LIST = 'PORTAL_INVOICES_VIEW_LIST',
  VIEW_DETAIL = 'PORTAL_INVOICES_VIEW_DETAIL',
}

export enum PortalPaymentPermission {
  VIEW_LIST = 'PORTAL_PAYMENTS_VIEW_LIST',
  VIEW_DETAIL = 'PORTAL_PAYMENTS_VIEW_DETAIL',
  CREATE = 'PORTAL_PAYMENTS_CREATE',
  PAY_ALL = 'PORTAL_PAYMENTS_PAY_ALL',
  PARTIAL_PAYMENT = 'PORTAL_PAYMENTS_PARTIAL_PAYMENT',
  PAY_DIRECT = 'PORTAL_PAYMENTS_PAY_DIRECT',
}

export enum PortalProfilePermission {
  VIEW_LIST = 'PORTAL_PROFILE_VIEW_LIST',
  EDIT = 'PORTAL_PROFILE_EDIT',
}

export const PORTAL_DASHBOARD_PERMISSIONS = [
  {
    code: PortalDashboardPermission.VIEW,
    labelKey: 'platform.portal.permissions.dashboard.view',
  },
] as const;

export const PORTAL_PRODUCT_PERMISSIONS = [
  {
    code: PortalProductPermission.VIEW_LIST,
    labelKey: 'platform.portal.permissions.products.viewList',
  },
  {
    code: PortalProductPermission.COMMERCIAL_CATALOG_PDF,
    labelKey: 'platform.portal.permissions.products.commercialCatalogPdf',
  },
] as const;

export const PORTAL_QUOTE_PERMISSIONS = [
  {
    code: PortalQuotePermission.VIEW_LIST,
    labelKey: 'platform.portal.permissions.quotes.viewList',
  },
  {
    code: PortalQuotePermission.VIEW_DETAIL,
    labelKey: 'platform.portal.permissions.quotes.viewDetail',
  },
  { code: PortalQuotePermission.CREATE, labelKey: 'platform.portal.permissions.quotes.create' },
  { code: PortalQuotePermission.EDIT, labelKey: 'platform.portal.permissions.quotes.edit' },
  { code: PortalQuotePermission.CANCEL, labelKey: 'platform.portal.permissions.quotes.cancel' },
  {
    code: PortalQuotePermission.CONVERT_TO_ORDER,
    labelKey: 'platform.portal.permissions.quotes.convertToOrder',
  },
] as const;

export const PORTAL_ORDER_PERMISSIONS = [
  {
    code: PortalOrderPermission.VIEW_LIST,
    labelKey: 'platform.portal.permissions.orders.viewList',
  },
  {
    code: PortalOrderPermission.VIEW_DETAIL,
    labelKey: 'platform.portal.permissions.orders.viewDetail',
  },
  { code: PortalOrderPermission.CREATE, labelKey: 'platform.portal.permissions.orders.create' },
  { code: PortalOrderPermission.EDIT, labelKey: 'platform.portal.permissions.orders.edit' },
  { code: PortalOrderPermission.CONFIRM, labelKey: 'platform.portal.permissions.orders.confirm' },
  { code: PortalOrderPermission.CANCEL, labelKey: 'platform.portal.permissions.orders.cancel' },
] as const;

export const PORTAL_INVOICE_PERMISSIONS = [
  {
    code: PortalInvoicePermission.VIEW_LIST,
    labelKey: 'platform.portal.permissions.invoices.viewList',
  },
  {
    code: PortalInvoicePermission.VIEW_DETAIL,
    labelKey: 'platform.portal.permissions.invoices.viewDetail',
  },
] as const;

export const PORTAL_PAYMENT_PERMISSIONS = [
  {
    code: PortalPaymentPermission.VIEW_LIST,
    labelKey: 'platform.portal.permissions.payments.viewList',
  },
  {
    code: PortalPaymentPermission.VIEW_DETAIL,
    labelKey: 'platform.portal.permissions.payments.viewDetail',
  },
  { code: PortalPaymentPermission.CREATE, labelKey: 'platform.portal.permissions.payments.create' },
  {
    code: PortalPaymentPermission.PAY_ALL,
    labelKey: 'platform.portal.permissions.payments.payAll',
  },
  {
    code: PortalPaymentPermission.PARTIAL_PAYMENT,
    labelKey: 'platform.portal.permissions.payments.partialPayment',
  },
  {
    code: PortalPaymentPermission.PAY_DIRECT,
    labelKey: 'platform.portal.permissions.payments.payDirect',
  },
] as const;

export const PORTAL_PROFILE_PERMISSIONS = [
  {
    code: PortalProfilePermission.VIEW_LIST,
    labelKey: 'platform.portal.permissions.profile.viewList',
  },
  { code: PortalProfilePermission.EDIT, labelKey: 'platform.portal.permissions.profile.edit' },
] as const;
