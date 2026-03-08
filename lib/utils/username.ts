import { supabase } from '../supabase'

/**
 * Validates a username based on Instagram-like rules:
 * - 3-30 characters
 * - Alphanumeric, underscores, and dots
 * - Cannot start or end with a dot
 * - Cannot have consecutive dots
 */
export function validateUsername(username: string): { isValid: boolean, error?: string } {
    const minLength = 3
    const maxLength = 30

    if (username.length < minLength) {
        return { isValid: false, error: `Username must be at least ${minLength} characters.` }
    }

    if (username.length > maxLength) {
        return { isValid: false, error: `Username must be less than ${maxLength} characters.` }
    }

    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and dots.' }
    }

    if (username.startsWith('.') || username.endsWith('.')) {
        return { isValid: false, error: 'Username cannot start or end with a dot.' }
    }

    if (/\.\./.test(username)) {
        return { isValid: false, error: 'Username cannot contain consecutive dots.' }
    }

    if (!/^[a-zA-Z]/.test(username)) {
        return { isValid: false, error: 'Username must start with a letter.' }
    }

    return { isValid: true }
}

/**
 * Checks if a username is already taken in the profiles table.
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
    const cleanUsername = username.toLowerCase().trim()
    if (cleanUsername.length < 3) return false

    const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername)
        .maybeSingle()

    if (error) {
        console.error('Error checking username availability:', error)
        return false
    }

    return !data
}

/**
 * Generates username suggestions based on a base string.
 */
export async function generateUsernameSuggestions(base: string): Promise<string[]> {
    const cleanBase = base.toLowerCase().replace(/[^a-z0-9]/g, '')
    const suggestions: string[] = []

    const suffixes = [
        'travels', 'trips', 'wanderer', 'nomad', 'explorer',
        '123', '2024', 'official', 'vlogs'
    ]

    // Shuffle suffixes for variety
    const shuffled = suffixes.sort(() => 0.5 - Math.random())

    for (const suffix of shuffled) {
        const candidate = `${cleanBase}_${suffix}`
        const isAvailable = await checkUsernameAvailability(candidate)
        if (isAvailable) {
            suggestions.push(candidate)
        }
        if (suggestions.length >= 3) break
    }

    // If we still need more, try numbers
    let i = 1
    while (suggestions.length < 3 && i < 10) {
        const candidate = `${cleanBase}${Math.floor(Math.random() * 1000)}`
        const isAvailable = await checkUsernameAvailability(candidate)
        if (isAvailable) {
            suggestions.push(candidate)
        }
        i++
    }

    return suggestions
}
