import { describe, expect, test } from "@jest/globals"

import { combineSingleWordSegments, convertFile, determineFormat } from "../src"
import { Segment, TranscriptFormat } from "../src/types"

import { readFile, TestFiles } from "./test_utils"

describe("Determine Transcript Type", () => {
    // noinspection HtmlRequiredLangAttribute
    test.each<{
        data: string
        expected: TranscriptFormat
    }>([
        {
            data: " <!-- html comment --><html></html>",
            expected: TranscriptFormat.HTML,
        },
        { data: "<html></html>", expected: TranscriptFormat.HTML },
        { data: "\nWEBVTT", expected: TranscriptFormat.VTT },
        { data: "WEBVTT", expected: TranscriptFormat.VTT },
        {
            // language=JSON
            data: '{"version":"1.0.0","segments":[{"speaker":"Alban","startTime":0.0,"endTime":4.8,"body":"It is so stinking nice to"}]}',
            expected: TranscriptFormat.JSON,
        },
        {
            data: `1
00:00:00,780 --> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat`,
            expected: TranscriptFormat.SRT,
        },
        {
            data: `2
00:00:00,780 --> 00:00:06.210
Adam Curry: podcasting 2.0 March
`,
            expected: TranscriptFormat.SRT,
        },
        {
            // language=JSON
            data: '[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]',
            expected: TranscriptFormat.JSON,
        },
        {
            // language=JSON
            data: '{"version": "1.0.0","segments": [{"speaker": "Alban","startTime": 0.0,"endTime": 4.8,"body": "It is so stinking nice to"}]}',
            expected: TranscriptFormat.JSON,
        },
    ])("Transcript Type ($expected)", ({ data, expected }) => {
        expect(determineFormat(data)).toEqual(expected)
    })
})

describe("Unknown transcript format data", () => {
    test.each<{
        data: string
        id: string
    }>([{ data: "", id: "Empty" }])("Transcript Type Unknown ($id)", ({ data }) => {
        expect(() => determineFormat(data)).toThrow(Error)
    })
})

describe("Convert File", () => {
    test.each<{
        filePath: string
        expectedFilePath: string
        transcriptFormat: TranscriptFormat | undefined
        id: string
    }>([
        {
            filePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST,
            transcriptFormat: undefined,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_BUZZCAST_OUTPUT,
            id: "SRT Detect",
        },
        {
            filePath: TestFiles.TRANSCRIPT_SRT_PODCASTING_20,
            transcriptFormat: TranscriptFormat.SRT,
            expectedFilePath: TestFiles.TRANSCRIPT_SRT_PODCASTING_20_OUTPUT,
            id: "SRT",
        },
        {
            filePath: TestFiles.TRANSCRIPT_JSON_BUZZCAST,
            transcriptFormat: undefined,
            expectedFilePath: TestFiles.TRANSCRIPT_JSON_BUZZCAST_OUTPUT,
            id: "JSON Detect",
        },
        {
            filePath: TestFiles.TRANSCRIPT_JSON_LALALAND,
            transcriptFormat: TranscriptFormat.JSON,
            expectedFilePath: TestFiles.TRANSCRIPT_JSON_LALALAND_OUTPUT,
            id: "JSON",
        },
        {
            filePath: TestFiles.TRANSCRIPT_HTML_BUZZCAST,
            transcriptFormat: undefined,
            expectedFilePath: TestFiles.TRANSCRIPT_HTML_BUZZCAST_OUTPUT,
            id: "HTML Detect",
        },
        {
            filePath: TestFiles.TRANSCRIPT_HTML_BUZZCAST,
            transcriptFormat: TranscriptFormat.HTML,
            expectedFilePath: TestFiles.TRANSCRIPT_HTML_BUZZCAST_OUTPUT,
            id: "HTML",
        },
        {
            filePath: TestFiles.TRANSCRIPT_VTT_LALALAND,
            transcriptFormat: undefined,
            expectedFilePath: TestFiles.TRANSCRIPT_VTT_LALALAND_OUTPUT,
            id: "VTT Detect",
        },
        {
            filePath: TestFiles.TRANSCRIPT_VTT_LALALAND,
            transcriptFormat: TranscriptFormat.VTT,
            expectedFilePath: TestFiles.TRANSCRIPT_VTT_LALALAND_OUTPUT,
            id: "VTT",
        },
    ])("Convert File ($id)", ({ filePath, transcriptFormat, expectedFilePath }) => {
        const data = readFile(filePath)
        const expectedJSONData = JSON.parse(readFile(expectedFilePath))

        const segments = convertFile(data, transcriptFormat)
        expect(segments).toEqual(expectedJSONData.segments)
    })
})

