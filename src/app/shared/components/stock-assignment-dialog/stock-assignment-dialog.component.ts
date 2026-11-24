import { LocalizedNumberPipe } from '@core/i18n/localized-format.pipe';
import { TranslatePipe } from '@core/i18n/translate.pipe';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnChanges,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { DialogHeaderComponent } from '@shared/components/ui/dialog-header/dialog-header.component';
import { WarehouseStockEntry } from '@shared/components/warehouse-stock-dialog/warehouse-stock-entry.interface';
import { OrderApiService } from '@features/sales/orders/services/api/order-api.service';
import { QuoteApiService } from '@features/sales/quotes/services/api/quote-api.service';
import { OrderDetails } from '@features/sales/orders/models/interfaces/order-details.interface';
import { QuoteDetails } from '@features/sales/quotes/models/interfaces/quote-details.interface';

export type StockDocumentType = 'order' | 'quote';

export interface StockAssignmentLine {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  entries: WarehouseStockEntry[];
}

export interface StockAssignmentLineState {
  total: number;
  matches: boolean;
  overStock: boolean;
}

const QUANTITY_TOLERANCE = 0.000001;

const nonNegative = (value: number): number => Math.max(0, value);

@Component({
  selector: 'app-stock-assignment-dialog',
  standalone: true,
  imports: [
    TranslatePipe,
    LocalizedNumberPipe,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    DialogHeaderComponent,
  ],
  templateUrl: './stock-assignment-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockAssignmentDialogComponent implements OnChanges {
  private readonly orderApi = inject(OrderApiService);
  private readonly quoteApi = inject(QuoteApiService);
  private readonly messages = inject(MessageService);

  readonly documentType = input.required<StockDocumentType>();
  readonly documentId = input.required<string>();

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly documentNumber = signal('');
  readonly notes = signal<string | null>(null);
  readonly lines = signal<StockAssignmentLine[]>([]);

  readonly lineStates = computed<StockAssignmentLineState[]>(() =>
    this.lines().map((line) => {
      const total = line.entries.reduce((sum, entry) => sum + entry.allocated, 0);
      return {
        total,
        matches: Math.abs(total - line.quantity) < QUANTITY_TOLERANCE,
        overStock: line.entries.some((entry) => entry.allocated > entry.available),
      };
    }),
  );

  readonly isValid = computed(
    () =>
      this.lines().length > 0 &&
      this.lineStates().every((state) => state.matches && !state.overStock),
  );

  ngOnChanges(): void {
    this.load();
  }

  updateAllocation(lineIndex: number, entryIndex: number, value: number | null): void {
    this.lines.update((lines) =>
      lines.map((line, currentLine) => {
        if (currentLine !== lineIndex) return line;
        return {
          ...line,
          entries: line.entries.map((entry, currentEntry) => {
            if (currentEntry !== entryIndex) return entry;
            const requested =
              value === null || value === undefined || !Number.isFinite(value) ? 0 : value;
            const allocated = Math.max(0, Math.min(requested, entry.available));
            return { ...entry, allocated };
          }),
        };
      }),
    );
  }

  save(): void {
    if (!this.isValid() || this.saving()) return;
    this.saving.set(true);
    const id = this.documentId();
    const onSuccess = () => {
      this.saving.set(false);
      this.messages.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'sales.stockAssignment.saveSuccess',
        life: 3000,
      });
      this.saved.emit();
    };
    const onError = () => {
      this.saving.set(false);
      this.messages.add({
        severity: 'error',
        summary: 'Error',
        detail: 'sales.stockAssignment.saveError',
        life: 5000,
      });
    };

    if (this.documentType() === 'order') {
      this.orderApi
        .update(id, {
          notes: this.notes(),
          lines: this.lines().map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            warehouseAllocations: line.entries
              .filter((entry) => entry.allocated > 0)
              .map((entry) => ({
                warehouseId: entry.warehouseId,
                allocated: entry.allocated,
              })),
          })),
        })
        .subscribe({ next: onSuccess, error: onError });
      return;
    }

    this.quoteApi
      .update(id, {
        notes: this.notes(),
        lines: this.lines().map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          warehouseAllocations: line.entries
            .filter((entry) => entry.allocated > 0)
            .map((entry) => ({
              warehouseId: entry.warehouseId,
              allocatedQuantity: entry.allocated,
            })),
        })),
      })
      .subscribe({ next: onSuccess, error: onError });
  }

  close(): void {
    this.cancelled.emit();
  }

  private load(): void {
    const id = this.documentId();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.lines.set([]);
    const onError = () => {
      this.loading.set(false);
      this.error.set('sales.stockAssignment.loadError');
    };

    if (this.documentType() === 'order') {
      this.orderApi.getById(id).subscribe({
        next: (details) => {
          this.applyOrder(details);
          this.loading.set(false);
        },
        error: onError,
      });
      return;
    }

    this.quoteApi.getById(id).subscribe({
      next: (details) => {
        this.applyQuote(details);
        this.loading.set(false);
      },
      error: onError,
    });
  }

  private applyOrder(order: OrderDetails): void {
    this.documentNumber.set(`#${order.orderNumber}`);
    if (order.status !== 'CUSTOMER_DRAFT') {
      this.error.set('sales.stockAssignment.onlyCustomerDraft');
      return;
    }
    this.notes.set(order.notes);
    this.lines.set(
      order.items.map((item) => {
        const allocations = new Map(
          item.warehouseAllocations.map((allocation) => [
            allocation.warehouseId,
            allocation.allocated,
          ]),
        );
        return {
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          entries: (item.warehouseStocks ?? []).map((stock) => ({
            warehouseId: stock.warehouseId,
            warehouseCode: stock.warehouseCode,
            warehouseName: stock.warehouseName,
            quantity: stock.quantity,
            reserved: stock.reserved,
            available: nonNegative(stock.available),
            allocated: allocations.get(stock.warehouseId) ?? 0,
          })),
        };
      }),
    );
  }

  private applyQuote(quote: QuoteDetails): void {
    this.documentNumber.set(`#${quote.quoteNumber}`);
    if (quote.status !== 'CUSTOMER_DRAFT') {
      this.error.set('sales.stockAssignment.onlyCustomerDraft');
      return;
    }
    this.notes.set(quote.notes);
    this.lines.set(
      quote.lines.map((line) => {
        const allocations = new Map(
          line.allocations.map((allocation) => [
            allocation.warehouseId,
            allocation.allocatedQuantity,
          ]),
        );
        return {
          productId: line.productId,
          productName: line.productName,
          productCode: line.productCode,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          entries: (line.warehouseStocks ?? []).map((stock) => ({
            warehouseId: stock.warehouseId,
            warehouseCode: '',
            warehouseName: stock.warehouseName,
            quantity: nonNegative(stock.available),
            reserved: 0,
            available: nonNegative(stock.available),
            allocated: allocations.get(stock.warehouseId) ?? 0,
          })),
        };
      }),
    );
  }
}
