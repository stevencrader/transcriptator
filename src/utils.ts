const PATTERN_SPEAKER = /^(?<speaker>.+?): (?<body>.*)/

export const parseSpeaker = (data: string): { speaker: string; message: string } => {
    let speaker = ""
    let message = data
    const speakerMatch = PATTERN_SPEAKER.exec(data)
    if (speakerMatch !== null) {
        speaker = speakerMatch.groups.speaker
        message = speakerMatch.groups.body
    }
    return { speaker, message }
}
