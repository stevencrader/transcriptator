import { Options } from "./options"
import { timestampFormatter } from "./timestamp"
import { DEFAULT_COMBINE_SEGMENTS_LENGTH, Segment } from "./types"

/**
 * Regular Expression for detecting punctuation that should not be prefixed with a space
 */
const PATTERN_PUNCTUATIONS = /^ *[.,?!}\]>) *$]/

/**
 * Append `addition` to `body` with the character(s) specified.
 *
 * If `addition` matches the {@link PATTERN_PUNCTUATIONS} pattern, no character is added before the additional data.
 *
 * @param body Current body text
 * @param addition Additional text to add to `body`
 * @param separator Character(s) to use to separate data. If undefined, uses `\n`.
 * @returns Combined data
 */
const joinBody = (body: string, addition: string, separator: string = undefined): string => {
    if (body) {
        let separatorToUse = separator || "\n"
        if (PATTERN_PUNCTUATIONS.exec(addition)) {
            separatorToUse = ""
        }
        return `${body}${separatorToUse}${addition}`
    }
    return addition
}

/**
 * Combine one or more {@link Segment}
 *
 * @param segments Array of Segment objects to combine
 * @param bodySeparator Character(s) to use to separate body data. If undefined, uses `\n`.
 * @returns Combined segment where:
 *
 *   - `startTime`: from first segment
 *   - `startTimeFormatted`: from first segment
 *   - `endTime`: from last segment
 *   - `endTimeFormatted`: from last segment
 *   - `speaker`: from first segment
 *   - `body`: combination of all segments
 */
const joinSegments = (segments: Array<Segment>, bodySeparator: string = undefined): Segment => {
    const newSegment = { ...segments[0] }
    segments.slice(1).forEach((segment) => {
        newSegment.endTime = segment.endTime
        newSegment.endTimeFormatted = timestampFormatter.format(segment.endTime)
        newSegment.body = joinBody(newSegment.body, segment.body, bodySeparator)
    })
    return newSegment
}

/**
 * Type returned from combine functions
 */
type CombineResult = {
    /**
     * The updated segment with any changes applied
     */
    segment: Segment
    /**
     * If true, the {@link segment} contains a {@link Segment} that should replace the prior segment instead of
     * appending a new segment
     */
    replace: boolean
    /**
     * Indicates if the combine rule was applied
     */
    combined: boolean
}

/**
 * Checks if the new and prior segments have the same speaker.
 *
 * If so, combines segments where:
 *   - `startTime`: from priorSegment
 *   - `startTimeFormatted`: from priorSegment
 *   - `endTime`: from newSegment
 *   - `endTimeFormatted`: from newSegment
 *   - `speaker`: from priorSegment
 *   - `body`: body of priorSegment with body of newSegment separated with space
 *
 * @param newSegment segment being created
 * @param priorSegment prior parsed segment
 * @param lastSpeaker last speaker name.
 * Used when speaker in segment has been removed via {@link Options.speakerChange} rule
 * @returns result of combination.
 * If segments were combined, {@link CombineResult.replace} and {@link CombineResult.combined} set to true.
 */
const doCombineSpeaker = (newSegment: Segment, priorSegment: Segment, lastSpeaker: string): CombineResult => {
    if (newSegment.speaker === priorSegment.speaker || newSegment.speaker === lastSpeaker) {
        return {
            segment: joinSegments([priorSegment, newSegment], " "),
            replace: true,
            combined: true,
        }
    }
    return {
        segment: newSegment,
        replace: false,
        combined: false,
    }
}

/**
 * Checks if the new and prior segments have the same speaker and combining body results in new body shorter than
 * max length
 *
 * If so, combines segments where:
 *   - `startTime`: from priorSegment
 *   - `startTimeFormatted`: from priorSegment
 *   - `endTime`: from newSegment
 *   - `endTimeFormatted`: from newSegment
 *   - `speaker`: from priorSegment
 *   - `body`: body of priorSegment with body of newSegment separated with space
 *
 * @param newSegment segment being created
 * @param priorSegment prior parsed segment
 * @param maxLength maximum allowed length of combined body. If undefined, uses {@link DEFAULT_COMBINE_SEGMENTS_LENGTH}
 * @param lastSpeaker last speaker name.
 * Used when speaker in segment has been removed via {@link Options.speakerChange} rule
 * @returns result of combination.
 * If segments were combined, {@link CombineResult.replace} and {@link CombineResult.combined} set to true.
 */
