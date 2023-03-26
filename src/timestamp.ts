/**
 * Regular expression for detecting all valid timestamps
 */
const PATTERN_TIMESTAMP = /^(?<time>((?<hour>\d+):|)((?<minute>\d+):|)((?<second>\d+)|))([,.](?<ms>\d+|)|)$/m

/**
 * Parse timestamp from value
 *
 * Supported formats must match {@link PATTERN_TIMESTAMP}
 *
 * @param value Value to parse timestamp from. If number, assumes already a timestamp in seconds.
 * @returns Parsed timestamp in seconds
 * @throws {TypeError} When value is not a string
 * @throws {TypeError} When value does not match {@link PATTERN_TIMESTAMP}
 */
export const parseTimestamp = (value: string | number): number => {
    if (typeof value === "number") {
        return value
    }
    if (typeof value !== "string") {
        throw new TypeError(`Cannot parse timestamp of type ${typeof value}}`)
    }

    const match = PATTERN_TIMESTAMP.exec(value.trim())
    if (match === null) {
        throw new TypeError(`Not enough separator fields in timestamp string`)
    }

    const { time } = match.groups
    const splits = time.split(":")
    const splitLength = splits.length
    let timestamp = 0
    if (splitLength === 3) {
        timestamp = parseInt(splits[0], 10) * 60 * 60 + parseInt(splits[1], 10) * 60 + parseInt(splits[2], 10)
    } else if (splitLength === 2) {
        timestamp = parseInt(splits[0], 10) * 60 + parseInt(splits[1], 10)
    } else if (splitLength === 1) {
        timestamp = parseInt(splits[0], 10)
    }

    let ms = parseInt(match.groups.ms, 10)
    if (Number.isNaN(ms)) {
        ms = 0
    } else if (ms !== 0) {
        ms /= 1000
    }
    timestamp += ms

    return timestamp
}

/**
 * Timestamp formatter
 */
export interface FormatterCallback {
    (timestamp: number): string
}

/**
 * Provides a way to convert numeric timestamp to a formatted string.
 *
 * A custom formatter may be registered.
 * If one isn't registered, the default formatter will be used and the data will be formatted as HH:mm:SS.fff
 */
export class TimestampFormatter {
    static _instance: TimestampFormatter

    private customFormatter: FormatterCallback = undefined

    /**
     * Create the formatter
     */
    constructor() {
        if (!TimestampFormatter._instance) {
            TimestampFormatter._instance = this
        }
        // eslint-disable-next-line no-constructor-return
        return TimestampFormatter._instance
    }

    /**
     * Default formatter where the timestamp number is formatted to a human readable string in the format HH:mm:SS.fff
     *
     * @param timestamp Time in seconds to format
     * @returns formatted timestamp string
     */
    private static defaultFormatter = (timestamp: number): string => {
        const hours = String(Math.floor(timestamp / 3600)).padStart(2, "0")
        const remaining = timestamp % 3600
        const minutes = String(Math.floor(remaining / 60)).padStart(2, "0")
        const seconds = String(Math.floor(remaining % 60)).padStart(2, "0")
        const ms = String(Math.round((timestamp - Math.floor(timestamp)) * 1000)).padStart(3, "0")

        return `${hours}:${minutes}:${seconds}.${ms}`
    }

    /**
     * Format the timestamp to a human readable string.
     *
     * If a custom formatter has been registered, it will be used.
     * If not, the default formatter is used and the data will be returned in the format HH:mm:SS.fff
     *
     * @param timestamp Time in seconds to format
     * @returns formatted timestamp string
     */
    public format = (timestamp: number): string => {
        if (this.customFormatter === undefined) {
            return TimestampFormatter.defaultFormatter(timestamp)
        }
        return this.customFormatter(timestamp)
    }

    /**
     * Register a custom timestamp formatter
     *
     * @param formatter function to call to format timestamp to string
     */
    public registerCustomFormatter = (formatter: FormatterCallback): void => {
        this.customFormatter = formatter
    }

    /**
     * Remove the custom formatter (if one registered)
     */
    public unregisterCustomFormatter = (): void => {
        this.customFormatter = undefined
    }
}

export const timestampFormatter = new TimestampFormatter()
