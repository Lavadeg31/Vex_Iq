import SwiftUI
import Metal

@main
struct VIQRC_App: App {
    init() {
        #if DEBUG
        UserDefaults.standard.set(false, forKey: "MVK_CONFIG_DEBUG")
        UserDefaults.standard.set(false, forKey: "MTL_DEBUG_LAYER")
        #endif
        
        let devices = MTLCopyAllDevices()
        if devices.first(where: { $0.isLowPower }) != nil {
            // Use the integrated device if needed
        }
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .windowStyle(.hiddenTitleBar)
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(replacing: .newItem) { }
            CommandGroup(replacing: .undoRedo) { }
            
            CommandMenu("Calculator") {
                Button("Add Score") {
                    NotificationCenter.default.post(
                        name: Notification.Name("AddScore"),
                        object: nil
                    )
                }
                .keyboardShortcut("s", modifiers: [.command])
                
                Button("Reset Values") {
                    NotificationCenter.default.post(
                        name: Notification.Name("ResetValues"),
                        object: nil
                    )
                }
                .keyboardShortcut("r", modifiers: [.command])
            }
        }
    }
}
