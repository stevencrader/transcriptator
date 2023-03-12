// import { describe, expect, test } from "@jest/globals"

// describe("JSON segment data", () => {
//     test.each<{
//         data: Array<string>
//         expected: SRTSegment
//         id: string
//     }>([
//         {
//             data: [
//                 "1",
//                 "00:00:00,780 --> 00:00:06,210",
//                 "Adam Curry: podcasting 2.0 March",
//                 "4 2023 Episode 124 on D flat",
//             ],
//             expected: {
//                 index: 1,
//                 startTime: 0.78,
//                 endTime: 6.21,
//                 speaker: "Adam Curry",
//                 body: "podcasting 2.0 March 4 2023 Episode 124 on D flat",
//             },
//             id: "comma, 2 line",
//         },
//     ])("SRT Segment ($id)", ({ data, expected, id }) => {
//         expect(parseSRTSegment(data)).toEqual(expected)
//     })
// })

// describe("Undefined JSON segment data", () => {
//     test.each<{
//         data: Array<string>
//         id: string
//     }>([
//         { data: [], id: "Empty" },
//     ])("JSON Segment Undefined ($id)", ({ data, id }) => {
//         expect(() => parseJSON(data)).toThrow(Error)
//     })
// })