const doCombineSegments = (
    newSegment: Segment,
    priorSegment: Segment,
    maxLength: number,
    lastSpeaker: string
): CombineResult => {
    const combineSegmentsLength = maxLength || DEFAULT_COMBINE_SEGMENTS_LENGTH

    if (
        (newSegment.speaker === priorSegment.speaker || newSegment.speaker === lastSpeaker) &&
        joinBody(priorSegment.body, newSegment.body, " ").length <= combineSegmentsLength
    ) {
        return {
            segment: joinSegments([priorSegment, newSegment], " "),
            replace: true,
            combined: true,
        }
    }
    return {
        segment: newSegment,
        replace: false,
        combined: false,
    }
}

/**
 * Checks if the new and prior segments have the same speaker, startTime and endTime.
 *
 * If so, combines segments where:
 *   - `startTime`: from priorSegment
 *   - `startTimeFormatted`: from priorSegment
 *   - `endTime`: from newSegment
 *   - `endTimeFormatted`: from newSegment
 *   - `speaker`: from priorSegment
 *   - `body`: body of priorSegment with body of newSegment separated with value of separator argument
 *
 * @param newSegment segment being created
 * @param priorSegment prior parsed segment
 * @param separator string to use to combine body values. If undefined, uses "\n"
 * @param lastSpeaker last speaker name.
 * Used when speaker in segment has been removed via {@link Options.speakerChange} rule
 * @returns result of combination.
 * If segments were combined, {@link CombineResult.replace} and {@link CombineResult.combined} set to true.
 */
const doCombineEqualTimes = (
    newSegment: Segment,
    priorSegment: Segment,
    separator: string,
    lastSpeaker: string
): CombineResult => {
    const combineEqualTimesSeparator = separator || "\n"

    if (
        newSegment.startTime === priorSegment.startTime &&
        newSegment.endTime === priorSegment.endTime &&
        (newSegment.speaker === priorSegment.speaker || newSegment.speaker === lastSpeaker)
    ) {
        return {
            segment: joinSegments([priorSegment, newSegment], combineEqualTimesSeparator),
            replace: true,
            combined: true,
        }
    }
    return {
        segment: newSegment,
        replace: false,
        combined: false,
    }
}

/**
 * Checks if the new and prior segments have the same speaker. If so, sets the speaker value to undefined
 *
 * If so, combines segments where:
 *   - `startTime`: from priorSegment
 *   - `startTimeFormatted`: from priorSegment
 *   - `endTime`: from newSegment
 *   - `endTimeFormatted`: from newSegment
 *   - `speaker`: from newSegment if different from priorSegment else undefined
 *   - `body`: body of priorSegment with body of newSegment separated with space
 *
 * @param newSegment segment being created
 * @param priorSegment prior parsed segment. For the first segment, this shall be undefined.
 * @param lastSpeaker last speaker name.
 * Used when speaker in segment has been removed via {@link Options.speakerChange} rule
 * @returns result of combination.
 * If segments were combined, {@link CombineResult.replace} set to false and {@link CombineResult.combined} set to true.
 */
const doSpeakerChange = (newSegment: Segment, priorSegment: Segment, lastSpeaker: string): CombineResult => {
    const result: CombineResult = {
        segment: newSegment,
        replace: false,
        combined: false,
    }

    if (priorSegment === undefined) {
        if (newSegment.speaker === lastSpeaker) {
            const segment: Segment = { ...newSegment }
            segment.speaker = undefined

            return {
                segment,
                replace: false,
                combined: true,
            }
        }
        return result
    }

    if (newSegment.speaker === undefined) {
        return result
    }

    if (
        newSegment.speaker === "" ||
        newSegment.speaker === priorSegment.speaker ||
        newSegment.speaker === lastSpeaker
    ) {
        const segment: Segment = { ...newSegment }
        segment.speaker = undefined

        return {
            segment,
            replace: false,
            combined: true,
        }
    }

    return result
}

/**
 * Determine how {@link Options.speakerChange is applied based an past options being applied}
 *
 * @param currentResult current result object from any prior options
 * @param priorSegment prior parsed segment
 * @param lastSpeaker last speaker name.
 * @returns result of combination.
 * If segments were combined, {@link CombineResult.replace} set to false and {@link CombineResult.combined} set to true.
 */
const applyOptionsAndDoSpeakerChange = (
    currentResult: CombineResult,
    priorSegment: Segment,
    lastSpeaker: string
): CombineResult => {
    const { combineSegments, combineEqualTimes } = Options
    let result = currentResult
    if (combineSegments && currentResult.combined && currentResult.replace) {
        result = doSpeakerChange(currentResult.segment, undefined, undefined)
    } else if (combineEqualTimes) {
        if (result.combined && result.replace) {
            result = doSpeakerChange(currentResult.segment, undefined, undefined)
        } else {
            result = doSpeakerChange(currentResult.segment, priorSegment, lastSpeaker)
        }
    } else {
        result = doSpeakerChange(currentResult.segment, priorSegment, lastSpeaker)
    }
    if (result) {
        result = {
            segment: result.segment,
            replace: currentResult.replace || result.replace,
            combined: currentResult.combined || result.combined,
        }
    }
    return result
}
/**
 * Apply convert rules when no prior segment exits.
 *
 * NOTE: not all rules applicable when no prior segment
 *
 * @param newSegment segment before any rules options to it
 * @param lastSpeaker last speaker name.
 * Used when speaker in segment has been removed via {@link Options.speakerChange} rule
 * @returns the updated segment info
 */
