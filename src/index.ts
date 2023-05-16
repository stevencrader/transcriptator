import { isHTML, parseHTML } from "./formats/html"
import { isJSON, parseJSON } from "./formats/json"
import { isSRT, parseSRT } from "./formats/srt"
import { isVTT, parseVTT } from "./formats/vtt"
import { Segment, TranscriptFormat } from "./types"

export { Segment, TranscriptFormat } from "./types"
export { timestampFormatter, FormatterCallback } from "./timestamp"
export { Options, IOptions } from "./options"

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
