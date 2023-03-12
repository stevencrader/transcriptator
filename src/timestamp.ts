const PATTERN_TIMESTAMP = /^(?<hour>\d+):(?<minute>\d+):(?<second>\d+)[,.](?<ms>\d+)$/m

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

    const hour = parseInt(match.groups.hour) * 60 * 60
    const minute = parseInt(match.groups.minute) * 60
    const second = parseInt(match.groups.second)
    let ms = parseInt(match.groups.ms)
    if (ms != 0) ms = ms / 1000

    return hour + minute + second + ms
}
