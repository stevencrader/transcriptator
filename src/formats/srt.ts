import { parseTimestamp } from "../timestamp"
import { PATTERN_LINE_SEPARATOR, Segment } from "../types"

const PATTERN_SPEAKER = /^(?<speaker>.+?): (?<body>.*)/

export type SRTSegment = {
    index: number
    startTime: number
    endTime: number
    speaker: string
    bodyLines: Array<string>
}

export const parseSRT = (data: string): Array<Segment> => {
    const outSegments: Array<Segment> = []
    let lastSpeaker = ""

    let segmentLines = []
    // parsing style inspired by https://github.com/byroot/pysrt
    data.split(PATTERN_LINE_SEPARATOR).forEach((line, count) => {
        if (line.trim() === "") {
            // separator line found, handle previous data
            try {
                const segment = parseSRTSegment(segmentLines)
                segment.bodyLines.forEach((line) => {
                    outSegments.push({
                        startTime: segment.startTime,
                        endTime: segment.endTime,
                        speaker: segment.speaker ? segment.speaker : lastSpeaker,
                        body: line,
                    })
                })
                lastSpeaker = segment.speaker
            } catch (e) {
                console.error(`Error parsing SRT segment lines: ${e}`)
                console.error(segmentLines)
            }

            segmentLines = [] // clear buffer
        } else {
            segmentLines.push(line)
        }
    })

    return outSegments
}

export const parseSRTSegment = (lines: Array<string>): SRTSegment => {
    do {
        if (lines.length == 0) {
            throw new Error("SRT segment lines empty")
        } else if (lines[0].trim() === "") {
            lines.shift()
        } else {
            break
        }
    } while (true)

    if (lines.length < 3) {
        throw new Error(`SRT requires at least 3 lines, ${lines.length} received`)
    }

    const index = parseInt(lines[0])
    if (!index) {
        throw new Error(`First line of SRT segment is not a number`)
    }

    const timestampLine = lines[1]
    if (!timestampLine.includes("-->")) {
        throw new Error(`SRT timestamp line does not include --> separator`)
    }
    const timestampParts = timestampLine.split("-->")
    if (timestampParts.length != 2) {
        throw new Error(`SRT timestamp line contains more than 2 --> separators`)
    }
    const startTime = parseTimestamp(timestampParts[0].trim())
    const endTime = parseTimestamp(timestampParts[1].trim())

    let bodyLines = lines.slice(2)
    const emptyLineIndex = bodyLines.findIndex((v) => v.trim() === "")
    if (emptyLineIndex > 0) {
        bodyLines = bodyLines.slice(0, emptyLineIndex)
    }
    let speaker = ""
    let firstBodyLine = bodyLines.shift()
    const speakerMatch = PATTERN_SPEAKER.exec(firstBodyLine)
    if (speakerMatch !== null) {
        speaker = speakerMatch.groups.speaker
        firstBodyLine = speakerMatch.groups.body
    }
    bodyLines = [firstBodyLine].concat(bodyLines)

    return {
        startTime: startTime,
        endTime: endTime,
        speaker: speaker,
        bodyLines: bodyLines,
        index: index,
    }
}
