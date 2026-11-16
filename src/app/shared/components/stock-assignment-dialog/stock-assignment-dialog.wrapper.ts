import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ActionDialogService } from '@shared/services/action-dialog.service';
import {
  StockAssignmentDialogComponent,
  StockDocumentType,
} from '@shared/components/stock-assignment-dialog/stock-assignment-dialog.component';

@Component({
  selector: 'app-stock-assignment-dialog-wrapper',
  standalone: true,
  imports: [StockAssignmentDialogComponent],
  templateUrl: './stock-assignment-dialog.wrapper.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockAssignmentDialogWrapperComponent {
  readonly recordId = input.required<string>();
  readonly resource = input.required<string>();
  readonly documentType = computed<StockDocumentType>(() =>
    this.resource() === 'quotes' ? 'quote' : 'order',
  );
  private readonly dialogs = inject(ActionDialogService);

  saved(): void {
    this.dialogs.complete(this.resource(), this.recordId());
  }

  close(): void {
    this.dialogs.close();
  }
}
