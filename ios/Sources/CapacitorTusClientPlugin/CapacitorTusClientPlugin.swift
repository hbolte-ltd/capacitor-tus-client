import Foundation
import Capacitor
import TUSKit

@objc(CapacitorTusClientPlugin)
public class CapacitorTusClientPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "CapacitorTusClientPlugin"
    public let jsName = "CapacitorTusClient"

    // Define the plugin methods
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "upload", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pause", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "resume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "abort", returnType: CAPPluginReturnPromise)
    ]

    private var implementation: CapacitorTusClient?

    override public func load() {
        self.implementation = CapacitorTusClient(plugin: self)
    }

    @objc func upload(_ call: CAPPluginCall) {
        implementation?.upload(call)
    }

    @objc func pause(_ call: CAPPluginCall) {
        implementation?.pause(call)
    }

    @objc func resume(_ call: CAPPluginCall) {
        implementation?.resume(call)
    }

    @objc func abort(_ call: CAPPluginCall) {
        implementation?.abort(call)
    }
}
