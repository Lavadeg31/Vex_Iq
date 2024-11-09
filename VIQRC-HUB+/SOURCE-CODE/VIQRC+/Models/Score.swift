import Foundation

class Score: NSObject, Codable, Identifiable {
    let id: UUID
    let value: Int
    let mode: String
    let date: Date
    
    init(value: Int, mode: String) {
        self.id = UUID()
        self.value = value
        self.mode = mode
        self.date = Date()
        super.init()
    }
    
    // Codable conformance
    enum CodingKeys: String, CodingKey {
        case id
        case value
        case mode
        case date
    }
    
    required init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        value = try container.decode(Int.self, forKey: .value)
        mode = try container.decode(String.self, forKey: .mode)
        date = try container.decode(Date.self, forKey: .date)
        super.init()
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(value, forKey: .value)
        try container.encode(mode, forKey: .mode)
        try container.encode(date, forKey: .date)
    }
}

// UserDefaults extension
extension UserDefaults {
    static let scoresKey = "savedScores"
    
    func saveScores(_ scores: [Score]) {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        if let encoded = try? encoder.encode(scores) {
            UserDefaults.standard.set(encoded, forKey: UserDefaults.scoresKey)
        }
    }
    
    func loadScores() -> [Score] {
        if let data = UserDefaults.standard.data(forKey: UserDefaults.scoresKey) {
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            if let decoded = try? decoder.decode([Score].self, from: data) {
                return decoded
            }
        }
        return []
    }
} 