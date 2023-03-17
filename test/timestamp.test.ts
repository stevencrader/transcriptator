import { describe, expect, test } from "@jest/globals"

import { parseTimestamp } from "../src/timestamp"

describe("Timestamp", () => {
    test.each<{
        data: string | number
        expected: number
        id: string
    }>([
        {
            data: "00:00:00,780",
            expected: 0.78,
            id: "comma, HH:MM:SS,fff",
        },
        {
            data: "00:00:00.780",
            expected: 0.78,
            id: "decimal, HH:MM:SS.fff",
        },
        {
            data: "00:00,780",
            expected: 0.78,
            id: "comma, MM:SS,fff",
        },
        {
            data: "00:00.780",
            expected: 0.78,
            id: "decimal, MM:SS.fff",
        },
        {
            data: "00,780",
            expected: 0.78,
            id: "comma, SS,fff",
        },
        {
            data: "00.780",
            expected: 0.78,
            id: "decimal, SS.fff",
        },
        {
            data: "0,780",
            expected: 0.78,
            id: "comma, S,fff",
        },
        {
            data: "0.780",
            expected: 0.78,
            id: "decimal, S.fff",
        },
        {
            data: "01:02:03",
            expected: 3723,
            id: "HH:MM:SS",
        },
        {
            data: "02:03",
            expected: 123,
            id: "MM:SS",
        },
        {
            data: "03",
            expected: 3,
            id: "SS",
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
    ])("Timestamp ($id)", ({ data, expected }) => {
        expect(parseTimestamp(data)).toEqual(expected)
    })
})

describe("Undefined timestamp", () => {
    test.each<{
        data: unknown
        id: string
    }>([
        { data: [], id: "Array" },
        { data: "01;02:03,456", id: "Wrong separator" },
        { data: "01:02:03/956", id: "Wrong decimal separator" },
        { data: "03:01:02:03,456", id: "Too many fields" },
        { data: "01: :03,456", id: "Space field" },
    ])("Undefined timestamp ($id)", ({ data }) => {
        expect(() => parseTimestamp(data as string)).toThrow(TypeError)
    })
})