describe("Convert File Error", () => {
    test.each<{
        data: string
        transcriptFormat: TranscriptFormat | string
        id: string
    }>([
        {
            data: "",
            transcriptFormat: "txt",
            id: "Unknown format",
        },
        {
            data: `1
00:00:00,780 --> 00:00:06,210
Adam Curry: podcasting 2.0 March
4 2023 Episode 124 on D flat`,
            transcriptFormat: TranscriptFormat.VTT,
            id: "SRT, wrong format",
        },
        {
            // language=JSON
            data: `[{"startTime": 1,"endTime": 5000,"body": "Subtitles: @marlonrock1986 (^^V^^)"}]`,
            transcriptFormat: TranscriptFormat.SRT,
            id: "JSON, wrong format",
        },
        {
            data: `<!-- a comment -->
<html><body><cite>Alban:</cite>
  <time>0:00</time>
  <p>It is so stinking nice to like, show up and record this show. And Travis has already put together an outline. Kevin's got suggestions, I throw my thoughts into the mix. And then Travis goes and does all the work from there, too. It's out into the wild. And I don't see anything. That's an absolute joy for at least two thirds of the team. Yeah, I mean, exactly.</p>
  <cite>Kevin:</cite>
  <time>0:30</time>
  <p>You guys remember, like two months ago, when you were like, We're going all in on video Buzzcast. I was like, that's, I mean, I will agree and commit and disagree, disagree and commit, I'll do something. But I don't want to do this.</p>
</body></html>`,
            transcriptFormat: TranscriptFormat.JSON,
            id: "HTML, wrong format",
        },
        {
            data: `WEBVTT

1
00:00:00.001 --> 00:00:05.000
Subtitles: @marlonrock1986 (^^V^^)
`,
            transcriptFormat: TranscriptFormat.JSON,
            id: "VTT, wrong format",
        },
    ])("Convert File Error ($id)", ({ data, transcriptFormat }) => {
        expect(() => convertFile(data, transcriptFormat as TranscriptFormat)).toThrow(Error)
    })
})

describe("Combine Single Word Segments", () => {
    // noinspection HtmlRequiredLangAttribute
    test.each<{
        segments: Array<Segment> | string
        maxLength: number
        expected: Array<Segment> | string
        id: string
    }>([
        {
            segments: [],
            maxLength: 32,
            expected: [],
            id: "Empty",
        },
        {
            segments: TestFiles.ONE_WORD_SEGMENTS,
            maxLength: 32,
            expected: TestFiles.ONE_WORD_SEGMENTS_OUTPUT_32,
            id: "length 32",
        },
        {
            segments: TestFiles.ONE_WORD_SEGMENTS,
            maxLength: 50,
            expected: TestFiles.ONE_WORD_SEGMENTS_OUTPUT_50,
            id: "length 50",
        },
    ])("Combine Single Word Segments ($id)", ({ segments, maxLength, expected }) => {
        const segmentsJSON = typeof segments === "string" ? JSON.parse(readFile(segments)) : segments
        const expectedJSON = typeof expected === "string" ? JSON.parse(readFile(expected)) : expected

        const outSegments = combineSingleWordSegments(segmentsJSON as Array<Segment>, maxLength)
        expect(outSegments).toStrictEqual(expectedJSON)
    })
})

describe("Unsupported segment data", () => {
    test.each<{
        segments: Array<Segment>
        maxLength: number
        id: string
    }>([
        {
            segments: [
                {
                    speaker: "Travis",
                    startTime: 0.3,
                    endTime: 0.93,
                    body: "Hey, Travis",
                },
                {
                    speaker: "Travis",
                    startTime: 0.931,
                    endTime: 1.08,
                    body: "Albritain",
                },
                {
                    speaker: "Travis",
                    startTime: 1.321,
                    endTime: 1.65,
                    body: "here.",
                },
            ],
            maxLength: 32,
            id: "Space 1",
        },
    ])("Unsupported segment data ($id)", ({ segments, maxLength }) => {
        expect(() => combineSingleWordSegments(segments, maxLength)).toThrow(Error)
    })
})