const doCombineNoPrior = (newSegment: Segment, lastSpeaker: string): CombineResult => {
    const { speakerChange } = Options
    let result: CombineResult = {
        segment: newSegment,
        replace: false,
        combined: false,
    }

    if (speakerChange) {
        result = doSpeakerChange(result.segment, undefined, lastSpeaker)
    }
    return result
}

/**
 * Apply convert rules when prior segment exits.
 *
 * @param newSegment segment before any rules options to it
 * @param priorSegment prior parsed segment
 * @param lastSpeaker last speaker name.
 * Used when speaker in segment has been removed via {@link Options.speakerChange} rule
 * @returns the updated segment info
 */
const doCombineWithPrior = (newSegment: Segment, priorSegment: Segment, lastSpeaker: string): CombineResult => {
    const {
        combineEqualTimes,
        combineEqualTimesSeparator,
        combineSegments,
        combineSegmentsLength,
        combineSpeaker,
        speakerChange,
    } = Options

    let result: CombineResult = {
        segment: { ...newSegment },
        replace: false,
        combined: false,
    }

    if (combineSpeaker) {
        result = doCombineSpeaker(result.segment, priorSegment, lastSpeaker)
    }
    if (!result.combined && combineSegments) {
        result = doCombineSegments(result.segment, priorSegment, combineSegmentsLength, lastSpeaker)
    }
    if (!result.combined && combineEqualTimes) {
        result = doCombineEqualTimes(result.segment, priorSegment, combineEqualTimesSeparator, lastSpeaker)
    }
    if (speakerChange) {
        result = applyOptionsAndDoSpeakerChange(result, priorSegment, lastSpeaker)
    }

    return result
}

/**
 * Apply any options to the current segment
 *
 * @param newSegment segment before any rules options to it
 * @param priorSegment prior parsed segment. For the first segment, this shall be undefined.
 * @param lastSpeaker last speaker name.
 * Used when speaker in segment has been removed via {@link Options.speakerChange} rule
 * @returns the updated segment info
 */
const applyOptions = (newSegment: Segment, priorSegment: Segment, lastSpeaker: string = undefined): CombineResult => {
    if (!Options.optionsSet()) {
        return {
            segment: newSegment,
            replace: false,
            combined: false,
        }
    }

    let result: CombineResult
    // if no prior segment, limited additional checking
    if (priorSegment === undefined) {
        result = doCombineNoPrior(newSegment, lastSpeaker)
    } else {
        result = doCombineWithPrior(newSegment, priorSegment, lastSpeaker)
    }

    return result
}

/**
 * Get the last speaker name from the previously parsed segments
 *
 * @param priorSegment prior parsed segment
 * @param priorSegments array of all previous segments
 * @returns the name of the last speaker
 */
const getLastSpeaker = (priorSegment: Segment, priorSegments: Array<Segment>): string => {
    let lastSpeaker
    if (priorSegment) {
        lastSpeaker = priorSegment.speaker
    }
    if (lastSpeaker === undefined && priorSegments.length > 0) {
        lastSpeaker = priorSegments[0].speaker
        for (let i = priorSegments.length - 1; i > 0; i--) {
            if (priorSegments[i].speaker !== undefined) {
                lastSpeaker = priorSegments[i].speaker
                break
            }
        }
    }
    return lastSpeaker
}

/**
 * Helper for adding segment to or updating last segment in array of segments
 *
 * @param newSegment segment to add or replace
 * @param priorSegments array of all previous segments
 * @returns updated array of segments with new segment added or last segment updated (per options)
 */
export const addSegment = (newSegment: Segment, priorSegments: Array<Segment>): Array<Segment> => {
    const { speakerChange } = Options
    const outSegments = priorSegments || []
    const priorSegment = outSegments.length > 0 ? outSegments[outSegments.length - 1] : undefined

    // don't worry about identifying the last speaker if speaker is not being removed by speakerChange
    let lastSpeaker: string
    if (speakerChange) {
        lastSpeaker = getLastSpeaker(priorSegment, outSegments)
    }

    const newSegmentInfo = applyOptions(newSegment, priorSegment, lastSpeaker)
    if (newSegmentInfo.replace && outSegments.length > 0) {
        outSegments[outSegments.length - 1] = newSegmentInfo.segment
    } else {
        outSegments.push(newSegmentInfo.segment)
    }
    return outSegments
}
