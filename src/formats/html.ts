import { parseTimestamp } from "../timestamp"
import { Segment } from "../types"
import { HTMLElement, parse } from "node-html-parser"

export const PATTERN_HTML_TAG = /^< *html *>/i

const getSegmentsFromHTMLElements = (elements: Array<HTMLElement>): Array<Segment> => {
    let outSegments: Array<Segment> = []
    let lastSpeaker = ""

    let segmentParts: {
        cite: string
        time: string
        text: string
    } = {
        cite: "",
        time: "",
        text: "",
    }
    elements.forEach((element, count) => {
        if (element.tagName === "CITE") {
            if (segmentParts.cite !== "") {
                console.warn(
                    `Second cite element found before completing segment, discarding previous segment (element ${count}: ${element.innerHTML})`
                )
            }
            // new segment found
            segmentParts = {
                cite: element.innerHTML,
                time: "",
                text: "",
            }
        } else if (element.tagName === "TIME" && segmentParts.cite !== "") {
            if (segmentParts.time !== "") {
                console.warn(
                    `Second time element found before completing segment (element ${count}: ${element.innerHTML})`
                )
            } else {
                segmentParts.time = element.innerHTML
            }
        } else if (element.tagName === "P" && segmentParts.cite !== "" && segmentParts.time !== "") {
            if (segmentParts.text !== "") {
                console.warn(
                    `Second p element found before completing segment (element ${count}: ${element.innerHTML})`
                )
            } else {
                segmentParts.text = element.innerHTML
            }
        }

        if (Object.keys(segmentParts).filter((x) => segmentParts[x] !== "").length === 3) {
            try {
                lastSpeaker = segmentParts.cite ? segmentParts.cite : lastSpeaker
                const startTime = parseTimestamp(segmentParts.time)

                // update endTime of previous Segment
                const totalSegments = outSegments.length
                if (totalSegments > 0) {
                    outSegments[totalSegments - 1].endTime = outSegments[totalSegments - 1].startTime + startTime
                }

                outSegments.push({
                    startTime: startTime,
                    endTime: 0, // TODO: what to do with last element end time?
                    speaker: lastSpeaker.replace(":", "").trimEnd(),
                    body: segmentParts.text,
                })
            } catch (e) {
                console.error(`Error parsing HTML elements (source line ${count}): ${e}`)
                console.error(segmentParts)
            }

            segmentParts = {
                cite: "",
                time: "",
                text: "",
            }
        }
    })

    return outSegments
}

export const parseHTML = (data: string): Array<Segment> => {
    const dataTrimmed = data.trim()
    let outSegments: Array<Segment> = []

    if (!(dataTrimmed.startsWith("<!--") || PATTERN_HTML_TAG.exec(dataTrimmed))) {
        throw new TypeError(`Data is not valid HTML format`)
    }

    const html = parse(data)

    const htmlElements = html.getElementsByTagName("html")
    if (htmlElements.length > 0) {
        const htmlElement = htmlElements[0]
        const bodyElements = htmlElement.getElementsByTagName("body")
        if (bodyElements.length > 0) {
            const bodyElement = bodyElements[0]
            outSegments = getSegmentsFromHTMLElements(bodyElement.childNodes as Array<HTMLElement>)
        } else {
            outSegments = getSegmentsFromHTMLElements(htmlElement.childNodes as Array<HTMLElement>)
        }
    } else {
        throw new Error(`Cannot find required parent html field`)
    }

    return outSegments
}
