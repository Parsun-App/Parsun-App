import { Provider } from '@angular/core';
import {
  ACTION_DIALOG_HANDLERS,
  ActionDialogHandlerRegistration,
} from '@shared/services/action-dialog-handlers.token';

const RESOURCES = ['orders', 'quotes'] as const;

export function provideStockAssignmentHandlers(): Provider[] {
  return RESOURCES.map((resource) => {
    const registration: ActionDialogHandlerRegistration = {
      resource,
      label: 'Asignar stock',
      load: () =>
        import('@shared/components/stock-assignment-dialog/stock-assignment-dialog.wrapper').then(
          (module) => module.StockAssignmentDialogWrapperComponent,
        ),
    };
    return { provide: ACTION_DIALOG_HANDLERS, multi: true, useValue: registration };
  });
}
