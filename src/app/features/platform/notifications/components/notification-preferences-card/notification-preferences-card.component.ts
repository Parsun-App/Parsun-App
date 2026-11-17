import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TranslateOptionsPipe } from '@core/i18n/translate-options.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import { TranslationService } from '@core/i18n/translation.service';
import { DetailsCardHeaderComponent } from '@shared/components/details';
import { PanelCardComponent } from '@shared/components/ui/panel-card/panel-card.component';
import { PERMISSION_CATALOG } from '@features/platform/auth/permissions/permission-catalog';
import { NotificationPreferencesService } from '@features/platform/notifications/services/state/notification-preferences.service';
import { NotificationModulePreference } from '@features/platform/notifications/models/notification-preferences.model';
import {
  ListFilterChange,
  ListFilterComponent,
  ListFilterField,
  ListFilterOption,
} from '@shared/components/list/list-filter/list-filter.component';

interface GroupedModule extends NotificationModulePreference {
  labelKey: string;
}

interface CatalogModule {
  moduleKey: string;
}

interface CatalogSection {
  sectionKey: string | null;
  modules: CatalogModule[];
}

interface CatalogArea {
  areaKey: string;
  sections: CatalogSection[];
}

interface NotificationSection {
  sectionKey: string | null;
  modules: GroupedModule[];
}

interface NotificationArea {
  areaKey: string;
  sections: NotificationSection[];
}

const BUSINESS_MODULE_BY_CATALOG_KEY: Readonly<Record<string, string>> = {
  'navigation.labels.quotes': 'SALES_QUOTES',
  'navigation.labels.orders': 'SALES_ORDERS',
  'navigation.labels.purchases': 'PURCHASES',
  'navigation.labels.products': 'CATALOG_PRODUCTS',
  'navigation.labels.categories': 'CATALOG_CATEGORIES',
  'navigation.labels.priceTypes': 'CATALOG_PRICES',
  'navigation.labels.warehouses': 'INVENTORY_WAREHOUSES',
  'platform.auth.domains.sales_invoices_invoices': 'SALES_INVOICES_INVOICES',
  'platform.auth.domains.sales_invoices_returns': 'SALES_INVOICES_RETURNS',
  'platform.auth.domains.sales_invoices_credit_notes': 'SALES_INVOICES_CREDIT_NOTES',
  'platform.auth.domains.sales_invoices_debit_notes': 'SALES_INVOICES_DEBIT_NOTES',
  'navigation.labels.cashRegister': 'FINANCE_TREASURY_CASH_REGISTER',
  'navigation.labels.expenses': 'FINANCE_TREASURY_EXPENSES',
  'navigation.labels.accountsReceivable': 'FINANCE_TREASURY_RECEIVABLES',
  'navigation.labels.accountsPayable': 'FINANCE_TREASURY_PAYABLES',
  'navigation.labels.paymentMethods': 'FINANCE_TREASURY_PAYMENT_METHODS',
  'navigation.labels.customers': 'CONTACTS_CUSTOMERS',
  'navigation.labels.suppliers': 'CONTACTS_SUPPLIERS',
  'navigation.labels.dashboard': 'DASHBOARD',
  'navigation.labels.portalDashboard': 'PORTAL_DASHBOARD',
  'navigation.labels.portalProducts': 'PORTAL_PRODUCTS',
  'navigation.labels.portalQuotes': 'PORTAL_QUOTES',
  'navigation.labels.portalOrders': 'PORTAL_ORDERS',
  'navigation.labels.portalInvoices': 'PORTAL_INVOICES',
  'navigation.labels.portalPayments': 'PORTAL_PAYMENTS',
  'navigation.labels.portalProfile': 'PORTAL_PROFILE',
  'navigation.labels.users': 'USERS',
  'navigation.labels.roles': 'ROLES',
  'navigation.labels.departments': 'DEPARTMENTS',
  'navigation.labels.company': 'COMPANY',
  'navigation.labels.auditTrail': 'AUDIT_TRAIL',
};

const ALIASES: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(BUSINESS_MODULE_BY_CATALOG_KEY).map(([catalogKey, businessModule]) => [
    businessModule,
    catalogKey,
  ]),
);

