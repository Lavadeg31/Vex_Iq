import SwiftUI

struct HistoryView: View {
    @Binding var scores: [Score]
    @State private var searchText = ""
    @State private var selectedMode: String? = nil
    @State private var sortOrder = [KeyPathComparator(\Score.date)]
    
    var body: some View {
        VStack {
            // Search and Filter Controls
            HStack {
                TextField("Search", text: $searchText)
                    .textFieldStyle(.roundedBorder)
                
                Picker("Mode", selection: $selectedMode) {
                    Text("All").tag(Optional<String>.none)
                    Text("Teamwork").tag(Optional("teamwork"))
                    Text("Skills").tag(Optional("skills"))
                }
                .pickerStyle(.segmented)
            }
            .padding()
            
            // Scores Table
            Table(filteredScores, sortOrder: $sortOrder) {
                TableColumn("Date", value: \.date) { score in
                    Text(score.date.formatted(date: .abbreviated, time: .shortened))
                }
                TableColumn("Score", value: \.value) { score in
                    Text("\(score.value)")
                        .monospacedDigit()
                }
                TableColumn("Mode", value: \.mode) { score in
                    Text(score.mode.capitalized)
                }
            }
            
            // Export/Import Controls
            HStack {
                Button("Export Scores") {
                    exportScores()
                }
                
                Button("Import Scores") {
                    importScores()
                }
                
                Button("Delete Last", role: .destructive) {
                    deleteLastScore()
                }
                .disabled(scores.isEmpty)
            }
            .padding()
        }
    }
    
    private var filteredScores: [Score] {
        scores.filter { score in
            let matchesSearch = searchText.isEmpty || 
                "\(score.value)".contains(searchText) ||
                score.mode.contains(searchText.lowercased())
            
            let matchesMode = selectedMode == nil || score.mode == selectedMode
            
            return matchesSearch && matchesMode
        }
    }
    
    private func exportScores() {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        
        guard let data = try? encoder.encode(scores),
              let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return
        }
        
        let fileURL = documentsDirectory.appendingPathComponent("scores.json")
        try? data.write(to: fileURL)
    }
    
    private func importScores() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [.json]
        panel.allowsMultipleSelection = false
        
        panel.begin { response in
            if response == .OK, let url = panel.url {
                guard let data = try? Data(contentsOf: url) else { return }
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                guard let decodedScores = try? decoder.decode([Score].self, from: data) else {
                    return
                }
                scores = decodedScores
            }
        }
    }
    
    private func deleteLastScore() {
        scores.removeLast()
    }
} 