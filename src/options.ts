import { DEFAULT_COMBINE_SEGMENTS_LENGTH } from "./types"

/**
 * Verifies the type of the value matches the expected type
 *
 * @param name name of option to check value for
 * @param expectedType expected type off the value for the option
 * @param value value to check
 * @throws TypeError When value is invalid type for option
 */
const verifyType = (name: string, expectedType: string, value: unknown): void => {
    if (typeof value !== expectedType) {
        throw new TypeError(`Invalid type ${typeof value} for ${name}. Expected ${expectedType}`)
    }
}

export interface IOptions {
    /**
     * Combine segments if the {@link Segment.startTime}, {@link Segment.endTime}, and {@link Segment.speaker} match
     * between the current and prior segments
     *
     * Can be used with {@link combineSegments}. The {@link combineEqualTimes} rule is applied first.
     *
     * Can be used with {@link speakerChange}. The {@link speakerChange} rule is applied last.
     *
     * Cannot be used with {@link combineSpeaker}
     */
    combineEqualTimes?: boolean

    /**
     * Character to use when {@link combineEqualTimes} is true.
     *
     * Default: `\n`
     */
    combineEqualTimesSeparator?: string

    /**
     * Combine segments where speaker is the same and concatenated `body` fits in the {@link combineSegmentsLength}
     *
     * Can be used with {@link combineEqualTimes}. The {@link combineSegments} rule is applied first.
     *
     * Can be used with {@link speakerChange}. The {@link speakerChange} rule is applied last.
     *
     * Cannot be used with {@link combineSpeaker}
     */
    combineSegments?: boolean

    /**
     * Max length of body text to use when {@link combineSegments} is true
     *
     * Default: See {@link DEFAULT_COMBINE_SEGMENTS_LENGTH}
     */
    combineSegmentsLength?: number

    /**
     * Combine consecutive segments from the same speaker.
     *
     * Note: If this is enabled, {@link combineEqualTimes} and {@link combineSegments} will not be applied.
     *
     * Warning: if the transcript does not contain speaker information, resulting segment will contain entire transcript text.
     */
    combineSpeaker?: boolean

    /**
     * Only include {@link Segment.speaker} when speaker changes
     *
     * May be used in combination with {@link combineSpeaker}, {@link combineEqualTimes}, or {@link combineSegments}
     */
    speakerChange?: boolean
}

/**
 * Provides a way to convert numeric timestamp to a formatted string.
 *
 * A custom formatter may be registered.
 * If one isn't registered, the default formatter will be used and the data will be formatted as HH:mm:SS.fff
 */
export class OptionsManager implements IOptions {
    static _instance: OptionsManager

    /**
     * Combine segments if the {@link Segment.startTime}, {@link Segment.endTime}, and {@link Segment.speaker} match
     * between the current and prior segments
     *
     * Can be used with {@link combineSegments}. The {@link combineEqualTimes} rule is applied first.
     *
     * Can be used with {@link speakerChange}. The {@link speakerChange} rule is applied last.
     *
     * Cannot be used with {@link combineSpeaker}
     */
    public combineEqualTimes = false

    /**
     * Character to use when {@link combineEqualTimes} is true.
     */
    public combineEqualTimesSeparator = "\n"

    /**
     * Combine segments where speaker is the same and concatenated `body` fits in the {@link combineSegmentsLength}
     *
     * Can be used with {@link combineEqualTimes}. The {@link combineSegments} rule is applied first.
     *
     * Can be used with {@link speakerChange}. The {@link speakerChange} rule is applied last.
     *
     * Cannot be used with {@link combineSpeaker}
     */
    public combineSegments = false

    /**
     * Max length of body text to use when {@link combineSegments} is true
     */
    public combineSegmentsLength: number = DEFAULT_COMBINE_SEGMENTS_LENGTH

    /**
     * Combine consecutive segments from the same speaker.
     *
     * Note: If this is enabled, {@link combineEqualTimes} and {@link combineSegments} will not be applied.
     *
     * Warning: if the transcript does not contain speaker information, resulting segment will contain entire transcript text.
     */
    public combineSpeaker = false

    /**
     * Only include {@link Segment.speaker} when speaker changes
     *
     * May be used in combination with {@link combineSpeaker}, {@link combineEqualTimes}, or {@link combineSegments}
     */
    public speakerChange = false

    /**
     * Create the options manager
     */
    constructor() {
        if (!OptionsManager._instance) {
            OptionsManager._instance = this
        }
        // eslint-disable-next-line no-constructor-return
        return OptionsManager._instance
    }

    /**
     * Get option value from it's name
     *
     * @param name name of option to get
     * @returns value of option. If unknown, returns undefined
     */
    public getOptionByName = (name: string): boolean | string | number => {
        let actual
        switch (name) {
            case "combineEqualTimes":
                actual = this.combineEqualTimes
                break
            case "combineEqualTimesSeparator":
                actual = this.combineEqualTimesSeparator
                break
            case "combineSegments":
                actual = this.combineSegments
                break
            case "combineSegmentsLength":
                actual = this.combineSegmentsLength
                break
            case "combineSpeaker":
                actual = this.combineSpeaker
                break
            case "speakerChange":
                actual = this.speakerChange
                break
            default:
                break
        }
        return actual
    }

    /**
     * Set option value using it's name
     *
     * @param name name of option to set
     * @param value value to set option to
     */
    public setOptionByName = (name: string, value: boolean | string | number): void => {
        switch (name) {
            case "combineEqualTimes":
                verifyType(name, "boolean", value)
                this.combineEqualTimes = <boolean>value
                break
            case "combineEqualTimesSeparator":
                verifyType(name, "string", value)
                this.combineEqualTimesSeparator = <string>value
                break
            case "combineSegments":
                verifyType(name, "boolean", value)
                this.combineSegments = <boolean>value
                break
            case "combineSegmentsLength":
                verifyType(name, "number", value)
                this.combineSegmentsLength = <number>value
                break
            case "combineSpeaker":
                verifyType(name, "boolean", value)
                this.combineSpeaker = <boolean>value
                break
            case "speakerChange":
                verifyType(name, "boolean", value)
                this.speakerChange = <boolean>value
                break
            default:
                break
        }
    }

    /**
     * Set all options to their default value
     */
    public restoreDefaultSettings = (): void => {
        this.setOptions(
            {
                combineEqualTimes: false,
                combineEqualTimesSeparator: "\n",
                combineSegments: false,
                combineSegmentsLength: DEFAULT_COMBINE_SEGMENTS_LENGTH,
                combineSpeaker: false,
                speakerChange: false,
            },
            false,
        )
    }

    /**
     * Set one or more options
     *
     * @param options the options to set
     * @param setDefault true: set all values to the default before setting values specified by `options`
     */
    public setOptions = (options: IOptions, setDefault = true): void => {
        if (setDefault) {
            this.restoreDefaultSettings()
        }
        if (options === undefined) {
            return
        }
        ;(Object.keys(options) as Array<keyof IOptions>).forEach((option) => {
            this.setOptionByName(option, options[option])
        })
    }

    /**
     * Helper to determine if at least one option should be applied
     *
     * @returns true: at least one option set
     */
    public optionsSet = (): boolean => {
        const { combineEqualTimes, combineSegments, combineSpeaker, speakerChange } = this
        return combineEqualTimes || combineSegments || combineSpeaker || speakerChange
    }
}

export const Options = new OptionsManager()
