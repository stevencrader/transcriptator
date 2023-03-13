import { describe, expect, test } from "@jest/globals"

import { parseSpeaker } from "../src/speaker"

describe("Speaker", () => {
    test.each<{
        data: string
        expected: { speaker: string; message: string }
    }>([
        {
            data: "Adam Curry: podcasting 2.0 March",
            expected: {
                speaker: "Adam Curry",
                message: "podcasting 2.0 March",
            },
        },
        {
            data: "Adam: ",
            expected: {
                speaker: "Adam",
                message: "",
            },
        },
        {
            data: "Adam:",
            expected: {
                speaker: "",
                message: "Adam:",
            },
        },
        {
            data: "the meeting starts at 2:30",
            expected: {
                speaker: "",
                message: "the meeting starts at 2:30",
            },
        },
        {
            data: "2: apples",
            expected: {
                speaker: "",
                message: "2: apples",
            },
        },
    ])("Speaker ($data)", ({ data, expected }) => {
        expect(parseSpeaker(data)).toEqual(expected)
    })
})
