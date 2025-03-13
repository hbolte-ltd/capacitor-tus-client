import Foundation
import Capacitor
import TUSKit

public class CapacitorTusClient: NSObject, TUSClientDelegate {
    private weak var plugin: CAPPlugin?
    private var tusClient: TUSClient?

    // Define constants for errors
    private let errorMissingOptions = "Missing options for the upload."
    private let errorInvalidEndpoint = "Invalid or missing 'endpoint' parameter."
    private let errorInvalidUri = "Invalid or missing 'uri' parameter."
    private let errorInvalidUploadId = "Invalid or missing 'uploadId' parameter."
    private let errorNoClient = "'TUSClient' is not initialized."
    private let errorUploadNotFound = "Upload not found for the provided ID."
    private let errorResumeFailed = "Resuming the upload failed."
    private let errorAbortFailed = "Failed to abort the upload."
    
    // Define constants for events
    private let eventOnStart = "onStart"
    private let eventOnProgress = "onProgress"
    private let eventOnSuccess = "onSuccess"
    private let eventOnFailure = "onError"

    init(plugin: CAPPlugin?) {
        self.plugin = plugin
    }

    public func upload(_ call: CAPPluginCall) {
        guard let options = call.getObject("options") else {
            call.reject(errorMissingOptions)
            return
        }

        guard let endpoint = options["endpoint"] as? String, !endpoint.isEmpty else {
            call.reject(errorInvalidEndpoint)
            return
        }

        guard let fileUri = options["uri"] as? String, !fileUri.isEmpty else {
            call.reject(errorInvalidUri)
            return
        }

        guard let filePath = URL(string: fileUri) else {
            call.reject("The 'uri' could not be parsed as a valid URL.")
            return
        }

        let metadata = options["metadata"] as? [String: String] ?? [:]
        let customHeaders = options["headers"] as? [String: String] ?? [:]
        let userChunkSize = options["chunkSize"] as? Int ?? (6 * 1024 * 1024) // Default: 6MB

        do {
            let sessionConfiguration = URLSessionConfiguration.default
            sessionConfiguration.timeoutIntervalForRequest = 60
            sessionConfiguration.timeoutIntervalForResource = 300

            let storageDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
                .appendingPathComponent("TUSUploads")

            tusClient = try TUSClient(
                server: URL(string: endpoint)!,
                sessionIdentifier: UUID().uuidString, // Unique session for each upload
                sessionConfiguration: sessionConfiguration,
                storageDirectory: storageDirectory,
                chunkSize: userChunkSize,
                supportedExtensions: [.creation, .termination]
            )

            tusClient?.delegate = self
            tusClient?.start() // Start processing uploads

            // Create a new upload
            let uploadId = try tusClient!.uploadFileAt(
                filePath: filePath,
                customHeaders: customHeaders,
                context: metadata
            )

            call.resolve([
                "uploadId": uploadId.uuidString,
                "message": "Upload started successfully."
            ])
        } catch {
            call.reject("Failed to create upload: \(error.localizedDescription)")
        }
    }

    public func pause(_ call: CAPPluginCall) {
        guard let uploadIdString = call.getString("uploadId"), let uploadId = UUID(uuidString: uploadIdString) else {
            call.reject(errorInvalidUploadId)
            return
        }

        guard let tusClient = self.tusClient else {
            call.reject(errorNoClient)
            return
        }

        // Stop processing uploads
        tusClient.stopAndCancelAll()

        do {
            guard let uploadData = try tusClient.getStoredUploads().first(where: { $0.id == uploadId }) else {
                call.reject(errorUploadNotFound)
                return
            }

            call.resolve([
                "success": true,
                "message": "Upload paused successfully.",
                "metadata": [
                    "uploadId": uploadData.id.uuidString,
                    "uploadedBytes": uploadData.uploadedRange?.count ?? 0,
                    "totalBytes": uploadData.size
                ]
            ])
        } catch {
            call.reject("Failed to pause upload: \(error.localizedDescription)")
        }
    }

    public func resume(_ call: CAPPluginCall) {
        guard let uploadIdString = call.getString("uploadId"), let uploadId = UUID(uuidString: uploadIdString) else {
            call.reject(errorInvalidUploadId)
            return
        }

        guard let tusClient = self.tusClient else {
            call.reject(errorNoClient)
            return
        }

        do {
            let hasResumed = try tusClient.resume(id: uploadId)
            if hasResumed {
                call.resolve(["success": true, "message": "Upload resumed successfully."])
            } else {
                call.reject(errorResumeFailed)
            }
        } catch {
            call.reject(errorResumeFailed)
        }
    }

    public func abort(_ call: CAPPluginCall) {
        guard let uploadIdString = call.getString("uploadId"), let uploadId = UUID(uuidString: uploadIdString) else {
            call.reject(errorInvalidUploadId)
            return
        }

        guard let tusClient = self.tusClient else {
            call.reject(errorNoClient)
            return
        }

        do {
            try tusClient.cancel(id: uploadId)
            call.resolve(["message": "Upload aborted successfully."])
        } catch {
            call.reject(errorAbortFailed)
        }
    }

    // MARK: TUSClientDelegate Methods
    public func didStartUpload(id: UUID, context: [String: String]?, client: TUSClient) {
        plugin?.notifyListeners(eventOnStart, data: ["uploadId": id.uuidString, "context": context ?? [:]])
    }

    public func didFinishUpload(id: UUID, url: URL, context: [String: String]?, client: TUSClient) {
        plugin?.notifyListeners(eventOnSuccess, data: [
            "uploadId": id.uuidString,
            "uploadUrl": url.absoluteString,
            "context": context ?? [:]
        ])
    }

    public func uploadFailed(id: UUID, error: Error, context: [String: String]?, client: TUSClient) {
        plugin?.notifyListeners(eventOnFailure, data: [
            "uploadId": id.uuidString,
            "error": error.localizedDescription,
            "context": context ?? [:]
        ])
    }

    public func fileError(error: TUSClientError, client: TUSClient) {
        plugin?.notifyListeners(eventOnFailure, data: ["error": error.localizedDescription])
    }

    public func totalProgress(bytesUploaded: Int, totalBytes: Int, client: TUSClient) {}

    public func progressFor(id: UUID, context: [String: String]?, bytesUploaded: Int, totalBytes: Int, client: TUSClient) {
        plugin?.notifyListeners(eventOnProgress, data: [
            "uploadId": id.uuidString,
            "progress": (Double(bytesUploaded) / Double(totalBytes)) * 100,
            "bytesUploaded": bytesUploaded,
            "totalBytes": totalBytes,
            "context": context ?? [:]
        ])
    }
}
