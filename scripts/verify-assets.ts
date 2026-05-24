import { access, readFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { parseWorldCyclesData } from "../src/domain/worldCycles";

const publicDir = resolve("public");
const worldCyclesPath = resolve(publicDir, "data/world_cycles.json");
const manifestNames = [
	"manifest.zh-TW.webmanifest",
	"manifest.zh-CN.webmanifest",
	"manifest.en-US.webmanifest",
];

interface WebManifest {
	icons?: unknown;
	screenshots?: unknown;
}

function isImagePath(value: string): boolean {
	return /\.(svg|png|jpe?g|gif|webp|avif)$/i.test(value);
}

function resolvePublicAssetPath(assetPath: string): string {
	const withoutBase = assetPath
		.replace(/^\/Warframe-World-State-Timer\//, "")
		.replace(/^\.\//, "")
		.replace(/^\//, "");
	const resolved = resolve(publicDir, withoutBase);
	const relativePath = relative(publicDir, resolved);

	if (relativePath.startsWith("..") || isAbsolute(relativePath)) {
		throw new Error(`Asset path escapes public directory: ${assetPath}`);
	}

	return resolved;
}

async function assertAssetExists(assetPath: string, context: string): Promise<void> {
	const resolved = resolvePublicAssetPath(assetPath);

	try {
		await access(resolved);
	} catch {
		throw new Error(`${context}: missing asset "${assetPath}" (${resolved}).`);
	}
}

function getManifestAssets(value: unknown, path: string): string[] {
	if (!Array.isArray(value)) {
		throw new Error(`${path} must be an array.`);
	}

	return value.map((asset, index) => {
		if (!asset || typeof asset !== "object" || typeof asset.src !== "string") {
			throw new Error(`${path}[${index}].src must be a string.`);
		}

		return asset.src;
	});
}

const worldCyclesData = parseWorldCyclesData(JSON.parse(
	await readFile(worldCyclesPath, "utf-8"),
));

for (const [worldId, world] of Object.entries(worldCyclesData.worlds)) {
	for (const state of world.states) {
		if (state.icon && isImagePath(state.icon)) {
			await assertAssetExists(
				state.icon,
				`worlds.${worldId}.states.${state.key}.icon`,
			);
		}
	}
}

for (const manifestName of manifestNames) {
	const manifestPath = resolve(publicDir, manifestName);
	const manifest = JSON.parse(
		await readFile(manifestPath, "utf-8"),
	) as WebManifest;

	const iconAssets = getManifestAssets(manifest.icons, `${manifestName}.icons`);
	const screenshotAssets = getManifestAssets(
		manifest.screenshots,
		`${manifestName}.screenshots`,
	);

	for (const asset of [...iconAssets, ...screenshotAssets]) {
		await assertAssetExists(asset, manifestName);
	}
}

console.log("Asset verification completed.");
