/* eslint-disable @typescript-eslint/no-require-imports */
import { type SQLiteDatabase } from "expo-sqlite";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

class Migration {
	constructor(public version: number, public file: string) {}
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
	const migrations = [
		new Migration(0, await loadMigrationFile(require("../assets/migrations/00.sql"))),
		new Migration(1, await loadMigrationFile(require("../assets/migrations/01.sql"))),
		new Migration(2, await loadMigrationFile(require("../assets/migrations/02.sql"))),
		new Migration(3, await loadMigrationFile(require("../assets/migrations/03.sql"))),
	];
	const DATABASE_VERSION = migrations.length;
	let version = await db.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
	if (version === null) {
		return;
	}
	let { user_version: currentDbVersion } = version;
	if (currentDbVersion >= DATABASE_VERSION) {
		return;
	}
	await db.execAsync("PRAGMA journal_mode = 'wal'");
	currentDbVersion = await runMigration(db, currentDbVersion, migrations);
	await db.execAsync(`PRAGMA user_version = ${currentDbVersion}`);
}
async function loadMigrationFile(assetModule: any): Promise<string> {
	try {
		const asset = Asset.fromModule(assetModule);
		if (!asset.localUri) {
			await asset.downloadAsync();
		}
		const sql = await FileSystem.readAsStringAsync(asset.localUri!);
		if (!sql) throw new Error(`Empty migration file for ${asset.uri}`);
		return sql;
	} catch (error) {
		console.error(`Failed to load migration file: ${error}`);
		throw error;
	}
}

async function runMigration(
	db: SQLiteDatabase,
	currentDbVersion: number,
	migs: Migration[]
): Promise<number> {
	for (const mig of migs) {
		if (currentDbVersion === mig.version) {
			await db.withTransactionAsync(async () => {
				await db.execAsync(mig.file);
			});
			currentDbVersion = mig.version + 1;
		}
	}
	return currentDbVersion;
}
