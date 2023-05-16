import { describe, expect, test } from "@jest/globals"

import { IOptions, Options, Segment } from "../src"
import { addSegment } from "../src/segments"

const SEGMENT_FIRST: Segment = {
    startTime: 0.253,
    startTimeFormatted: "00:00:00.253",
    endTime: 3.373,
    endTimeFormatted: "00:00:03.373",
    speaker: "Jon",
    body: "Welcome to the",
}
const SEGMENT_TIME_SPEAKER_MATCH: Segment = {
    startTime: 0.253,
    startTimeFormatted: "00:00:00.253",
    endTime: 3.373,
    endTimeFormatted: "00:00:03.373",
    speaker: "Jon",
    body: "latest episode of Podcast.",
}
const SEGMENT_TIME_MATCH: Segment = {
    startTime: 0.253,
    startTimeFormatted: "00:00:00.253",
    endTime: 3.373,
    endTimeFormatted: "00:00:03.373",
    speaker: "Fred",
    body: "latest episode of Podcast.",
}
const SEGMENT_SECOND: Segment = {
    startTime: 3.4,
    startTimeFormatted: "00:00:03.400",
    endTime: 5.847,
    endTimeFormatted: "00:00:05.847",
    speaker: "Jon",
    body: "latest episode of Podcast.",
}
const SEGMENT_WORD_1: Segment = {
    startTime: 0.253,
    startTimeFormatted: "00:00:00.253",
    endTime: 0.578,
    endTimeFormatted: "00:00:00.578",
    speaker: "Jon",
    body: "Welcome",
}
const SEGMENT_WORD_2: Segment = {
    startTime: 0.579,
    startTimeFormatted: "00:00:00.579",
    endTime: 1.015,
    endTimeFormatted: "00:00:01.015",
    speaker: "Jon",
    body: "to",
}

