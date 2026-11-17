# Portal Web permissions and permission cleanup

## Intent

Complete the role permission catalog with every module of the customer portal and
remove the unused permission-catalog plumbing left behind by earlier dynamic
catalog work.

## Catalog

A new `PORTAL` area groups the permissions of all customer-portal modules:

| Module             | Permissions                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `PORTAL_DASHBOARD` | `VIEW`                                                                           |
| `PORTAL_PRODUCTS`  | `VIEW_LIST`, `COMMERCIAL_CATALOG_PDF`                                            |
| `PORTAL_QUOTES`    | `VIEW_LIST`, `VIEW_DETAIL`, `CREATE`, `EDIT`, `CANCEL`, `CONVERT_TO_ORDER`       |
| `PORTAL_ORDERS`    | `VIEW_LIST`, `VIEW_DETAIL`, `CREATE`, `EDIT`, `CONFIRM`, `CANCEL`                |
| `PORTAL_INVOICES`  | `VIEW_LIST`, `VIEW_DETAIL`                                                       |
| `PORTAL_PAYMENTS`  | `VIEW_LIST`, `VIEW_DETAIL`, `CREATE`, `PAY_ALL`, `PARTIAL_PAYMENT`, `PAY_DIRECT` |
| `PORTAL_PROFILE`   | `VIEW_LIST`, `EDIT`                                                              |

The registry now exposes 31 modules and 174 permission codes. The API
`PermissionRegistry`, `PermissionCatalog`, both language bundles, and
`permissions/navbar-permission-tree.json` are generated from the same source.
The role editor and notification preferences consume the mirrored static
catalog in `src/app/features/platform/auth/permissions/permission-catalog.ts`.

Portal endpoints keep using `ROLE_PORTAL_CUSTOMER`; the `PORTAL_*` codes are the
role-administration surface and are not enforced by `/api/portal/**` yet.

## Cleanup

- Removed the unused `PermissionCatalogService`, its spec, and
  `permission-catalog.model.ts`.
- Removed the legacy business-module aliases and label fallbacks from the
  notification preferences card; the card now maps current API module names
  only.
- `isRootPermission` treats any `_VIEW_LIST` or `_VIEW` code as the module
  root, covering `PORTAL_DASHBOARD_VIEW` and `COMPANY_VIEW`.

## Verification

- API main sources compile and the catalog probe reports 174 unique codes, 31
  modules, and 9 areas (`PORTAL` between `ANALYTICS` and `PLATFORM`).
- Every catalog key resolves in both `es` and `en` (796 key/language checks).
- App TypeScript compiles and the focused permissions/notifications/role tests
  pass (102 tests).
- The API test sources currently do not compile because of unrelated,
  pre-existing portal/payment test drift; the permission domain was verified
  with a standalone probe instead.
