import { describe, expect, test } from "@jest/globals"
import { parseSRT, parseSRTSegment, SRTSegment } from "../src/formats/srt"
import {
    readFile,
    saveSegmentsToFile,
    TRANSCRIPT_SRT_BUZZCAST,
    TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
    TRANSCRIPT_SRT_PODCASTING_20,
    TRANSCRIPT_SRT_PODCASTING_20_OUTPUT
} from "./test_utils"

describe("SRT segment data", () => {
    test.each<{
        data: Array<string>
        expected: SRTSegment
        id: string
    }>([
        {
            data: [
                "1",
                "00:00:00,780 --> 00:00:06,210",
                "Adam Curry: podcasting 2.0 March",
                "4 2023 Episode 124 on D flat",
            ],
            expected: {
                index: 1,
                startTime: 0.78,
                endTime: 6.21,
                speaker: "Adam Curry",
                body: "podcasting 2.0 March\n4 2023 Episode 124 on D flat",
            },
            id: "comma, 2 line",
        },
        {
            data: ["1", "00:00:00.780 --> 00:00:06.210", "Adam Curry: podcasting 2.0 March"],
            expected: {
                index: 1,
                startTime: 0.78,
                endTime: 6.21,
                speaker: "Adam Curry",
                body: "podcasting 2.0 March",
            },
            id: "period, 1 line",
        },
        {
            data: ["1", "00:00:00,780 --> 00:00:06,210", "podcasting 2.0 March", "4 2023 Episode 124 on D flat"],
            expected: {
                index: 1,
                startTime: 0.78,
                endTime: 6.21,
                speaker: "",
                body: "podcasting 2.0 March\n4 2023 Episode 124 on D flat",
            },
            id: "no speaker",
        },
        {
            data: [
                "1",
                "00:00:00,780 --> 00:00:06,210",
                "Adam Curry: podcasting 2.0 March",
                "4 2023 Episode 124 on D flat",
                "",
                "2",
            ],
            expected: {
                index: 1,
                startTime: 0.78,
                endTime: 6.21,
                speaker: "Adam Curry",
                body: "podcasting 2.0 March\n4 2023 Episode 124 on D flat",
            },
            id: "includes separator line",
        },
        {
            data: [
                "1",
                "00:00:00,780 --> 00:00:17,070",
                "Adam Curry: podcasting 2.0 March",
                "4 2023 Episode 124 on D flat",
                "formable hello everybody welcome",
                "to a delayed board meeting of",
                "podcasting 2.0 preserving,",
                "protecting and extending the",
            ],
            expected: {
                index: 1,
                startTime: 0.78,
                endTime: 17.07,
                speaker: "Adam Curry",
                body: "podcasting 2.0 March\n4 2023 Episode 124 on D flat\nformable hello everybody welcome\nto a delayed board meeting of\npodcasting 2.0 preserving,\nprotecting and extending the",
            },
            id: "large body",
        },
    ])("SRT Segment ($id)", ({ data, expected, id }) => {
        expect(parseSRTSegment(data)).toEqual(expected)
    })
})

describe("Undefined SRT segment data", () => {
    test.each<{
        data: Array<string>
        id: string
    }>([
        { data: [], id: "Empty" },
        { data: [""], id: "Single Empty" },
        {
            data: [
                "",
                "00:00:00,780 --> 00:00:06,210",
                "Adam Curry: podcasting 2.0 March",
                "4 2023 Episode 124 on D flat",
            ],
            id: "missing index",
        },
    ])("SRT Segment Undefined ($id)", ({ data, id }) => {
        expect(() => parseSRTSegment(data)).toThrow(Error)
    })
})

describe("Parse SRT file data", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        id: string
    }>([
        {
            filePath: TRANSCRIPT_SRT_BUZZCAST,
            expectedFilePath: TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
            id: "Buzzcast",
        },
        {
            filePath: TRANSCRIPT_SRT_PODCASTING_20,
            expectedFilePath: TRANSCRIPT_SRT_PODCASTING_20_OUTPUT,
            id: "Podcasting 2.0",
        },
    ])("Parse SRT File ($id)", ({ filePath, expectedFilePath, id }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = parseSRT(data)
        saveSegmentsToFile(segments, `${id}_srt.json`) // TODO: remove this
        expect(segments).toEqual(expectedJSONData.segments)
    })
})
