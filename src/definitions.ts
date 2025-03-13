/**
 * Represents the configuration options for an upload operation.
 * This interface defines the necessary and optional properties that
 * govern the upload behavior.
 */
export interface UploadOptions {
  /**
   * The URI (Uniform Resource Identifier) of the selected file.
   * This is a unique identifier used to locate the file within the system
   * or application.
   *
   * @example "content:///path/to/selected/file"
   */
  uri: string;

  /**
   * The API endpoint URL or path where the upload requests will be sent.
   * It specifies the destination for the upload operation.
   *
   * @example "https://example.com/upload" // Full URL for the upload endpoint.
   * @example "/api/uploads"              // Relative path for server API.
   */
  endpoint: string;

  /**
   * An optional object specifying HTTP headers to be sent with the upload request.
   * Each key represents a header name, and the corresponding value is the header value.
   *
   * @example
   * {
   *   "Authorization": "Bearer token123",
   *   "Content-Type": "application/json"
   * }
   */
  headers?: Record<string, string>;

  /**
   * An optional object containing metadata to be associated with the upload.
   * The metadata is represented as key-value pairs, where both keys and values are strings.
   *
   * @example
   * {
   *   "fileId": "12345",
   *   "description": "User profile image"
   * }
   */
  metadata?: Record<string, string>;

  /**
   * The size of each data chunk, in bytes, to be processed and transferred during the upload.
   * This property is optional, but when set, it is typically used for chunked or resumable uploads.
   *
   * @example 1048576 // 1 MB chunk size.
   * @example 512000  // 500 KB chunk size.
   */
  chunkSize?: number;
}

/**
 * Represents the result of a successful upload operation.
 * Contains information necessary to reference or manage the uploaded resource.
 */
export interface UploadResult {
  /**
   * A unique identifier for the created upload.
   * This ID is typically used to reference or manage the upload (e.g., resuming, pausing, or completing the upload).
   *
   * @example "abc123xyz" // A unique string identifying the upload.
   */
  uploadId: string;
}

/**
 * Enum for the available listener types in the CapacitorTusClientPlugin.
 * These correspond to different events that might happen during the upload lifecycle.
 */
export enum ListenerType {
  OnProgress = 'onProgress',
  OnSuccess = 'onSuccess',
  OnError = 'onError'
}

export interface CapacitorTusClientPlugin {
  /**
   * Creates a TUS upload.
   * @param options Configuration options for the TUS upload.
   * @returns {Promise<UploadResult>} The unique ID of the created upload.
   */
  createUpload(options: UploadOptions): Promise<UploadResult>;

  /**
   * Pauses an ongoing upload.
   * @param options The ID of the upload to pause.
   */
  pause(options: { uploadId: string }): Promise<{ success: boolean; message: string }>;

  /**
   * Resumes an existing upload.
   *
   * @param options { uploadId: string }
   */
  resume(options: { uploadId: string }): Promise<{ success: boolean }>;

  /**
   * Aborts an ongoing upload.
   *
   * @param options { uploadId: string }
   */
  abort(options: { uploadId: string }): Promise<void>;
}
