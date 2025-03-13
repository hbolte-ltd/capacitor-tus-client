import type {PluginListenerHandle} from "@capacitor/core";

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
 * Represents the event payload emitted when an upload starts.
 */
export interface OnStartListenerData {
  /**
   * A unique identifier for the upload session.
   *
   * @example "abc123xyz"
   */
  uploadId: string;

  /**
   * Optional metadata/context associated with the upload.
   *
   * @example
   * {
   *   "fileId": "12345",
   *   "description": "User profile image"
   * }
   */
  context?: Record<string, string>;
}

/**
 * Represents the event payload emitted during an upload progress update.
 */
export interface OnProgressListenerData {
  /**
   * A unique identifier for the upload session.
   *
   * @example "abc123xyz"
   */
  uploadId: string;

  /**
   * The current progress of the upload as a percentage.
   *
   * @example 50.5 // 50.5% completed.
   */
  progress: number;

  /**
   * The total number of bytes already uploaded.
   *
   * @example 10485760 // 10 MB.
   */
  bytesUploaded: number;

  /**
   * The total size of the file being uploaded, in bytes.
   *
   * @example 52428800 // 50 MB.
   */
  totalBytes: number;

  /**
   * Optional metadata/context associated with the upload.
   *
   * @example
   * {
   *   "fileId": "12345",
   *   "description": "User profile image"
   * }
   */
  context?: Record<string, string>;
}

/**
 * Represents the event payload emitted when an upload succeeds.
 */
export interface OnSuccessListenerData {
  /**
   * A unique identifier for the upload session.
   *
   * @example "abc123xyz"
   */
  uploadId: string;

  /**
   * The URL of the uploaded file or resource.
   *
   * @example "https://example.com/uploads/abc123xyz"
   */
  uploadUrl: string;

  /**
   * Optional metadata/context associated with the upload.
   *
   * @example
   * {
   *   "fileId": "12345",
   *   "description": "User profile image"
   * }
   */
  context?: Record<string, string>;
}

/**
 * Represents the event payload emitted when an upload fails.
 */
export interface OnErrorListenerData {
  /**
   * A unique identifier for the upload session.
   *
   * @example "abc123xyz"
   */
  uploadId: string;

  /**
   * Detailed error message for the failure.
   *
   * @example "Network timeout occurred."
   */
  error: string;

  /**
   * Optional metadata/context associated with the upload.
   *
   * @example
   * {
   *   "fileId": "12345",
   *   "description": "User profile image"
   * }
   */
  context?: Record<string, string>;
}

/**
 * Enum for the available listener types in the CapacitorTusClientPlugin.
 * These correspond to different events that might happen during the upload lifecycle.
 */
export enum ListenerType {
  OnStart = 'onStart',
  OnProgress = 'onProgress',
  OnSuccess = 'onSuccess',
  OnError = 'onError'
}

/**
 * Maps listener types to their respective data payload interfaces.
 */
export interface ListenerDataMap {
  [ListenerType.OnStart]: OnStartListenerData;
  [ListenerType.OnProgress]: OnProgressListenerData;
  [ListenerType.OnSuccess]: OnSuccessListenerData;
  [ListenerType.OnError]: OnErrorListenerData;
}

/**
 * Represents the Capacitor TUS Client Plugin, which
 * provides methods to manage file uploads and integrates various events.
 */
export interface CapacitorTusClientPlugin {
  /**
   * Creates a TUS upload.
   * @param options Configuration options for the TUS upload.
   * @returns {Promise<UploadResult>} The unique ID of the created upload.
   */
  upload(options: UploadOptions): Promise<UploadResult>;

  /**
   * Pauses an ongoing upload.
   * @param options The ID of the upload to pause.
   * @returns {Promise<{ success: boolean; message: string }>} A success response and message.
   */
  pause(options: { uploadId: string }): Promise<{ success: boolean; message: string }>;

  /**
   * Resumes an existing upload.
   * @param options The ID of the upload to resume.
   * @returns {Promise<{ success: boolean }>} A success response.
   */
  resume(options: { uploadId: string }): Promise<{ success: boolean }>;

  /**
   * Aborts an ongoing upload.
   * @param options The ID of the upload to abort.
   * @returns {Promise<void>} A void promise indicating completion.
   */
  abort(options: { uploadId: string }): Promise<void>;

  /**
   * Adds a listener for specific upload events (start, progress, success, or error).
   * @param eventType The type of the event to listen to.
   * @param listener The callback to execute when the event is emitted.
   * @returns {Promise<void>} A promise that resolves when the listener is added.
   *
   * @example
   * CapacitorTusClient.addListener(ListenerType.OnProgress, (data) => {
   *   console.log(`Upload progress: ${data.progress}%`);
   * });
   */
  addListener<K extends ListenerType>(
    eventType: K,
    listener: (data: ListenerDataMap[K]) => void
  ): Promise<PluginListenerHandle>;
}
