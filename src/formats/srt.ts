import { parseSpeaker } from "../speaker"
import { parseTimestamp } from "../timestamp"
import { PATTERN_LINE_SEPARATOR, Segment } from "../types"

export type SRTSegment = {
    index: number
    startTime: number
    endTime: number
    speaker: string
    body: string
}

const createSegmentFromSRTLines = (
    segmentLines: Array<string>,
    lastSpeaker: string
): { segment: Segment; lastSpeaker: string } => {
    const srtSegment = parseSRTSegment(segmentLines)
    const calculatedLastSpeaker = srtSegment.speaker ? srtSegment.speaker : lastSpeaker
    const segment: Segment = {
        startTime: srtSegment.startTime,
        endTime: srtSegment.endTime,
        speaker: calculatedLastSpeaker,
        body: srtSegment.body,
    }
    return { segment, lastSpeaker: calculatedLastSpeaker }
}

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
                    lastSpeaker = s.lastSpeaker
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
            lastSpeaker = s.lastSpeaker
            outSegments.push(s.segment)
        } catch (e) {
            console.error(`Error parsing final SRT segment lines: ${e}`)
            console.error(segmentLines)
        }
    }
    return outSegments
}

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
