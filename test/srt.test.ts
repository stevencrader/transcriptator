import { describe, expect, test } from "@jest/globals"

import { parseSRT, parseSRTSegment, SRTSegment } from "../src/formats/srt"
import { Segment } from "../src/types"

import { readFile, saveSegmentsToFile, TestFiles } from "./test_utils"

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
    ])("SRT Segment ($id)", ({ data, expected }) => {
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
    ])("SRT Segment Undefined ($id)", ({ data }) => {
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
            filePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
            id: "Buzzcast",
        },
        {
            filePath: TestFiles.TRANSCRIPT_SRT_PODCASTING_20,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_PODCASTING_20_OUTPUT,
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

test("SRT missing trailing line", () => {
    const data = `1
00:00:00,780 --> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat

2
00:00:06,210 --> 00:00:12,990
formable hello everybody welcome
to a delayed board meeting of`
    const expected: Array<Segment> = [
        {
            startTime: 0.78,
            endTime: 6.21,
            speaker: "Adam Curry",
            body: "podcasting 2.0 March\n4 2023 Episode 124 on D flat",
        },
        {
            startTime: 6.21,
            endTime: 12.99,
            speaker: "Adam Curry",
            body: "formable hello everybody welcome\nto a delayed board meeting of",
        },
    ]
    const segments = parseSRT(data)
    saveSegmentsToFile(segments, `missing_trailing_srt.json`) // TODO: remove this
    expect(segments).toEqual(expected)
})
