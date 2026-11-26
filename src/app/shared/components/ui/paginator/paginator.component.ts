import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
} from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

const CLOSEABLE_OVERLAY_SELECTOR =
  '.p-select-overlay, .p-multiselect-overlay, .p-datepicker-panel, .p-menu-overlay';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [PaginatorModule],
  templateUrl: './paginator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class PaginatorComponent {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly first = input(0);
  readonly rows = input(10);
  readonly totalRecords = input(0);
  readonly rowsPerPageOptions = input<number[]>([10, 25, 50]);
  readonly showCurrentPageReport = input(true);
  readonly currentPageReportTemplate = input('');
  readonly styleClass = input('');
  readonly dropdownAppendTo = input<string | 'body'>('body');
  readonly showPageLinks = input(true);
  readonly showFirstLastIcon = input(true);
  readonly nativeRowsSelector = input(false);

  readonly pageChange = output<PaginatorState>();

  onNativeRowsChange(event: Event): void {
    const rows = Number((event.target as HTMLSelectElement).value);
    this.pageChange.emit({
      first: 0,
      rows,
      page: 0,
      pageCount: Math.max(1, Math.ceil(this.totalRecords() / rows)),
    });
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    const overlays = this.host.nativeElement.ownerDocument.querySelectorAll(
      CLOSEABLE_OVERLAY_SELECTOR,
    );
    const overlay = (Array.from(overlays) as Element[]).find((element) =>
      this.isVisible(element),
    );
    if (!overlay) return;
    this.host.nativeElement.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, view: window }),
    );
  }

  private isVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }
}
