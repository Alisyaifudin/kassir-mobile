/* eslint-disable @typescript-eslint/no-redeclare */
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Temporal } from "temporal-polyfill";
import { z } from "zod";
import { DAY_IN_MS } from "./constants";

export namespace Session {
	export async function logout() {
		await SecureStore.deleteItemAsync("session");
	}
	export async function updateRole(role: Role): Promise<"Success" | "Fail"> {
		const session = await get();
		if (session === null) return "Fail";
		if (role === "admin") return "Fail";
		session.role = role;
		return "Success";
	}
	async function store(session: Session): Promise<"Aplikasi bermasalah" | null> {
		try {
			const str = JSON.stringify(session);
			await SecureStore.setItemAsync("session", str);
			return null;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	export async function login(name: string, role: Role): Promise<"Aplikasi bermasalah" | null> {
		try {
			const now = Temporal.Now.instant().epochMilliseconds;
			const errMsg = await store({ name, role, exp: now + 5 * DAY_IN_MS });
			return errMsg;
		} catch (error) {
			console.error(error);
			return "Aplikasi bermasalah";
		}
	}
	export async function get(): Promise<null | Session> {
		try {
			const sessionStr = await SecureStore.getItemAsync("session");
			if (sessionStr === null) return null;
			const sessionObj = JSON.parse(sessionStr);
			const session = sessionSchema.parse(sessionObj);
			const now = Temporal.Now.instant().epochMilliseconds;
			if (now > session.exp) {
				await SecureStore.deleteItemAsync("session");
				return null;
			}
			if (now > session.exp - 2 * DAY_IN_MS) {
				session.exp = now + 5 * DAY_IN_MS;
				await store(session);
			}
			return session;
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}

const sessionSchema = z.object({
	name: z.string(),
	role: z.enum(["user", "admin", "manager"]),
	exp: z.number(),
});

export type Session = z.infer<typeof sessionSchema>;

export namespace crypt {
	export async function hash(password: string): Promise<string> {
		// Generate a random salt (16 bytes = 128 bits)
		const salt = await Crypto.getRandomBytesAsync(16);
		const saltHex = Array.from(salt)
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("");

		// Combine password with salt and hash
		const combined = password + saltHex;
		const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA512, combined);

		// Store salt with hash in format: algorithm$salt$hash
		return `${saltHex}$${hashed}`;
	}

	export async function verify(password: string, storedHash: string): Promise<boolean> {
		try {
			// Extract components from stored hash
			const [saltHex, originalHash] = storedHash.split("$");

			// Recompute the hash
			const combined = password + saltHex;
			const hashed = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA512, combined);

			// Compare hashes in constant time
			return constantTimeCompare(hashed, originalHash);
		} catch (error) {
			console.error("Password verification error:", error);
			return false;
		}
	}

	/**
	 * Constant time comparison to prevent timing attacks
	 */
	function constantTimeCompare(a: string, b: string): boolean {
		if (a.length !== b.length) {
			return false;
		}

		let result = 0;
		for (let i = 0; i < a.length; i++) {
			result |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		return result === 0;
	}
}
