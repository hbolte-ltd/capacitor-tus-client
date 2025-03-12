import Foundation

@objc public class CapacitorTusClient: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
