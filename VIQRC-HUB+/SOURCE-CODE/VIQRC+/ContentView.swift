//
//  ContentView.swift
//  VIQRC+
//
//  Created by Lars van de Griend on 11/7/24.
//

import SwiftUI
import Charts
import AVFoundation

struct ContentView: View {
    // State variables
    @State private var goals: Int = 0
    @State private var switches: Int = 0
    @State private var passes: Int = 0
    @State private var isSkillsMode: Bool = false
    @State private var isTimerEnabled: Bool = false
    @State private var showCountdown: Bool = true
    @State private var timeRemaining: Int = 60
    @State private var timerIsRunning: Bool = false
    @State private var scores: [Score] = []
    @State private var selectedTab: Int = 0
    @State private var showScoreAnimation: Bool = false
    @AppStorage(UserDefaults.scoresKey) private var scoresData: Data = Data()
    
    init() {
        _scores = State(initialValue: UserDefaults.standard.loadScores())
    }
    
    var body: some View {
        NavigationSplitView {
            List(selection: $selectedTab) {
                NavigationLink(value: 0) {
                    Label("Calculator", systemImage: "function")
                }
                NavigationLink(value: 1) {
                    Label("Analytics", systemImage: "chart.xyaxis.line")
                }
                NavigationLink(value: 2) {
                    Label("History", systemImage: "clock.arrow.circlepath")
                }
            }
            .navigationTitle("VEX IQ")
            .listStyle(.sidebar)
        } detail: {
            Group {
                switch selectedTab {
                case 0:
                    calculatorView
                case 1:
                    AnalyticsView(scores: scores)
                case 2:
                    HistoryView(scores: $scores)
                default:
                    calculatorView
                }
            }
        }
        .navigationSplitViewStyle(.balanced)
    }
    
    private var calculatorView: some View {
        HStack(spacing: 0) {
            // Left Column - Controls
            VStack(spacing: 20) {
                // Mode Toggle
                GroupBox {
                    Toggle(isOn: $isSkillsMode) {
                        Label("Skills Mode", systemImage: "gearshape.circle")
                    }
                    .toggleStyle(.button)
                    .buttonStyle(.bordered)
                    .tint(isSkillsMode ? .green : .blue)
                    .frame(maxWidth: .infinity)
                } label: {
                    Label("Mode", systemImage: "gearshape.circle")
                }
                
                // Timer Section
                GroupBox {
                    VStack(spacing: 16) {
                        TimerSection(
                            isRunning: $timerIsRunning,
                            timeRemaining: $timeRemaining,
                            showCountdown: showCountdown
                        )
                        
                        Toggle("Show Countdown", isOn: $showCountdown)
                            .toggleStyle(.switch)
                    }
                } label: {
                    Label("Timer", systemImage: "timer.circle")
                }
                
                Spacer()
            }
            .frame(width: 300)
            .padding()
            .background(Color(.windowBackgroundColor))
            
            // Right Column - Score Calculator
            ScrollView {
                VStack(spacing: 24) {
                    // Score Display
                    let currentScore = calculateScore()
                    ZStack {
                        Circle()
                            .fill(Color.accentColor.opacity(0.1))
                            .frame(width: 200, height: 200)
                        
                        VStack {
                            Text("Total Score")
                                .font(.headline)
                            Text(currentScore, format: .number)
                                .font(.system(size: 64, weight: .bold, design: .rounded))
                                .contentTransition(.numericText())
                        }
                    }
                    .scaleEffect(showScoreAnimation ? 1.1 : 1.0)
                    .animation(.spring(response: 0.3), value: currentScore)
                    
                    // Interactive Score Controls
                    VStack(spacing: 32) {
                        ScoreControl(
                            value: $goals,
                            label: "Goals",
                            systemImage: "circle.grid.cross",
                            color: .blue
                        )
                        
                        ScoreControl(
                            value: $switches,
                            label: "Switches",
                            systemImage: "power.circle",
                            color: .green,
                            maxValue: 4
                        )
                        
                        if !isSkillsMode {
                            ScoreControl(
                                value: $passes,
                                label: "Passes",
                                systemImage: "arrow.triangle.2.circlepath",
                                color: .orange
                            )
                        }
                    }
                    .padding()
                    .background(Color(.windowBackgroundColor))
                    .cornerRadius(16)
                    
                    // Add Score Button
                    Button(action: {
                        withAnimation(.spring(response: 0.3)) {
                            showScoreAnimation = true
                            addScore()
                        }
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                            showScoreAnimation = false
                        }
                    }) {
                        Label("Add Score", systemImage: "plus.circle.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.accentColor)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                    }
                    .buttonStyle(.plain)
                }
                .padding(32)
            }
        }
    }
    
    private func calculateScore() -> Int {
        var score = 0
        let matchType = isSkillsMode ? 1 : 0
        
        // Ensure values are non-negative
        let balls = max(0, goals)
        let switchCount = max(0, min(switches, 4)) // Limit switches to 0-4
        let passCount = max(0, passes)
        
        // Switch scoring key
        let switchKey = [1, 4, 8, 10, 12, 12, 12, 12, 12]
        
        // Determine scoring multipliers based on mode
        let scoreKey: [Int] = matchType == 0 
            ? [1, 1, switchKey[switchCount]] // Teamwork mode
            : [switchKey[switchCount], 1, 0] // Skills mode
        
        // Adjust passes based on rules
        var adjustedPasses = passCount
        if matchType == 0 { // Teamwork mode
            if switchCount == 0 && passCount > 4 {
                adjustedPasses = 4 // Max 4 passes if no switches
            } else if passCount > balls && switchCount != 0 {
                adjustedPasses = balls // Can't have more passes than balls with switches
            }
        }
        
        // Calculate total score
        let matchData = [balls, switchCount, adjustedPasses]
        for i in 0..<3 {
            score += matchData[i] * scoreKey[i]
        }
        
        return score
    }
    
    private func addScore() {
        let score = Score(
            value: calculateScore(),
            mode: isSkillsMode ? "skills" : "teamwork"
        )
        withAnimation {
            scores.append(score)
            UserDefaults.standard.saveScores(scores)
        }
    }
}

struct ScoreControl: View {
    @Binding var value: Int
    let label: String
    let systemImage: String
    let color: Color
    var maxValue: Int? = nil
    
