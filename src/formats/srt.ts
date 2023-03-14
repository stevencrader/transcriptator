import { parseSpeaker } from "../speaker"
import { parseTimestamp } from "../timestamp"
import { PATTERN_LINE_SEPARATOR, Segment } from "../types"

/**
 * Define a segment/cue parsed from SRT file
 */
export type SRTSegment = {
    /**
     * Cue number
     */
    index: number
    /**
     * Time (in seconds) when segment starts
     */
    startTime: number
    /**
     * Time (in seconds) when segment ends
     */
    endTime: number
    /**
     * Name of speaker for `body`
     */
    speaker: string
    /**
     * Text of transcript for segment
     */
    body: string
}

/**
 * Parse lines looking for data to be SRT format
 *
 * @param lines Lines containing SRT data
 * @returns Parsed segment
 * @throws {Error} When no non-empty strings in `lines`
 * @throws {Error} When the minimum required number of lines is not received
 * @throws {Error} When segment lines does not start with a number
 * @throws {Error} When second segment line does not follow the timestamp format
 */
export const parseSRTSegment = (lines: Array<string>): SRTSegment => {
    do {
        if (lines.length === 0) {
            throw new Error("SRT segment lines empty")
        } else if (lines[0].trim() === "") {
            lines.shift()
        } else {
            break
        }
    } while (lines.length > 0)

    if (lines.length < 3) {
        throw new Error(`SRT requires at least 3 lines, ${lines.length} received`)
    }

    const index = parseInt(lines[0], 10)
    if (!index) {
        throw new Error(`First line of SRT segment is not a number`)
    }

    const timestampLine = lines[1]
    if (!timestampLine.includes("-->")) {
        throw new Error(`SRT timestamp line does not include --> separator`)
    }
    const timestampParts = timestampLine.split("-->")
    if (timestampParts.length !== 2) {
        throw new Error(`SRT timestamp line contains more than 2 --> separators`)
    }
    const startTime = parseTimestamp(timestampParts[0].trim())
    const endTime = parseTimestamp(timestampParts[1].trim())

    let bodyLines = lines.slice(2)
    const emptyLineIndex = bodyLines.findIndex((v) => v.trim() === "")
    if (emptyLineIndex > 0) {
        bodyLines = bodyLines.slice(0, emptyLineIndex)
    }
    const { speaker, message } = parseSpeaker(bodyLines.shift())
    bodyLines = [message].concat(bodyLines)

    return {
        startTime,
        endTime,
        speaker,
        body: bodyLines.join("\n"),
        index,
    }
}

/**
 * Create Segment from lines containing an SRT segment/cue
 *
 * @param segmentLines Lines containing SRT data
 * @param lastSpeaker Name of last speaker. Will be used if no speaker found in `segmentLines`
 * @returns Created {@link Segment} and updated speaker
 */
const createSegmentFromSRTLines = (
    segmentLines: Array<string>,
    lastSpeaker: string
): { segment: Segment; speaker: string } => {
    const srtSegment = parseSRTSegment(segmentLines)
    const calculatedSpeaker = srtSegment.speaker ? srtSegment.speaker : lastSpeaker
    const segment: Segment = {
        startTime: srtSegment.startTime,
        endTime: srtSegment.endTime,
        speaker: calculatedSpeaker,
        body: srtSegment.body,
    }
    return { segment, speaker: calculatedSpeaker }
}

/**
 * Parse SRT data to an Array of {@link Segment}
 *
 * @param data The transcript data
 * @returns An array of Segments from the parsed data
 * @throws {TypeError} When `data` is not valid SRT format
 */
export const parseSRT = (data: string): Array<Segment> => {
    if (parseSRTSegment(data.split(PATTERN_LINE_SEPARATOR).slice(0, 20)) === undefined) {
        throw new TypeError(`Data is not valid SRT format`)
    }

    const outSegments: Array<Segment> = []
    let lastSpeaker = ""

    let segmentLines = []
    data.split(PATTERN_LINE_SEPARATOR).forEach((line, count) => {
        // separator line found, handle previous data
        if (line.trim() === "") {
            // handle consecutive multiple blank lines
            if (segmentLines.length !== 0) {
                try {
                    const s = createSegmentFromSRTLines(segmentLines, lastSpeaker)
                    lastSpeaker = s.speaker
                    outSegments.push(s.segment)
                } catch (e) {
                    console.error(`Error parsing SRT segment lines (source line ${count}): ${e}`)
                    console.error(segmentLines)
                }
            }

            segmentLines = [] // clear buffer
        } else {
            segmentLines.push(line)
        }
    })

    // handle data when trailing line not included
    if (segmentLines.length !== 0) {
        try {
            const s = createSegmentFromSRTLines(segmentLines, lastSpeaker)
            lastSpeaker = s.speaker
            outSegments.push(s.segment)
        } catch (e) {
            console.error(`Error parsing final SRT segment lines: ${e}`)
            console.error(segmentLines)
        }
    }
    return outSegments
}
