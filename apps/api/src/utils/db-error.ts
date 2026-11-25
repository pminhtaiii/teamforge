function isRecord(value: unknown): value is Record<string, unknown> {
    return (typeof value === "object" && value !== null && !Array.isArray(value))
}

export function isDuplicateEmailError(error: unknown): boolean {
    if (!isRecord(error)) {
        return false
    }
    const dbError = isRecord(error.cause) ? error.cause : error
    return (dbError.code === "23505" && dbError.constraint_name === "users_email_unique")
}