import { describe, expect, test } from "@jest/globals"

import { IOptions, Options, OptionsManager } from "../src/options"

test("Option Manager instances", () => {
    Options.setOptions({
        combineSpeaker: true,
    })
    const second = new OptionsManager()
    expect(Options === second).toBe(true)
    Options.restoreDefaultSettings()
})

describe("setOptions values", () => {
    test.each<{
        options: IOptions | unknown
        expected: IOptions | unknown
        id: string
    }>([
        {
            options: undefined,
            expected: {},
            id: "undefined options",
        },
        {
            options: {},
            expected: {},
            id: "no options",
        },
        {
            options: {
                combineEqualTimes: true,
            },
            expected: {
                combineEqualTimes: true,
            },
            id: "combineEqualTimes",
        },
        {
            options: {
                combineEqualTimesSeparator: "<br/>",
            },
            expected: {
                combineEqualTimesSeparator: "<br/>",
            },
            id: "combineEqualTimesSeparator",
        },
        {
            options: {
                combineSegments: true,
            },
            expected: {
                combineSegments: true,
            },
            id: "combineSegments",
        },
        {
            options: {
                combineSegmentsLength: 20,
            },
            expected: {
                combineSegmentsLength: 20,
            },
            id: "combineSegmentsLength",
        },
        {
            options: {
                combineSpeaker: true,
            },
            expected: {
                combineSpeaker: true,
            },
            id: "combineSpeaker",
        },
        {
            options: {
                speakerChange: true,
            },
            expected: {
                speakerChange: true,
            },
            id: "speakerChange",
        },
        {
            options: {
                combineTime: true,
            },
            expected: {
                combineTime: undefined,
            },
            id: "invalid, combineTime",
        },
    ])("setOptions ($id)", ({ options, expected }) => {
        Options.setOptions(options)
        ;(Object.keys(expected) as Array<keyof IOptions>).forEach((option) => {
            const actual = Options.getOptionByName(option)
            const expectedValue = expected[option]
            expect(actual === expectedValue).toBe(true)
        })
    })
})

describe("Incorrect option type", () => {
    test.each<{
        options: IOptions | unknown
        id: string
    }>([
        {
            options: {
                combineEqualTimes: "true",
            },
            id: "combineEqualTimes",
        },
        {
            options: {
                combineEqualTimesSeparator: 1,
            },
            id: "combineEqualTimesSeparator",
        },
        {
            options: {
                combineSegments: "false",
            },
            id: "combineSegments",
        },
        {
            options: {
                combineSegmentsLength: "20",
            },
            id: "combineSegmentsLength",
        },
        {
            options: {
                combineSpeaker: undefined,
            },
            id: "combineSpeaker",
        },
        {
            options: {
                speakerChange: null,
            },
            id: "speakerChange",
        },
    ])("Incorrect type ($id)", ({ options }) => {
        expect(() => Options.setOptions(options)).toThrow(TypeError)
    })
})
