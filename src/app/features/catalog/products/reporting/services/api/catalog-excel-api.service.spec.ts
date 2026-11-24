import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CatalogExcelApiService } from '@features/catalog/products/reporting/services/api/catalog-excel-api.service';

describe('CatalogExcelApiService', () => {
  let service: CatalogExcelApiService;
  let httpMock: HttpTestingController;

  const mockBlob = new Blob(['excel-content'], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [CatalogExcelApiService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CatalogExcelApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('downloadExcel()', () => {
    it('should GET /api/reports/inventory/catalog/excel without filters', () => {
      service.downloadExcel({}).subscribe((result) => {
        expect(result).toBeInstanceOf(Blob);
      });

      const req = httpMock.expectOne('/api/reports/inventory/catalog/excel');
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });

    it('should GET with search filter', () => {
      service.downloadExcel({ search: 'motor' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/excel' && r.method === 'GET',
      );
      expect(req.request.params.get('search')).toBe('motor');
      req.flush(mockBlob);
    });

    it('should GET with categoryId filter', () => {
      service.downloadExcel({ categoryId: 'cat-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/excel' && r.method === 'GET',
      );
      expect(req.request.params.get('categoryId')).toBe('cat-001');
      req.flush(mockBlob);
    });

    it('should GET with warehouseId filter', () => {
      service.downloadExcel({ warehouseId: 'wh-001' }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/excel' && r.method === 'GET',
      );
      expect(req.request.params.get('warehouseId')).toBe('wh-001');
      req.flush(mockBlob);
    });

    it('should GET with withStock flag', () => {
      service.downloadExcel({ withStock: false }).subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/excel' && r.method === 'GET',
      );
      expect(req.request.params.get('withStock')).toBe('false');
      req.flush(mockBlob);
    });

    it('should GET with all filters combined', () => {
      service
        .downloadExcel({
          search: 'generator',
          categoryId: 'cat-002',
          warehouseId: 'wh-002',
          withStock: true,
        })
        .subscribe();

      const req = httpMock.expectOne(
        (r) => r.url === '/api/reports/inventory/catalog/excel' && r.method === 'GET',
      );
      expect(req.request.params.get('search')).toBe('generator');
      expect(req.request.params.get('categoryId')).toBe('cat-002');
      expect(req.request.params.get('warehouseId')).toBe('wh-002');
      expect(req.request.params.get('withStock')).toBe('true');
      req.flush(mockBlob);
    });
  });
});
