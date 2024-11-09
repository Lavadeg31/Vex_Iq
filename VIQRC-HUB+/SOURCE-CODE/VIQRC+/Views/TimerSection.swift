import SwiftUI
import AVFoundation

struct TimerSection: View {
    @Binding var isRunning: Bool
    @Binding var timeRemaining: Int
    let showCountdown: Bool
    
    // Timer state
    @State private var displayTime: Int
    @State private var startTime: Date?
    @State private var pausedTime: TimeInterval = 0
    @State private var timer: Timer? = nil
    @State private var isAnimating: Bool = false
    @State private var showingCountdown: Bool = false
    @State private var countdown: Int = 3
    
    // Audio players
    @State private var countdownTimer: AVAudioPlayer?
    @State private var noCountdownTimer: AVAudioPlayer?
    
    // Add property to track audio completion
    @State private var isFinishingAudio = false
    
    init(isRunning: Binding<Bool>, timeRemaining: Binding<Int>, showCountdown: Bool) {
        self._isRunning = isRunning
        self._timeRemaining = timeRemaining
        self.showCountdown = showCountdown
        self._displayTime = State(initialValue: timeRemaining.wrappedValue)
        
        // Initialize audio players
        if let countdownURL = Bundle.main.url(forResource: "Timer", withExtension: "mp3"),
           let noCountdownURL = Bundle.main.url(forResource: "Timer2", withExtension: "mp3") {
            do {
                let countdownPlayer = try AVAudioPlayer(contentsOf: countdownURL)
                countdownPlayer.prepareToPlay()
                self._countdownTimer = State(initialValue: countdownPlayer)
                
                let noCountdownPlayer = try AVAudioPlayer(contentsOf: noCountdownURL)
                noCountdownPlayer.prepareToPlay()
                self._noCountdownTimer = State(initialValue: noCountdownPlayer)
            } catch {
                print("Error loading audio files: \(error)")
            }
        }
    }
    
    private func setupTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
            guard let start = startTime else { return }
            
            let elapsed = Date().timeIntervalSince(start) + pausedTime
            
            if showingCountdown {
                let countdownTime = 3 - Int(elapsed)
                if countdownTime >= 0 {
                    countdown = countdownTime
                } else {
                    withAnimation(.spring(response: 0.3)) {
                        showingCountdown = false
                        isRunning = true
                        displayTime = 60
                    }
                }
            } else if isRunning {
                let totalElapsed = elapsed - (showCountdown ? 3 : 0)
                let newTime = max(60 - Int(totalElapsed), 0)
                
                if newTime != displayTime {
                    displayTime = newTime
                    timeRemaining = newTime
                    
                    if displayTime <= 10 {
                        withAnimation {
                            isAnimating = true
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                                isAnimating = false
                            }
                        }
                    }
                    
                    // When timer reaches 0, let audio finish playing
                    if displayTime == 0 && !isFinishingAudio {
                        isFinishingAudio = true
                        // Wait for audio to finish before stopping everything
                        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { // Adjust delay based on your audio length
                            isRunning = false
                            timer?.invalidate()
                            timer = nil
                            countdownTimer?.stop()
                            noCountdownTimer?.stop()
                            isFinishingAudio = false
                        }
                    }
                }
            }
        }
        RunLoop.current.add(timer!, forMode: .common)
    }
    
    private func toggleTimer() {
        if !isRunning {
            // Start new timer
            if showCountdown {
                countdown = 3
                showingCountdown = true
                countdownTimer?.currentTime = 0
                countdownTimer?.play()
            } else {
                noCountdownTimer?.currentTime = 0
                noCountdownTimer?.play()
            }
            startTime = Date()
            pausedTime = 0
            setupTimer()
        } else {
            // Pause timer
            if let start = startTime {
                pausedTime += Date().timeIntervalSince(start)
            }
            timer?.invalidate()
            timer = nil
            startTime = nil
            countdownTimer?.pause()
            noCountdownTimer?.pause()
        }
        
        withAnimation(.spring(response: 0.3)) {
            isRunning.toggle()
        }
    }
    
    private func resetTimer() {
        withAnimation(.spring(response: 0.3)) {
            timer?.invalidate()
            timer = nil
            startTime = nil
            pausedTime = 0
            isRunning = false
            showingCountdown = false
            timeRemaining = 60
            displayTime = 60
            countdown = 3
            
            // Stop and reset audio
            countdownTimer?.stop()
            noCountdownTimer?.stop()
            countdownTimer?.currentTime = 0
            noCountdownTimer?.currentTime = 0
        }
    }
    
    var body: some View {
        VStack(spacing: 20) {
            ZStack {
                // Main Timer
                Text(timeString(from: displayTime))
                    .font(.system(size: 72, weight: .bold, design: .monospaced))
                    .foregroundColor(displayTime <= 10 ? .red : .primary)
                    .scaleEffect(isAnimating ? 1.1 : 1.0)
                    .opacity(showingCountdown ? 0 : 1)
                
                // Countdown
                if showingCountdown {
                    Text("\(countdown)")
                        .font(.system(size: 120, weight: .bold, design: .rounded))
                        .foregroundStyle(.green)
                }
            }
            .frame(height: 120)
            
            // Control Buttons with proper sizing
            HStack(spacing: 32) {
                Button(action: toggleTimer) {
                    Image(systemName: isRunning ? "pause.circle.fill" : "play.circle.fill")
                        .font(.system(size: 44)) // Following 44pt minimum
                        .symbolEffect(.bounce, value: isRunning)
                        .foregroundStyle(isRunning ? .red : .green)
                }
                .frame(width: 44, height: 44)
                .buttonStyle(.plain)
                .disabled(showingCountdown || isFinishingAudio)
                
                Button(action: resetTimer) {
                    Image(systemName: "arrow.clockwise.circle.fill")
                        .font(.system(size: 44))
                        .symbolEffect(.bounce, value: timeRemaining)
                        .foregroundStyle(.blue)
                }
                .frame(width: 44, height: 44)
                .buttonStyle(.plain)
                .disabled(showingCountdown || isFinishingAudio)
            }
        }
        .padding(24)
        .background(Color(.windowBackgroundColor))
        .cornerRadius(16)
    }
    
    private func timeString(from seconds: Int) -> String {
        let minutes = seconds / 60
        let remainingSeconds = seconds % 60
        return String(format: "%02d:%02d", minutes, remainingSeconds)
    }
} 