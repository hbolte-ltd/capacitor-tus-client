// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "HbolteCapacitorTusClient",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "HbolteCapacitorTusClient",
            targets: ["CapacitorTusClientPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "CapacitorTusClientPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/CapacitorTusClientPlugin"),
        .testTarget(
            name: "CapacitorTusClientPluginTests",
            dependencies: ["CapacitorTusClientPlugin"],
            path: "ios/Tests/CapacitorTusClientPluginTests")
    ]
)