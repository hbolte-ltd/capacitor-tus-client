import { WebPlugin } from '@capacitor/core';

import type {
  CapacitorTusClientPlugin,
  UploadOptions, UploadResult
} from './definitions';

export class CapacitorTusClientWeb
  extends WebPlugin
  implements CapacitorTusClientPlugin
{
  async createUpload(options: UploadOptions): Promise<UploadResult> {
    console.error('createUpload is not implemented on web.', options);
    return Promise.reject('createUpload is only supported on native platforms.');
  }

  async pause(options: { uploadId: string }): Promise<{ success: boolean; message: string }> {
    console.error('pause not implemented for web.', options);
    throw new Error('pause not implemented for the web!');
  }

  async resume(options: { uploadId: string }): Promise<{ success: boolean }> {
    console.error('resume is not implemented on web.', options);
    return Promise.reject('resume is only supported on native platforms.');
  }

  async abort(options: { uploadId: string }): Promise<void> {
    console.error('abort is not implemented on web.', options);
    return Promise.reject('abort is only supported on native platforms.');
  }
}
