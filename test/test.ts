import { describe, expect, test } from "@jest/globals"
import { determineType } from "../src"
import { TranscriptType } from "../src/types"

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
    }>([{ data: "", id: "Empty" }])("Transcript Type Unknown ($id)", ({ data, id }) => {
        expect(() => determineType(data)).toThrow(Error)
    })
})
