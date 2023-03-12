import { parseTimestamp } from "../timestamp"
import { Segment } from "../types"

const PATTERN_SPEAKER = /^(?<speaker>.+?): (?<body>.*)/

export type SRTSegment = Segment & {
    index: number
}

export const parseSRT = (data: string): Array<Segment> => {
    const outSegments = []
    console.log("parseSRT")
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
        throw new Error(
            `SRT requires at least 3 lines, ${lines.length} received`
        )
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
        throw new Error(
            `SRT timestamp line contains more than 2 --> separators`
        )
    }
    const startTime = parseTimestamp(timestampParts[0].trim())
    const endTime = parseTimestamp(timestampParts[1].trim())

    let bodyLines = lines.slice(2)
    const emptyLineIndex = bodyLines.findIndex((v) => v.trim() === "")
    if (emptyLineIndex > 0) {
        bodyLines = bodyLines.slice(0, emptyLineIndex)
    }
    let body = bodyLines.join(" ")
    let speaker = ""
    const speakerMatch = PATTERN_SPEAKER.exec(body)
    if (speakerMatch !== null) {
        speaker = speakerMatch.groups.speaker
        body = speakerMatch.groups.body
    }

    return {
        startTime: startTime,
        endTime: endTime,
        speaker: speaker,
        body: body,
        index: index,
    }
}
