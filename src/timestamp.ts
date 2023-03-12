const PATTERN_TIMESTAMP = /^(?<time>((?<hour>\d+):|)((?<minute>\d+):|)((?<second>\d+)|))([,.](?<ms>\d+|)|)$/m
const PATTERN_DECIMAL = /[,.]/

export const parseTimestamp = (value: string | number): number => {
    if (typeof value === "number") {
        return value
    } else if (typeof value !== "string") {
        throw new TypeError(`Cannot parse timestamp of type ${typeof value}}`)
    }

    const match = PATTERN_TIMESTAMP.exec(value.trim())
    if (match === null) {
        throw new TypeError(`Not enough separator fields in timestamp string`)
    }

    const time = match.groups.time
    const splits = time.split(":")
    const splitLength = splits.length
    let timestamp = 0
    if (splitLength > 3) {
        throw new TypeError(`Too many time fields in ${time}`)
    } else if (splitLength == 3) {
        timestamp = parseInt(splits[0]) * 60 * 60 + parseInt(splits[1]) * 60 + parseInt(splits[2])
    } else if (splitLength == 2) {
        timestamp = parseInt(splits[0]) * 60 + parseInt(splits[1])
    } else if (splitLength == 1) {
        timestamp = parseInt(splits[0])
    }

    let ms = parseInt(match.groups.ms)
    if (isNaN(ms)) {
        ms = 0
    } else if (ms != 0) {
        ms = ms / 1000
    }
    timestamp += ms

    if (isNaN(timestamp)) {
        throw new TypeError(`Sum for timestamp resulted in NaN (time = ${splits}, ms = ${ms})`)
    }

    return timestamp
}
