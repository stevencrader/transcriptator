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
