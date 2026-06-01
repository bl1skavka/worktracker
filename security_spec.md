# Security Specification: Work Hours Tracker

## 1. Data Invariants
These rules guarantee high-confidence integrity across our database:
- A user can only access their own `users/{userId}` settings document and their own sub-collection of `shifts`.
- The user must be authenticated and email-verified (`request.auth.token.email_verified == true`).
- A shift document ID must be valid, conforming to `YYYY-MM-DD` string rules and cannot exceed 128 chars.
- Immutability: Once created, `userId` and `createdAt` cannot be modified.
- Validation: All numbers for regular and overtime hours must be set to values >= 0, and notes cannot exceed 500 characters.
- Strict Temporal Validation: `createdAt` matches `request.time` on create, and `updatedAt` matches `request.time` on both create and update.

## 2. The "Dirty Dozen" Payloads
The following payloads are designed to challenge identity, size constraints, and immutability, and must be denied by Firestore Rules:

1. **Payload 1 (Identity Spoofing - Create):** Creating a document inside `users/user_A/shifts/2026-06-01` but setting `userId` to `user_B`.
2. **Payload 2 (Identity Spoofing - Update):** Modifying an existing shift's `userId` field to a different value.
3. **Payload 3 (Unverified Email):** Attempting any write when `request.auth.token.email_verified` is `false`.
4. **Payload 4 (Ghost Field Shadow Injection):** Attempting to update `users/user_A` settings with a random non-schema field like `isAdmin: true` or `proMode: true`.
5. **Payload 5 (ID Poisoning/Resource Exhaustion):** Creating a shift with an ID that has safe characters but is 500 characters long, or contains unusual escape sequences.
6. **Payload 6 (Invalid Hours Type):** Setting `regularHours` to a boolean value or a string.
7. **Payload 7 (Negative Hours):** Setting `regularHours` or `overtimeHours` to less than 0.
8. **Payload 8 (Immortality Violation):** Attempting to change `createdAt` of a shift after it has been created.
9. **Payload 9 (Server Timestamp bypass - Create):** Trying to write a specific static string instead of `request.time` as the `createdAt` value.
10. **Payload 10 (Server Timestamp bypass - Update):** Trying to write a specific static string instead of `request.time` as the `updatedAt` value.
11. **Payload 11 (Oversized Note Block):** Writing a `notes` field string that exceeds 500 characters (Denial of Wallet payload).
12. **Payload 12 (Anonymity/Missing Auth):** Writing a shift document with no authentication headers at all.

## 3. Test Cases (TDD Scenario)
Our testing scenario ensures that the security rules successfully catch and reject all twelve variations. Any failure will flag a permission denied response, confirming the lockdown.
