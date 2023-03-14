const PATTERN_TIMESTAMP = /^(?<time>((?<hour>\d+):|)((?<minute>\d+):|)((?<second>\d+)|))([,.](?<ms>\d+|)|)$/m

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
    if (splitLength > 3) {
        throw new TypeError(`Too many time fields in ${time}`)
    } else if (splitLength === 3) {
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

    if (Number.isNaN(timestamp)) {
        throw new TypeError(`Sum for timestamp resulted in NaN (time = ${splits}, ms = ${ms})`)
    }

    return timestamp
}
