import { describe, expect, test } from "@jest/globals"
// import * as fs from "fs";
import {
    determineType,
    parseSRTSegment,
    parseTimestamp,
    SRTSegment,
    TranscriptType,
} from "../src"

// TRANSCRIPT_HTML_BUZZCAST = "test_files/buzzcast.html"
// TRANSCRIPT_JSON_BUZZCAST = "test_files/buzzcast.json"
// TRANSCRIPT_SRT_BUZZCAST = "test_files/buzzcast.srt"
// TRANSCRIPT_SRT_PODCASTING_20 = "test_files/podcasting_20.srt"

// const readFile = (filePath: string): string => {
//     return fs.readFile(filePath, "utf8", (err, data) => {
//         if (err) throw err
//         console.error(err)
//     })
// }

describe("Timestamp", () => {
    test.each<{
        data: string | number
        expected: number
        id: string
    }>([
        {
            data: "00:00:00,780",
            expected: 0.78,
            id: "comma, ms",
        },
        {
            data: "00:00:00.780",
            expected: 0.78,
            id: "decimal, ms",
        },
        {
            data: "01:02:03,456",
            expected: 3723.456,
            id: "all fields",
        },
        {
            data: 12.493,
            expected: 12.493,
            id: "number",
        },
    ])("Timestamp ($id)", ({ data, expected, id }) => {
        expect(parseTimestamp(data)).toBe(expected)
    })
})

describe("Undefined timestamp", () => {
    test.each<{
        data: any
        id: string
    }>([
        { data: [], id: "Array" },
        { data: "02:03,456", id: "No Hours" },
        { data: "01;02:03,456", id: "Wrong separator" },
        { data: "01:02:03/956", id: "Wrong decimal separator" },
    ])("Undefined timestamp ($id)", ({ data, id }) => {
        expect(() => parseTimestamp(data)).toThrow(TypeError)
    })
})

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
                speaker: "",
                body: "Adam Curry: podcasting 2.0 March 4 2023 Episode 124 on D flat",
            },
            id: "comma, 2 line",
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

describe("Determine Transcript Type", () => {
    // noinspection HtmlRequiredLangAttribute
    test.each<{
        data: string
        expected: TranscriptType
    }>([
        {
            data: " <!-- html comment --><html></html>",
            expected: TranscriptType.HTML,
        },
        { data: "<html></html>", expected: TranscriptType.HTML },
        { data: "\nWEBVTT", expected: TranscriptType.VTT },
        { data: "WEBVTT", expected: TranscriptType.VTT },
        {
            data: '{"version":"1.0.0","segments":[{"speaker":"Alban","startTime":0.0,"endTime":4.8,"body":"It is so stinking nice to"}]}',
            expected: TranscriptType.JSON,
        },
        {
            data: "1\n00:00:00,780 --> 00:00:06,210\nAdam Curry: podcasting 2.0 March\n4 2023 Episode 124 on D flat",
            expected: TranscriptType.SRT,
        },
        {
            data: "2\n00:00:00,780 --> 00:00:06.210\nAdam Curry: podcasting 2.0 March\n",
            expected: TranscriptType.SRT,
        },
    ])("Transcript Type ($expected)", ({ data, expected }) => {
        expect(determineType(data)).toBe(expected)
    })
})

describe("Unknown transcript type data", () => {
    test.each<{
        data: string
        id: string
    }>([{ data: "", id: "Empty" }])(
        "Transcript Type Unknown ($id)",
        ({ data, id }) => {
            expect(() => determineType(data)).toThrow(Error)
        }
    )
})
