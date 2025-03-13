# @hbolte/capacitor-tus-client

Capacitor plugin for implementing the [Tus](https://tus.io/) resumable upload protocol. This plugin is designed to address key challenges when working with large file uploads in a Capacitor environment.

### Motivation

Handling large files in Capacitor-based apps is challenging due to the nature of the bridge, parsing and transferring large amounts of data from native to the web can cause performance and OOM issues

This plugin aims to resolve this issue by **handling uploads natively**, leveraging the Tus protocol to facilitate reliable and resumable file uploads. It avoids the memory-management pitfalls of transferring large data through the Capacitor bridge, offering a stable and efficient solution for uploading large files.

Key functionality provided by the plugin:
- **Resumable Uploads**: Uploads can reliably resume after interruptions like network failures.
- **Native Upload Management**: Handles uploads completely on the native layer, bypassing memory-related concerns of the webview.
- **Concurrent Uploads**: Allows multiple files to be uploaded simultaneously, improving efficiency and performance.
- **Pause and Resume**: Manage ongoing uploads with the ability to pause and resume as needed.
- **Abort Uploads**: Gracefully terminate uploads.
- **Flexible Configuration**: Customize upload endpoints, headers, metadata, chunk sizes, and MIME types supported by the file picker.

---

## Install

```bash
npm install @hbolte/capacitor-tus-client
npx cap sync
```

## Compatibility

| Plugin Version | Supported Capacitor Version |
|---------------| --- |
| `1.x`         | Capacitor `v7` |

---

## Example Usage

### File Selection & Upload Creation

```typescript
import { CapacitorTusClient } from '@hbolte/capacitor-tus-client';

// Use any available file picker
const fileResult = await FilePicker.pickFiles({
  types: ['video/mp4'],
});

const file = fileResult.files[0];

// Create an upload
const uploadResult = await CapacitorTusClient.upload({
  uri: file.path,
  endpoint: 'https://your-server.com/uploads',
  headers: { Authorization: 'Bearer YOUR_TOKEN' },
  metadata: { filename: fileResult.name },
  chunkSize: 5242880, // 5 MB chunks
});

console.log('Upload ID:', uploadResult.uploadId);
```

### Using Listeners
Listeners allow you to track the state of an upload operation, such as its progress, success, or failure. Here's how to use them:

```typescript
// Add a listener for upload progress
CapacitorTusClient.addListener('onProgress', (data) => {
  if (data.uploadId === activeUploadId) {
    const progress = data.progress.toFixed(2);
  }
});

// Add a listener for upload success
CapacitorTusClient.addListener('onSuccess', (data) => {
  if (data.uploadId === activeUploadId) {
    alert(`Upload complete! File URL: ${data.uploadUrl}`);
  }
});

// Add a listener for upload errors
CapacitorTusClient.addListener('onError', (data) => {
  if (data.uploadId === activeUploadId) {
    alert(`Upload failed. Error: ${data.error}`);
  }
});
```

### Pause, Resume, and Abort

```typescript
// Pause an upload
await CapacitorTusClient.pause({ uploadId: 'your-upload-id' });

// Resume the same upload
await CapacitorTusClient.resume({ uploadId: 'your-upload-id' });

// Abort the upload
await CapacitorTusClient.abort({ uploadId: 'your-upload-id' });
```

---

## API

<docgen-index>

* [`upload(...)`](#upload)
* [`pause(...)`](#pause)
* [`resume(...)`](#resume)
* [`abort(...)`](#abort)
* [`addListener(K, ...)`](#addlistenerk-)
* [Interfaces](#interfaces)
* [Type Aliases](#type-aliases)
* [Enums](#enums)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Represents the Capacitor TUS Client Plugin, which
provides methods to manage file uploads and integrates various events.

### upload(...)

```typescript
upload(options: UploadOptions) => Promise<UploadResult>
```

Creates a TUS upload.

| Param         | Type                                                    | Description                               |
| ------------- | ------------------------------------------------------- | ----------------------------------------- |
| **`options`** | <code><a href="#uploadoptions">UploadOptions</a></code> | Configuration options for the TUS upload. |

**Returns:** <code>Promise&lt;<a href="#uploadresult">UploadResult</a>&gt;</code>

--------------------


### pause(...)

```typescript
pause(options: { uploadId: string; }) => Promise<{ success: boolean; message: string; }>
```

Pauses an ongoing upload.

| Param         | Type                               | Description                    |
| ------------- | ---------------------------------- | ------------------------------ |
| **`options`** | <code>{ uploadId: string; }</code> | The ID of the upload to pause. |

**Returns:** <code>Promise&lt;{ success: boolean; message: string; }&gt;</code>

--------------------


### resume(...)

```typescript
resume(options: { uploadId: string; }) => Promise<{ success: boolean; }>
```

Resumes an existing upload.

| Param         | Type                               | Description                     |
| ------------- | ---------------------------------- | ------------------------------- |
| **`options`** | <code>{ uploadId: string; }</code> | The ID of the upload to resume. |

**Returns:** <code>Promise&lt;{ success: boolean; }&gt;</code>

--------------------


### abort(...)

```typescript
abort(options: { uploadId: string; }) => Promise<void>
```

Aborts an ongoing upload.

| Param         | Type                               | Description                    |
| ------------- | ---------------------------------- | ------------------------------ |
| **`options`** | <code>{ uploadId: string; }</code> | The ID of the upload to abort. |

--------------------


### addListener(K, ...)

```typescript
addListener<K extends ListenerType>(eventType: K, listener: (data: ListenerDataMap[K]) => void) => Promise<PluginListenerHandle>
```

Adds a listener for specific upload events (start, progress, success, or error).

| Param           | Type                                               | Description                                        |
| --------------- | -------------------------------------------------- | -------------------------------------------------- |
| **`eventType`** | <code>K</code>                                     | The type of the event to listen to.                |
| **`listener`**  | <code>(data: ListenerDataMap[K]) =&gt; void</code> | The callback to execute when the event is emitted. |

**Returns:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------


### Interfaces


#### UploadResult

Represents the result of a successful upload operation.
Contains information necessary to reference or manage the uploaded resource.

| Prop           | Type                | Description                                                                                                                                                  |
| -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`uploadId`** | <code>string</code> | A unique identifier for the created upload. This ID is typically used to reference or manage the upload (e.g., resuming, pausing, or completing the upload). |


#### UploadOptions

Represents the configuration options for an upload operation.
This interface defines the necessary and optional properties that
govern the upload behavior.

| Prop            | Type                                                            | Description                                                                                                                                                                               |
| --------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`uri`**       | <code>string</code>                                             | The URI (Uniform Resource Identifier) of the selected file. This is a unique identifier used to locate the file within the system or application.                                         |
| **`endpoint`**  | <code>string</code>                                             | The API endpoint URL or path where the upload requests will be sent. It specifies the destination for the upload operation.                                                               |
| **`headers`**   | <code><a href="#record">Record</a>&lt;string, string&gt;</code> | An optional object specifying HTTP headers to be sent with the upload request. Each key represents a header name, and the corresponding value is the header value.                        |
| **`metadata`**  | <code><a href="#record">Record</a>&lt;string, string&gt;</code> | An optional object containing metadata to be associated with the upload. The metadata is represented as key-value pairs, where both keys and values are strings.                          |
| **`chunkSize`** | <code>number</code>                                             | The size of each data chunk, in bytes, to be processed and transferred during the upload. This property is optional, but when set, it is typically used for chunked or resumable uploads. |


#### PluginListenerHandle

| Prop         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |


#### ListenerDataMap

Maps listener types to their respective data payload interfaces.

| Prop                            | Type                                                                      |
| ------------------------------- | ------------------------------------------------------------------------- |
| **`[ListenerType.OnStart]`**    | <code><a href="#onstartlistenerdata">OnStartListenerData</a></code>       |
| **`[ListenerType.OnProgress]`** | <code><a href="#onprogresslistenerdata">OnProgressListenerData</a></code> |
| **`[ListenerType.OnSuccess]`**  | <code><a href="#onsuccesslistenerdata">OnSuccessListenerData</a></code>   |
| **`[ListenerType.OnError]`**    | <code><a href="#onerrorlistenerdata">OnErrorListenerData</a></code>       |


#### OnStartListenerData

Represents the event payload emitted when an upload starts.

| Prop           | Type                                                            | Description                                           |
| -------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| **`uploadId`** | <code>string</code>                                             | A unique identifier for the upload session.           |
| **`context`**  | <code><a href="#record">Record</a>&lt;string, string&gt;</code> | Optional metadata/context associated with the upload. |


#### OnProgressListenerData

Represents the event payload emitted during an upload progress update.

| Prop                | Type                                                            | Description                                           |
| ------------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| **`uploadId`**      | <code>string</code>                                             | A unique identifier for the upload session.           |
| **`progress`**      | <code>number</code>                                             | The current progress of the upload as a percentage.   |
| **`bytesUploaded`** | <code>number</code>                                             | The total number of bytes already uploaded.           |
| **`totalBytes`**    | <code>number</code>                                             | The total size of the file being uploaded, in bytes.  |
| **`context`**       | <code><a href="#record">Record</a>&lt;string, string&gt;</code> | Optional metadata/context associated with the upload. |


#### OnSuccessListenerData

Represents the event payload emitted when an upload succeeds.

| Prop            | Type                                                            | Description                                           |
| --------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| **`uploadId`**  | <code>string</code>                                             | A unique identifier for the upload session.           |
| **`uploadUrl`** | <code>string</code>                                             | The URL of the uploaded file or resource.             |
| **`context`**   | <code><a href="#record">Record</a>&lt;string, string&gt;</code> | Optional metadata/context associated with the upload. |


#### OnErrorListenerData

Represents the event payload emitted when an upload fails.

| Prop           | Type                                                            | Description                                           |
| -------------- | --------------------------------------------------------------- | ----------------------------------------------------- |
| **`uploadId`** | <code>string</code>                                             | A unique identifier for the upload session.           |
| **`error`**    | <code>string</code>                                             | Detailed error message for the failure.               |
| **`context`**  | <code><a href="#record">Record</a>&lt;string, string&gt;</code> | Optional metadata/context associated with the upload. |


### Type Aliases


#### Record

Construct a type with a set of properties K of type T

<code>{ [P in K]: T; }</code>


### Enums


#### ListenerType

| Members          | Value                     |
| ---------------- | ------------------------- |
| **`OnStart`**    | <code>'onStart'</code>    |
| **`OnProgress`** | <code>'onProgress'</code> |
| **`OnSuccess`**  | <code>'onSuccess'</code>  |
| **`OnError`**    | <code>'onError'</code>    |

</docgen-api>
