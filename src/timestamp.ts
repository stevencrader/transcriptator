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
 * Format the timestamp number to a human readable string in the format HH:mm:SS.fff
 *
 * @param timestamp Time in seconds to format
 * @returns formatted timestamp string
 */
export const formatTimestamp = (timestamp: number): string => {
    const hours = String(Math.floor(timestamp / 3600)).padStart(2, "0")
    const remaining = timestamp % 3600
    const minutes = String(Math.floor(remaining / 60)).padStart(2, "0")
    const seconds = String(Math.floor(remaining % 60)).padStart(2, "0")
    const ms = String(Math.round((timestamp - Math.floor(timestamp)) * 1000)).padStart(3, "0")

    return `${hours}:${minutes}:${seconds}.${ms}`
}
