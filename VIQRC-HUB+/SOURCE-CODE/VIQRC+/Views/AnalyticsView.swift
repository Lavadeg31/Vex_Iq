import SwiftUI
import Charts

struct AnalyticsView: View {
    let scores: [Score]
    @State private var selectedMode: String? = nil
    
    // Score Distribution Data
    private struct DistributionData: Identifiable {
        let id = UUID()
        let range: String
        let count: Int
        let mode: String
    }
    
    // Progress Data
    private struct ProgressData: Identifiable {
        let id = UUID()
        let attempt: Int
        let score: Int
        let mode: String
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) { // Increased spacing for better readability
                // Mode Selection
                Picker("Mode", selection: $selectedMode) {
                    Text("All Modes").tag(Optional<String>.none)
                    Text("Teamwork").tag(Optional("teamwork"))
                    Text("Skills").tag(Optional("skills"))
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .frame(height: 44) // Following Apple's minimum touch target size
                
                // Stats Overview
                StatsOverview(
                    averageScore: filteredScores.map(\.value).average,
                    highScore: filteredScores.map(\.value).max() ?? 0,
                    totalAttempts: filteredScores.count,
                    mode: selectedMode?.capitalized ?? "All Modes"
                )
                
                // Score History Chart
                VStack(alignment: .leading, spacing: 16) {
                    Text("Score History")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    Chart(filteredScores.enumerated().map { index, score in
                        ProgressData(attempt: index + 1, score: score.value, mode: score.mode)
                    }) { data in
                        LineMark(
                            x: .value("Attempt", data.attempt),
                            y: .value("Score", data.score)
                        )
                        .foregroundStyle(by: .value("Mode", data.mode))
                    }
                    .frame(minHeight: 200)
                    .chartXAxis {
                        AxisMarks(values: .automatic) { value in
                            AxisGridLine()
                            AxisTick()
                            AxisValueLabel {
                                if let attempt = value.as(Int.self) {
                                    Text("#\(attempt)")
                                        .font(.system(size: 11)) // Apple's minimum text size
                                }
                            }
                        }
                    }
                    .chartForegroundStyleScale([
                        "teamwork": Color.blue,
                        "skills": Color.green
                    ])
                }
                .padding()
                .background(Color(.windowBackgroundColor))
                .cornerRadius(12)
                
                HStack(spacing: 20) {
                    // Score Distribution Chart
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Score Distribution")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        Chart(getScoreDistribution()) { item in
                            BarMark(
                                x: .value("Range", item.range),
                                y: .value("Count", item.count)
                            )
                            .foregroundStyle(by: .value("Mode", item.mode))
                        }
                        .frame(minHeight: 200)
                    }
                    .padding()
                    .background(Color(.windowBackgroundColor))
                    .cornerRadius(12)
                    
                    // Progress Chart
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Score Progression")
                            .font(.headline)
                            .padding(.horizontal)
                        
                        Chart(getProgressData()) { item in
                            LineMark(
                                x: .value("Attempt", item.attempt),
                                y: .value("Score", item.score)
                            )
                            .foregroundStyle(by: .value("Mode", item.mode))
                        }
                        .frame(minHeight: 200)
                    }
                    .padding()
                    .background(Color(.windowBackgroundColor))
                    .cornerRadius(12)
                }
            }
            .padding(24)
        }
    }
    
    private var filteredScores: [Score] {
        if let selectedMode = selectedMode {
            return scores.filter { $0.mode == selectedMode }
        }
        return scores
    }
    
    private func getScoreDistribution() -> [DistributionData] {
        let binSize = 5
        var teamworkBins: [Int: Int] = [:]
        var skillsBins: [Int: Int] = [:]
        
        scores.enumerated().forEach { _, score in
            let bin = (score.value / binSize) * binSize
            if score.mode == "teamwork" {
                teamworkBins[bin, default: 0] += 1
            } else {
                skillsBins[bin, default: 0] += 1
            }
        }
        
        var distribution: [DistributionData] = []
        
        // Add teamwork bins
        for (bin, count) in teamworkBins.sorted(by: { $0.key < $1.key }) {
            distribution.append(DistributionData(
                range: "\(bin)-\(bin + binSize - 1)",
                count: count,
                mode: "teamwork"
            ))
        }
        
        // Add skills bins
        for (bin, count) in skillsBins.sorted(by: { $0.key < $1.key }) {
            distribution.append(DistributionData(
                range: "\(bin)-\(bin + binSize - 1)",
                count: count,
                mode: "skills"
            ))
        }
        
        return distribution
    }
    
    private func getProgressData() -> [ProgressData] {
        return scores.enumerated().map { index, score in
            ProgressData(
                attempt: index + 1,
                score: score.value,
                mode: score.mode
            )
        }
    }
}

// Helper extension for calculating averages
extension Array where Element == Int {
    var average: Double {
        isEmpty ? 0 : Double(reduce(0, +)) / Double(count)
    }
}
