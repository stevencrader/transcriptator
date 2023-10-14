import { HTMLElement, parse } from "node-html-parser"

import { addSegment } from "../segments"
import { parseTimestamp, TimestampFormatter } from "../timestamp"
import { Segment } from "../types"

/**
 * Regular expression to detect `<html>` tag
 */
const PATTERN_HTML_TAG = /^< *html.*?>/i

/**
 * Regular expression to detect transcript data where `<time>` is followed by `<p>`
 */
const PATTERN_HTML_TIME_P = /(?<time><time>\d[\d:.,]*?<\/time>)[ \t\r\n]*?(?<body><p>.*?<\/p>)/i

/**
 * Regular expression to detect transcript data where `<p>` is followed by `<time>`
 */
const PATTERN_HTML_P_TIME = /(?<body><p>.*?<\/p>)[ \t\r\n]*?(?<time><time>\d[\d:.,]*?<\/time>)/i

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
    return (
        data.startsWith("<!--") ||
        PATTERN_HTML_TAG.test(data) ||
        PATTERN_HTML_TIME_P.test(data) ||
        PATTERN_HTML_P_TIME.test(data)
    )
}

/**
 * Updates HTML Segment parts if expected HTML segment
 *
 * @param element HTML segment to check
 * @param segmentPart Current segment parts
 * @returns Updated HTML Segment part and segment data for next segment (if fields encountered)
 */
const updateSegmentPartFromElement = (
    element: HTMLElement,
    segmentPart: HTMLSegmentPart,
): {
    current: HTMLSegmentPart
    next: HTMLSegmentPart
} => {
    const currentSegmentPart = segmentPart
    const nextSegmentPart: HTMLSegmentPart = {
        cite: "",
        time: "",
        text: "",
    }

    if (element.tagName === "CITE") {
        if (currentSegmentPart.cite === "") {
            currentSegmentPart.cite = element.innerHTML
        } else {
            nextSegmentPart.cite = element.innerHTML
        }
    } else if (element.tagName === "TIME") {
        if (currentSegmentPart.time === "") {
            currentSegmentPart.time = element.innerHTML
        } else {
            nextSegmentPart.time = element.innerHTML
        }
    } else if (element.tagName === "P") {
        if (currentSegmentPart.text === "") {
            currentSegmentPart.text = element.innerHTML
        } else {
            nextSegmentPart.text = element.innerHTML
        }
    }
    return { current: currentSegmentPart, next: nextSegmentPart }
}

/**
 * Create Segment from HTML segment parts
 *
 * @param segmentPart HTML segment data
 * @param lastSpeaker Name of last speaker. Will be used if no speaker found in `segmentLines`
 * @returns Created segment
 */
const createSegmentFromSegmentPart = (segmentPart: HTMLSegmentPart, lastSpeaker: string): Segment => {
    const calculatedSpeaker = segmentPart.cite ? segmentPart.cite : lastSpeaker
    const startTime = parseTimestamp(segmentPart.time)

    return {
        startTime,
        startTimeFormatted: TimestampFormatter.format(startTime),
        endTime: 0,
        endTimeFormatted: TimestampFormatter.format(0),
        speaker: calculatedSpeaker.replace(":", "").trimEnd(),
        body: segmentPart.text,
    }
}

/**
 * Parse HTML data and create {@link Segment} for each segment data found in data
 *
 * @param elements HTML elements containing transcript data
 * @returns Segments created from HTML data
 */
const getSegmentsFromHTMLElements = (elements: Array<HTMLElement>): Array<Segment> => {
    let outSegments: Array<Segment> = []
    let lastSpeaker = ""

    let segmentPart: HTMLSegmentPart = {
        cite: "",
        time: "",
        text: "",
    }
    let nextSegmentPart: HTMLSegmentPart = {
        cite: "",
        time: "",
        text: "",
    }

    elements.forEach((element, count) => {
        const segmentParts = updateSegmentPartFromElement(element, segmentPart)
        segmentPart = segmentParts.current
        nextSegmentPart = segmentParts.next

        if (
            count === elements.length - 1 ||
            Object.keys(nextSegmentPart).filter((x) => nextSegmentPart[x] === "").length !== 3
        ) {
            // time is required
            if (segmentPart.time === "") {
                console.warn(`Segment ${count} does not contain time information, ignoring`)
            } else {
                const segment = createSegmentFromSegmentPart(segmentPart, lastSpeaker)
                lastSpeaker = segment.speaker

                // update endTime of previous Segment
                const totalSegments = outSegments.length
                if (totalSegments > 0) {
                    outSegments[totalSegments - 1].endTime = segment.startTime
                    outSegments[totalSegments - 1].endTimeFormatted = TimestampFormatter.format(
                        outSegments[totalSegments - 1].endTime,
                    )
                }

                outSegments = addSegment(segment, outSegments)
            }

            // clear
            segmentPart = nextSegmentPart
            nextSegmentPart = {
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

    if (!isHTML(dataTrimmed)) {
        throw new TypeError(`Data is not valid HTML format`)
    }

    const html = parse(data)

    let root: HTMLElement
    const htmlElements = html.getElementsByTagName("html")
    if (htmlElements.length === 0) {
        root = html
    } else {
        const htmlElement = htmlElements[0]
        const bodyElements = htmlElement.getElementsByTagName("body")
        if (bodyElements.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            root = bodyElements[0]
        } else {
            root = htmlElement
        }
    }

    return getSegmentsFromHTMLElements(root.childNodes as Array<HTMLElement>)
}
