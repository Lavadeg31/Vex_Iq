import SwiftUI

struct StatsOverview: View {
    let averageScore: Double
    let highScore: Int
    let totalAttempts: Int
    let mode: String
    
    var body: some View {
        VStack(spacing: 16) {
            Text(mode)
                .font(.headline)
                .foregroundStyle(.secondary)
            
            HStack(spacing: 20) {
                StatCard(title: "Average Score", 
                        value: String(format: "%.1f", averageScore),
                        icon: "number",
                        color: .blue)
                
                StatCard(title: "High Score",
                        value: "\(highScore)",
                        icon: "trophy",
                        color: .green)
                
                StatCard(title: "Total Attempts",
                        value: "\(totalAttempts)",
                        icon: "list.number",
                        color: .orange)
            }
        }
        .padding()
        .background(Color(.windowBackgroundColor))
        .cornerRadius(10)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: icon)
                .font(.headline)
                .foregroundStyle(color)
            
            Text(value)
                .font(.title)
                .bold()
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(10)
    }
} 