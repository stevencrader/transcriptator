/**
 * Regular expression for detecting speaker in string
 */
const PATTERN_SPEAKER = /^(?<speaker>[a-z].+?): (?<body>.*)/i

/**
 * Attempt to extract the speaker's name from the data.
 *
 * Looks for the strings in the format matching {@link PATTERN_SPEAKER}
 * @param data Data to get speaker from
 * @returns The speaker (if found) and the remaining string
 */
export const parseSpeaker = (data: string): { speaker: string; message: string } => {
    let speaker = ""
    let message = data.trimStart()
    const speakerMatch = PATTERN_SPEAKER.exec(data)
    if (speakerMatch !== null) {
        speaker = speakerMatch.groups.speaker
        message = speakerMatch.groups.body
    }
    return { speaker, message }
}
