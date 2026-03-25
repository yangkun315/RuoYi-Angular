import { Injectable, signal } from '@angular/core';
import { DictDataApi } from '../api/system/dict-data.api';
import type { SysDictData } from '../core/types/api/system/dict';

@Injectable({ providedIn: 'root' })
export class DictService {
  private cache = signal<Record<string, SysDictData[]>>({});

  constructor(private dictDataApi: DictDataApi) {}

  getDicts(dictType: string) {
    const cached = this.cache()[dictType];
    if (cached) return cached;

    this.dictDataApi.getDicts(dictType).subscribe({
      next: (res) => {
        const data = (res as { data?: SysDictData[] }).data ?? [];
        this.cache.update((c) => ({ ...c, [dictType]: data }));
      }
    });
    return [];
  }

  getDictsAsync(dictType: string) {
    return this.dictDataApi.getDicts(dictType);
  }

  getLabel(dictType: string, value: string | number): string {
    const list = this.cache()[dictType] ?? [];
    const item = list.find((d) => String(d.dictValue) === String(value));
    return item?.dictLabel ?? String(value);
  }

  clearCache() {
    this.cache.set({});
  }
}