describe("Apply Segment Options", () => {
    test.each<{
        newSegment: Segment
        priorSegments: Array<Segment>
        options: IOptions
        expected: Array<Segment>
        id: string
    }>([
        {
            newSegment: { ...SEGMENT_FIRST },
            priorSegments: undefined,
            options: {},
            expected: [{ ...SEGMENT_FIRST }],
            id: "first, no options",
        },
        {
            newSegment: { ...SEGMENT_TIME_SPEAKER_MATCH },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                combineEqualTimes: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: "Jon",
                    body: "Welcome to the\nlatest episode of Podcast.",
                },
            ],
            id: "time, speaker match - default",
        },
        {
            newSegment: { ...SEGMENT_TIME_SPEAKER_MATCH },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                combineEqualTimes: true,
                combineEqualTimesSeparator: " ",
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: "Jon",
                    body: "Welcome to the latest episode of Podcast.",
                },
            ],
            id: "time, speaker match - space",
        },
        {
            newSegment: { ...SEGMENT_TIME_MATCH },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                combineEqualTimes: true,
            },
            expected: [{ ...SEGMENT_FIRST }, { ...SEGMENT_TIME_MATCH }],
            id: "time match, speaker different",
        },
        {
            newSegment: {
                startTime: 1.822,
                startTimeFormatted: "00:00:01.822",
                endTime: 3.373,
                endTimeFormatted: "00:00:03.373",
                body: "latest episode of Podcast.",
            },
            priorSegments: undefined,
            options: {
                speakerChange: true,
            },
            expected: [
                {
                    startTime: 1.822,
                    startTimeFormatted: "00:00:01.822",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: undefined,
                    body: "latest episode of Podcast.",
                },
            ],
            id: "speaker change, no speaker, no prior",
        },
        {
            newSegment: {
                startTime: 1.822,
                startTimeFormatted: "00:00:01.822",
                endTime: 3.373,
                endTimeFormatted: "00:00:03.373",
                speaker: "Fred",
                body: "latest episode of Podcast.",
            },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                speakerChange: true,
            },
            expected: [
                { ...SEGMENT_FIRST },
                {
                    startTime: 1.822,
                    startTimeFormatted: "00:00:01.822",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: "Fred",
                    body: "latest episode of Podcast.",
                },
            ],
            id: "speaker change, different speaker",
        },
        {
            newSegment: {
                startTime: 1.822,
                startTimeFormatted: "00:00:01.822",
                endTime: 3.373,
                endTimeFormatted: "00:00:03.373",
                speaker: "Jon",
                body: "latest episode of Podcast.",
            },
            priorSegments: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 1.821,
                    endTimeFormatted: "00:00:01.821",
                    speaker: "Jon",
                    body: "Welcome to the",
                },
            ],
            options: {
                speakerChange: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 1.821,
                    endTimeFormatted: "00:00:01.821",
                    speaker: "Jon",
                    body: "Welcome to the",
                },
                {
                    startTime: 1.822,
                    startTimeFormatted: "00:00:01.822",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: undefined,
                    body: "latest episode of Podcast.",
                },
            ],
            id: "same speaker, remove speaker",
        },
        {
            newSegment: {
                startTime: 1.822,
                startTimeFormatted: "00:00:01.822",
                endTime: 3.373,
                endTimeFormatted: "00:00:03.373",
                body: "latest episode of Podcast.",
            },
            priorSegments: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 1.821,
                    endTimeFormatted: "00:00:01.821",
                    body: "Welcome to the",
                },
            ],
            options: {
                speakerChange: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 1.821,
                    endTimeFormatted: "00:00:01.821",
                    body: "Welcome to the",
                },
                {
                    startTime: 1.822,
                    startTimeFormatted: "00:00:01.822",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    body: "latest episode of Podcast.",
                },
            ],
            id: "no speaker, remove speaker",
        },
        {
            newSegment: { ...SEGMENT_SECOND },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                combineSegments: true,
            },
            expected: [{ ...SEGMENT_FIRST }, { ...SEGMENT_SECOND }],
            id: "combine segments, too long, default length",
        },
        {
            newSegment: { ...SEGMENT_WORD_2 },
            priorSegments: [{ ...SEGMENT_WORD_1 }],
            options: {
                combineSegments: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 1.015,
                    endTimeFormatted: "00:00:01.015",
                    speaker: "Jon",
                    body: "Welcome to",
                },
            ],
            id: "combine segments, default length",
        },
        {
            newSegment: { ...SEGMENT_SECOND },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                combineSegments: true,
                combineSegmentsLength: 45,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 5.847,
                    endTimeFormatted: "00:00:05.847",
                    speaker: "Jon",
                    body: "Welcome to the latest episode of Podcast.",
                },
            ],
            id: "combine segments, length 45",
        },
        {
            newSegment: { ...SEGMENT_SECOND },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                combineSegments: true,
                combineSegmentsLength: 32,
            },
            expected: [{ ...SEGMENT_FIRST }, { ...SEGMENT_SECOND }],
            id: "combine segments, too long",
        },
        {
            newSegment: {
                startTime: 0.579,
                startTimeFormatted: "00:00:00.579",
                endTime: 1.015,
                endTimeFormatted: "00:00:01.015",
                speaker: "Jon",
                body: ", this",
            },
            priorSegments: [{ ...SEGMENT_WORD_1 }],
            options: {
                combineSegments: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 1.015,
                    endTimeFormatted: "00:00:01.015",
                    speaker: "Jon",
                    body: "Welcome, this",
                },
            ],
            id: "combine segments, no space",
        },
        {
            newSegment: { ...SEGMENT_SECOND },
            priorSegments: [{ ...SEGMENT_FIRST }],
            options: {
                combineSpeaker: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 5.847,
                    endTimeFormatted: "00:00:05.847",
                    speaker: "Jon",
                    body: "Welcome to the latest episode of Podcast.",
                },
            ],
            id: "combine speaker",
        },
        {
            newSegment: { ...SEGMENT_SECOND },
            priorSegments: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: "Jon",
                    body: "",
                },
            ],
            options: {
                combineSpeaker: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 5.847,
                    endTimeFormatted: "00:00:05.847",
                    speaker: "Jon",
                    body: "latest episode of Podcast.",
                },
            ],
            id: "no body",
        },
        {
            newSegment: { ...SEGMENT_SECOND },
            priorSegments: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: "Jeff",
                    body: "Welcome to the",
                },
            ],
            options: {
                combineSpeaker: true,
            },
            expected: [
                {
                    startTime: 0.253,
                    startTimeFormatted: "00:00:00.253",
                    endTime: 3.373,
                    endTimeFormatted: "00:00:03.373",
                    speaker: "Jeff",
                    body: "Welcome to the",
                },
                { ...SEGMENT_SECOND },
            ],
            id: "combine speaker, different speakers",
        },
    ])("Apply Options ($id)", ({ newSegment, priorSegments, options, expected }) => {
        Options.setOptions(options)
        expect(addSegment(newSegment, priorSegments)).toStrictEqual(expected)
    })
})