@Component({
  selector: 'app-notification-preferences-card',
  standalone: true,
  imports: [
    ButtonModule,
    FormsModule,
    SelectModule,
    TranslateOptionsPipe,
    TranslatePipe,
    DetailsCardHeaderComponent,
    PanelCardComponent,
    ListFilterComponent,
    NgTemplateOutlet,
  ],
  templateUrl: './notification-preferences-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationPreferencesCardComponent {
  readonly embedded = input(false);
  readonly preferences = inject(NotificationPreferencesService);
  private readonly translations = inject(TranslationService);
  readonly selectedArea = signal<string | null>(null);
  readonly selectedModule = signal<string | null>(null);

  readonly catalog = computed<NotificationArea[]>(() => {
    const modules = this.preferences.modules().map((module) => ({
      ...module,
      labelKey: this.moduleLabelKey(module),
    }));
    const catalog = PERMISSION_CATALOG as unknown as CatalogArea[];
    return catalog
      .map((area) => ({
        ...area,
        sections: area.sections
          .map((section) => ({
            sectionKey: section.sectionKey,
            modules: this.sectionModules(section, modules),
          }))
          .filter((section) => section.modules.length > 0),
      }))
      .filter((area) => area.sections.length > 0);
  });

  readonly areaOptions = computed<readonly ListFilterOption[]>(() =>
    this.catalog().map((area) => ({ labelKey: area.areaKey, value: area.areaKey })),
  );

  readonly moduleOptions = computed<readonly ListFilterOption[]>(() => {
    const selectedArea = this.selectedArea();
    const areas = this.catalog().filter((area) => !selectedArea || area.areaKey === selectedArea);
    const modules = areas.flatMap((area) => area.sections.flatMap((section) => section.modules));
    return [...new Map(modules.map((module) => [module.labelKey, module.labelKey]))].map(
      ([value, labelKey]) => ({ value, labelKey }),
    );
  });

  readonly allModuleOptions = computed<readonly ListFilterOption[]>(() => {
    const modules = this.catalog().flatMap((area) =>
      area.sections.flatMap((section) => section.modules),
    );
    return [...new Map(modules.map((module) => [module.labelKey, module.labelKey]))].map(
      ([value, labelKey]) => ({ value, labelKey }),
    );
  });

  readonly filterFields = computed<readonly ListFilterField[]>(() => [
    {
      key: 'area',
      labelKey: 'platform.notifications.filters.module',
      type: 'select',
      value: this.selectedArea() ?? '',
      options: this.areaOptions(),
    },
    {
      key: 'module',
      labelKey: 'platform.notifications.filters.submodule',
      type: 'select',
      value: this.selectedModule() ?? '',
      options: this.moduleOptions(),
    },
  ]);

  readonly filteredCatalog = computed<NotificationArea[]>(() => {
    const selectedArea = this.selectedArea();
    const selectedModule = this.selectedModule();
    return this.catalog()
      .filter((area) => !selectedArea || area.areaKey === selectedArea)
      .map((area) => ({
        ...area,
        sections: area.sections
          .map((section) => ({
            ...section,
            modules: section.modules.filter(
              (module) => !selectedModule || module.labelKey === selectedModule,
            ),
          }))
          .filter((section) => section.modules.length > 0),
      }))
      .filter((area) => area.sections.length > 0);
  });

  readonly activeFilterCount = computed(
    () => Number(Boolean(this.selectedArea())) + Number(Boolean(this.selectedModule())),
  );

  selectOptions(field: ListFilterField): { label: string; value: string }[] {
    return (field.options ?? []).map((option) => ({ label: option.labelKey, value: option.value }));
  }

  widestLabel(field: ListFilterField): string {
    const options = field.key === 'module' ? this.allModuleOptions() : (field.options ?? []);
    return options
      .map((option) => this.translations.t(option.labelKey))
      .reduce((widest, label) => (label.length > widest.length ? label : widest), '');
  }

  onFilterChange(change: ListFilterChange): void {
    if (change.key === 'area') {
      this.setArea(change.value || null);
      return;
    }
    if (change.key === 'module') {
      this.selectedModule.set(change.value || null);
    }
  }

  setArea(area: string | null): void {
    this.selectedArea.set(area);
    if (
      this.selectedModule() &&
      !this.moduleOptions().some((option) => option.value === this.selectedModule())
    ) {
      this.selectedModule.set(null);
    }
  }

  clearFilters(): void {
    this.selectedArea.set(null);
    this.selectedModule.set(null);
  }

  private sectionModules(
    section: CatalogSection,
    modules: readonly GroupedModule[],
  ): GroupedModule[] {
    const byModule = new Map(modules.map((module) => [module.module, module]));
    return section.modules.flatMap((catalogModule) => {
      const module = BUSINESS_MODULE_BY_CATALOG_KEY[catalogModule.moduleKey];
      const preference = module ? byModule.get(module) : undefined;
      return preference ? [preference] : [];
    });
  }

  private moduleLabelKey(module: NotificationModulePreference): string {
    return ALIASES[module.module] ?? module.labelKey;
  }
}
