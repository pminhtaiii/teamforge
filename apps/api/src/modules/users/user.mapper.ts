import type { User, PublicUser } from "./user.types.js";

export function toPublicUser(user: User): PublicUser {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
    }
}