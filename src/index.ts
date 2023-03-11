const PATTERN_TIMESTAMP =
    /^(?<hour>\d+):(?<minute>\d+):(?<second>\d+)[,.](?<ms>\d+)$/m

export enum TranscriptType {
    HTML = "html",
    JSON = "json",
    SRT = "srt",
    VTT = "vtt",
}

export type Segment = {
    startTime: number
    endTime: number
    speaker: string
    body: string
}

export type SRTSegment = Segment & {
    index: number
}

export type JSONTranscript = {
    version: string
    segments: Array<Segment>
}

const parseHTML = (data: string): Array<Segment> => {
    const outSegments = []
    console.log("parseHTML")
    return outSegments
}

const parseSRT = (data: string): Array<Segment> => {
    const outSegments = []
    console.log("parseSRT")
    return outSegments
}

export const parseTimestamp = (value: string | number): number => {
    if (typeof value === "number") {
        return value
    } else if (typeof value !== "string") {
        throw new TypeError(`Cannot parse timestamp of type ${typeof value}}`)
    }

    const match = PATTERN_TIMESTAMP.exec(value.trim())
    if (match === null) {
        throw new TypeError(`Not enough separator fields in timestamp string`)
    }

    const hour = parseInt(match.groups.hour) * 60 * 60
    const minute = parseInt(match.groups.minute) * 60
    const second = parseInt(match.groups.second)
    let ms = parseInt(match.groups.ms)
    if (ms != 0) ms = ms / 1000

    return hour + minute + second + ms
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

    const body = lines.slice(2).join(" ")

    return {
        startTime: startTime,
        endTime: endTime,
        speaker: "",
        body: body,
        index: index,
    }
}

export const parseVTT = (data: string): Array<Segment> => {
    const outSegments = []
    console.log("parseVTT")
    return outSegments
}

export const determineType = (data: string): TranscriptType => {
    data = data.trimStart()

    if (data.startsWith("WEBVTT")) {
        return TranscriptType.VTT
    } else if (data.startsWith("{")) {
        return TranscriptType.JSON
    } else if (data.startsWith("<!--")) {
        return TranscriptType.HTML
    } else if (RegExp("^< *html *>").exec(data)) {
        return TranscriptType.HTML
    } else if (parseSRTSegment(data.split(/\r?\n/).slice(0, 5)) !== undefined) {
        return TranscriptType.SRT
    }

    throw new TypeError(`Cannot determine type for data`)
}

export const convertFile = (data: string) => {
    const transcriptType = determineType(data)

    switch (transcriptType) {
        case TranscriptType.HTML:
            parseHTML(data)
            break
        case TranscriptType.JSON:
            break
        case TranscriptType.SRT:
            parseSRT(data)
            break
        case TranscriptType.VTT:
            parseVTT(data)
            break
        default:
            throw new TypeError(`Unknown transcript type: ${transcriptType}`)
    }
}

// converter
// Optional re-format length

// detect format by looking at file contents
