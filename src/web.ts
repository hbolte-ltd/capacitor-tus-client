import { WebPlugin } from '@capacitor/core';

import type { CapacitorTusClientPlugin } from './definitions';

export class CapacitorTusClientWeb extends WebPlugin implements CapacitorTusClientPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
