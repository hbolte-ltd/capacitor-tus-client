import { registerPlugin } from '@capacitor/core';

import type { CapacitorTusClientPlugin } from './definitions';

const CapacitorTusClient = registerPlugin<CapacitorTusClientPlugin>('CapacitorTusClient', {
  web: () => import('./web').then((m) => new m.CapacitorTusClientWeb()),
});

export * from './definitions';
export { CapacitorTusClient };
