import { type SQLiteDatabase } from "expo-sqlite";
import { mig00 } from "./00-10/00";
import { mig01 } from "./00-10/01";

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
	const DATABASE_VERSION = 2;
	let version = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
	if (version === null) {
		return;
	}
	let { user_version: currentDbVersion } = version;
	if (currentDbVersion >= DATABASE_VERSION) {
		return;
	}
	// await db.execAsync(`
	// 	BEGIN TRANSACTION;
	// 	DROP TABLE images;
	// 	DROP TABLE product_images;
	// 	COMMIT;`);

	if (currentDbVersion === 0) {
		await db.execAsync(mig00);
		currentDbVersion = 1;
	}
	if (currentDbVersion === 1) {
		await db.execAsync(mig01);
		currentDbVersion = 2;
	}
	await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
