import { HTMLElement, parse } from "node-html-parser"

import { parseTimestamp } from "../timestamp"
import { Segment } from "../types"

/**
 * Regular expression to detect `<html>` tag
 */
export const PATTERN_HTML_TAG = /^< *html.*?>/i

type HTMLSegmentPart = {
    cite: string
    time: string
    text: string
}

/**
 * Determines if the value of data is a valid HTML transcript format
 *
 * @param data The transcript data
 * @returns True: data is valid HTML transcript format
 */
export const isHTML = (data: string): boolean => {
    return data.startsWith("<!--") || PATTERN_HTML_TAG.exec(data) != null
}

/**
 * Updates HTML Segment parts if expected HTML segment
 *
 * @param element HTML segment to check
 * @param segmentPart Current segment parts
 * @param count Element count in parent HTML element
 * @returns Updated HTML Segment parts
 */
const updateSegmentPartFromElement = (
    element: HTMLElement,
    segmentPart: HTMLSegmentPart,
    count: number
): HTMLSegmentPart => {
    let updatedSegmentPart = segmentPart
    if (element.tagName === "CITE") {
        if (segmentPart.cite !== "") {
            console.warn(
                `Second cite element found before completing segment, discarding previous segment (element ${count}: ${element.innerHTML})`
            )
        }
        // new segment found
        updatedSegmentPart = {
            cite: element.innerHTML,
            time: "",
            text: "",
        }
    } else if (element.tagName === "TIME" && segmentPart.cite !== "") {
        if (segmentPart.time !== "") {
            console.warn(`Second time element found before completing segment (element ${count}: ${element.innerHTML})`)
        } else {
            updatedSegmentPart.time = element.innerHTML
        }
    } else if (element.tagName === "P" && segmentPart.cite !== "" && segmentPart.time !== "") {
        updatedSegmentPart.text = element.innerHTML
    }
    return updatedSegmentPart
}

/**
 * Create Segment from HTML segment parts
 *
 * @param segmentPart HTML segment data
 * @param lastSpeaker Name of last speaker. Will be used if no speaker found in `segmentLines`
 * @returns Created {@link Segment} and updated speaker
 */
const createSegmentFromSegmentPart = (
    segmentPart: HTMLSegmentPart,
    lastSpeaker: string
): { segment: Segment; speaker: string } => {
    const calculatedSpeaker = segmentPart.cite ? segmentPart.cite : lastSpeaker
    const startTime = parseTimestamp(segmentPart.time)

    const segment: Segment = {
        startTime,
        endTime: 0, // TODO: what to do with last element end time?
        speaker: calculatedSpeaker.replace(":", "").trimEnd(),
        body: segmentPart.text,
    }

    return { segment, speaker: calculatedSpeaker }
}

/**
 * Parse HTML data and create {@link Segment} for each segment data found in data
 *
 * @param elements HTML elements containing transcript data
 * @returns Segments created from HTML data
 */
const getSegmentsFromHTMLElements = (elements: Array<HTMLElement>): Array<Segment> => {
    const outSegments: Array<Segment> = []
    let lastSpeaker = ""

    let segmentPart: HTMLSegmentPart = {
        cite: "",
        time: "",
        text: "",
    }
    elements.forEach((element, count) => {
        segmentPart = updateSegmentPartFromElement(element, segmentPart, count)

        if (Object.keys(segmentPart).filter((x) => segmentPart[x] !== "").length === 3) {
            const s = createSegmentFromSegmentPart(segmentPart, lastSpeaker)
            lastSpeaker = s.speaker

            // update endTime of previous Segment
            const totalSegments = outSegments.length
            if (totalSegments > 0) {
                outSegments[totalSegments - 1].endTime = outSegments[totalSegments - 1].startTime + s.segment.startTime
            }

            outSegments.push(s.segment)

            // clear
            segmentPart = {
                cite: "",
                time: "",
                text: "",
            }
        }
    })

    return outSegments
}

/**
 * Parse HTML data to an Array of {@link Segment}
 *
 * @param data The transcript data
 * @returns An array of Segments from the parsed data
 * @throws {TypeError} When `data` is not valid HTML format
 */
export const parseHTML = (data: string): Array<Segment> => {
    const dataTrimmed = data.trim()
    let outSegments: Array<Segment> = []

    if (!isHTML(dataTrimmed)) {
        throw new TypeError(`Data is not valid HTML format`)
    }

    const html = parse(data)

    const htmlElements = html.getElementsByTagName("html")
    const htmlElement = htmlElements[0]
    const bodyElements = htmlElement.getElementsByTagName("body")
    if (bodyElements.length > 0) {
        const bodyElement = bodyElements[0]
        outSegments = getSegmentsFromHTMLElements(bodyElement.childNodes as Array<HTMLElement>)
    } else {
        outSegments = getSegmentsFromHTMLElements(htmlElement.childNodes as Array<HTMLElement>)
    }

    return outSegments
}