    @State private var isEditing = false
    
    var body: some View {
        VStack(spacing: 12) {
            Label(label, systemImage: systemImage)
                .font(.headline)
                .foregroundStyle(color)
            
            HStack(spacing: 20) {
                // Decrement Button
                Button {
                    withAnimation(.spring(response: 0.2)) {
                        value = max(0, value - 1)
                    }
                } label: {
                    Image(systemName: "minus.circle.fill")
                        .font(.title)
                        .symbolEffect(.bounce, value: value)
                }
                .buttonStyle(.plain)
                .foregroundStyle(color)
                
                // Value Display/Input
                Text("\(value)")
                    .font(.system(size: 32, weight: .bold, design: .rounded))
                    .frame(width: 80)
                    .contentTransition(.numericText())
                    .onTapGesture {
                        isEditing.toggle()
                    }
                
                // Increment Button
                Button {
                    withAnimation(.spring(response: 0.2)) {
                        if let max = maxValue {
                            value = min(max, value + 1)
                        } else {
                            value += 1
                        }
                    }
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title)
                        .symbolEffect(.bounce, value: value)
                }
                .buttonStyle(.plain)
                .foregroundStyle(color)
            }
            .sheet(isPresented: $isEditing) {
                NumberInputSheet(value: $value, maxValue: maxValue)
            }
        }
        .padding()
        .background(color.opacity(0.1))
        .cornerRadius(12)
    }
}

struct NumberInputSheet: View {
    @Binding var value: Int
    var maxValue: Int?
    @Environment(\.dismiss) private var dismiss
    @State private var tempValue: String = ""
    
    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Value", text: $tempValue)
                        .onAppear {
                            tempValue = String(value)
                        }
                } header: {
                    if let max = maxValue {
                        Text("Enter a value (0-\(max))")
                    } else {
                        Text("Enter a value")
                    }
                }
            }
            .navigationTitle("Edit Value")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") {
                        if let newValue = Int(tempValue) {
                            if let max = maxValue {
                                let nonNegativeValue = Swift.max(0, newValue)
                                value = Swift.min(max, nonNegativeValue)
                            } else {
                                value = Swift.max(0, newValue)
                            }
                        }
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.height(200)])
    }
}

#Preview {
    ContentView()
}
