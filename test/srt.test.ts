import { describe, expect, jest, test } from "@jest/globals"

import { IOptions, Options, Segment } from "../src"
import { parseSRT, parseSRTSegment, SRTSegment } from "../src/formats/srt"

import { readFile, TestFiles } from "./test_utils"

describe("SRT segment data", () => {
    test.each<{
        data: Array<string>
        indexOptional: boolean
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
            indexOptional: false,
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
            indexOptional: false,
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
            indexOptional: false,
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
            indexOptional: false,
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
            indexOptional: false,
            expected: {
                index: 1,
                startTime: 0.78,
                endTime: 17.07,
                speaker: "Adam Curry",
                body: "podcasting 2.0 March\n4 2023 Episode 124 on D flat\nformable hello everybody welcome\nto a delayed board meeting of\npodcasting 2.0 preserving,\nprotecting and extending the",
            },
            id: "large body",
        },
        {
            data: [
                "00:00:00.000 --> 00:00:11.840",
                " Buenas, bienvenidas de vuelta a KDE Express. Esta vez para no perder el ritmo volvemos a la",
            ],
            indexOptional: true,
            expected: {
                index: -1,
                startTime: 0,
                endTime: 11.84,
                speaker: "",
                body: "Buenas, bienvenidas de vuelta a KDE Express. Esta vez para no perder el ritmo volvemos a la",
            },
            id: "no timestamp",
        },
    ])("SRT Segment ($id)", ({ data, indexOptional, expected }) => {
        expect(parseSRTSegment(data, indexOptional)).toEqual(expected)
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
        {
            data: [
                "1",
                "00:00:00,780 -> 00:00:06,210",
                "Adam Curry: podcasting 2.0 March",
                "4 2023 Episode 124 on D flat",
            ],
            id: "wrong arrow",
        },
        {
            data: [
                "1",
                "00:00:00,780 --> 00:00:06,210 --> 00:00:07,030",
                "Adam Curry: podcasting 2.0 March",
                "4 2023 Episode 124 on D flat",
            ],
            id: "duplicate arrow",
        },
    ])("SRT Segment Undefined ($id)", ({ data }) => {
        expect(() => parseSRTSegment(data)).toThrow(Error)
    })
})

describe("Parse SRT file data", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        options: IOptions
        id: string
    }>([
        {
            filePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
            options: undefined,
            id: "Buzzcast",
        },
        {
            filePath: TestFiles.TRANSCRIPT_SRT_PODCASTING_20_EPISODE_124,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_PODCASTING_20_EPISODE_124_OUTPUT,
            options: undefined,
            id: "Podcasting 2.0",
        },
        {
            filePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST_COMBINED_SEGMENTS_128_OUTPUT,
            options: {
                combineSegments: true,
                combineSegmentsLength: 128,
            },
            id: "Buzzcast, combined segments 128",
        },
        {
            filePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST_SPEAKER_CHANGE_COMBINED_SEGMENTS_128_OUTPUT,
            options: {
                speakerChange: true,
                combineSegments: true,
                combineSegmentsLength: 128,
            },
            id: "Buzzcast, speaker change, combined segments 128",
        },
    ])("Parse SRT File ($id)", ({ filePath, expectedFilePath, options }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        Options.setOptions(options)
        const segments = parseSRT(data)
        expect(segments).toEqual(expectedJSONData.segments)
    })
})

describe("Parse SRT data (strings)", () => {
    test.each<{
        data: string
        expected: Array<Segment>
        id: string
    }>([
        {
            data: `1
00:00:00,780 --> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat

2
00:00:06,210 --> 00:00:12,990
formable hello everybody welcome
to a delayed board meeting of`,
            expected: [
                {
                    startTime: 0.78,
                    startTimeFormatted: "00:00:00.780",
                    endTime: 6.21,
                    endTimeFormatted: "00:00:06.210",
                    speaker: "Adam Curry",
                    body: "podcasting 2.0 March\n4 2023 Episode 124 on D flat",
                },
                {
                    startTime: 6.21,
                    startTimeFormatted: "00:00:06.210",
                    endTime: 12.99,
                    endTimeFormatted: "00:00:12.990",
                    speaker: "Adam Curry",
                    body: "formable hello everybody welcome\nto a delayed board meeting of",
                },
            ],
            id: "Missing trailing blank line",
        },
    ])("Parse SRT File Data ($id)", ({ data, expected }) => {
        expect(parseSRT(data)).toEqual(expected)
    })
})

describe("Parse Invalid SRT data (strings)", () => {
    test.each<{
        data: string
        consoleMessage: string | undefined
        id: string
    }>([
        {
            data: `1
00:00:00,780 -> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat


00:00:06,210 --> 00:00:12,990
formable hello everybody welcome
to a delayed board meeting of

3
00:00:12990 --> 00:00:17,070
podcasting 2.0 preserving,
protecting and extending the

4
00:00:17,100 --> 00:00:20;220
open independent podcasting
ecosystem that's what we're all

`,
            consoleMessage: undefined,
            id: "No valid SRT segment in first 20 lines",
        },
        {
            data: `1
00:00:00,780 --> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat


00:00:06,210 --> 00:00:12,990
formable hello everybody welcome
to a delayed board meeting of
`,
            consoleMessage: "Error parsing SRT segment lines (source line 9)",
            id: "Invalid segment logged",
        },
        {
            data: `1
00:00:00,780 --> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat


00:00:06,210 --> 00:00:12,990
formable hello everybody welcome
to a delayed board meeting of`,
            consoleMessage: "Error parsing final SRT segment lines",
            id: "Invalid final segment logged",
        },
    ])("Parse Invalid SRT File Data ($id)", ({ data, consoleMessage }) => {
        if (consoleMessage === undefined) {
            expect(() => parseSRT(data)).toThrow(TypeError)
        } else {
            const logSpy = jest.spyOn(global.console, "error")
            parseSRT(data)
            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(consoleMessage))
        }
    })
})
