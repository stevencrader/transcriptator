import { isHTML, parseHTML } from "./formats/html"
import { isJSON, parseJSON } from "./formats/json"
import { isSRT, parseSRT } from "./formats/srt"
import { isVTT, parseVTT } from "./formats/vtt"
import { Segment, TranscriptFormat } from "./types"

export { Segment, TranscriptFormat } from "./types"
export { timestampFormatter, FormatterCallback } from "./timestamp"

/**
 * Regular Expression for detecting punctuation that should not be prefixed with a space
 */
const PATTERN_PUNCTUATIONS = /^ *[.,?!}\]>) *$]/

/**
 * Determines the format of transcript by inspecting the data
 *
 * @param data The transcript data
 * @returns The determined transcript format
 * @throws {TypeError} Cannot determine format of data or error parsing data
 */
export const determineFormat = (data: string): TranscriptFormat => {
    const normalizedData = data.trim()

    if (isVTT(normalizedData)) {
        return TranscriptFormat.VTT
    }

    if (isJSON(normalizedData)) {
        return TranscriptFormat.JSON
    }

    if (isHTML(normalizedData)) {
        return TranscriptFormat.HTML
    }

    if (isSRT(normalizedData)) {
        return TranscriptFormat.SRT
    }

    throw new TypeError(`Cannot determine format for data`)
}

/**
 * Convert the data to an Array of {@link Segment}
 *
 * @param data The transcript data
 * @param transcriptFormat The format of the data.
 * If undefined, will attempt to determine format using {@link determineFormat}
 * @returns An Array of Segment objects from the parsed data
 * @throws {TypeError} When `transcriptFormat` is unknown
 */
export const convertFile = (data: string, transcriptFormat: TranscriptFormat = undefined): Array<Segment> => {
    const format = transcriptFormat ?? determineFormat(data)

    const normalizedData = data.trimStart()
    let outSegments: Array<Segment> = []
    switch (format) {
        case TranscriptFormat.HTML:
            outSegments = parseHTML(normalizedData)
            break
        case TranscriptFormat.JSON:
            outSegments = parseJSON(normalizedData)
            break
        case TranscriptFormat.SRT:
            outSegments = parseSRT(normalizedData)
            break
        case TranscriptFormat.VTT:
            outSegments = parseVTT(normalizedData)
            break
        default:
            throw new TypeError(`Unknown transcript format: ${format}`)
    }

    return outSegments
}

/**
 * Append `addition` to `body` with a space.
 *
 * If `addition` matches the {@link PATTERN_PUNCTUATIONS} pattern, no space is added before the additional data.
 *
 * @param body Current body text
 * @param addition Additional text to add to `body`
 * @returns Combined data
 */
const combineBody = (body: string, addition: string): string => {
    if (body) {
        let separator = " "
        if (PATTERN_PUNCTUATIONS.exec(addition)) {
            separator = ""
        }
        return `${body}${separator}${addition}`
    }
    return addition
}

/**
 * Combine one or more {@link Segment}
 *
 * @param segments Array of Segment objects to combine
 * @returns Combined segment where:
 *
 *   - `startTime`: from first segment
 *   - `startTimeFormatted`: from first segment
 *   - `endTime`: from last segment
 *   - `endTimeFormatted`: from last segment
 *   - `speaker`: from first segment
 *   - `body`: combination of all segments
 */
const combineSegments = (segments: Array<Segment>): Segment => {
    const newSegment = segments[0]
    segments.slice(1).forEach((segment) => {
        newSegment.endTime = segment.endTime
        newSegment.body = combineBody(newSegment.body, segment.body)
    })
    return newSegment
}

/**
 * Combine an Array of Segment objects where each Segment contains only 1 word.
 *
 * Does not combine segments if the speaker changes even if the body is shorter than `maxLength`.
 *
 * @param segments Array of Segment objects to combine
 * @param maxLength Maximum length of body text for combined segment
 * @returns Array of combined segments
 * @throws {TypeError} Body value is not a single word (looks in first 20 segments)
 */
export const combineSingleWordSegments = (segments: Array<Segment>, maxLength = 32): Array<Segment> => {
    // only supported if segments are already 1 word, check first 20 segments
    const singleWordCheck = segments.slice(0, 20).filter((segment) => segment.body.includes(" "))
    if (singleWordCheck.length !== 0) {
        throw new TypeError(`Cannot combine segments with more than 1 word`)
    }

    const outSegments: Array<Segment> = []

    let combinedSegments: Array<Segment> = []
    let newBody = ""
    let lastSpeaker = ""
    segments.forEach((segment) => {
        // next segment would make too long or speaker changed
        if (
            `${newBody} ${segment.body}`.length > maxLength ||
            (lastSpeaker !== "" && lastSpeaker !== segment.speaker)
        ) {
            outSegments.push(combineSegments(combinedSegments))

            // reset
            combinedSegments = []
            newBody = ""
        }

        // buffer segment
        combinedSegments.push(segment)
        newBody = combineBody(newBody, segment.body)
        lastSpeaker = segment.speaker
    })

    // handle trailing data
    if (combinedSegments.length > 0) {
        outSegments.push(combineSegments(combinedSegments))
    }

    return outSegments
}
