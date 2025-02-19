import vue from "@vitejs/plugin-vue";
import { readdirSync } from "fs";
import { filter, map } from "lodash-es";
import { defineConfig, type PluginOption } from "vite";
import dts from "vite-plugin-dts";

const getDirectoriesSync = (basePath: string) => {
	const entries = readdirSync(basePath, { withFileTypes: true });

	return map(
		filter(entries, (entry) => entry.isDirectory()),
		(entry) => entry.name
	);
};

export default defineConfig({
	plugins: [
		vue(),
		dts({
			tsconfigPath: "../../tsconfig.build.json",
			outDir: "dist/types",
		}) as PluginOption,
	],
	build: {
		outDir: "dist/es",
		lib: {
			entry: "./index.ts",
			name: "Placidity",
			fileName: "index",
			formats: ["es"],
		},
		rollupOptions: {
			external: [
				"vue",
				"@fortawesome/fontawesome-svg-core",
				"@fortawesome/free-solid-svg-icons",
				"@fortawesome/vue-fontawesome",
				"@popperjs/core",
				"async-validator",
			],
			output: {
				assetFileNames: (chunkInfo) => {
					if (chunkInfo.name == "style.css") return "index.css";
					return chunkInfo.name || "index.css";
				},
				manualChunks: (id) => {
					if (id.includes("node_modules")) {
						return "vendor";
					}
					if (id.includes("packages/hooks")) {
						return "hooks";
					}
					if (id.includes("packages/utils")) {
						return "utils";
					}
					for (const dirName of getDirectoriesSync("../components")) {
						if (id.includes(`packages/components/${dirName}`)) {
							return `components/${dirName}`;
						}
					}
				},
			},
		},
	},
});
