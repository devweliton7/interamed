import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/anvisa-BC_QqJGx.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var buscarNoServidor_createServerFn_handler = createServerRpc({
	id: "c27ed10bba880d5730da9dc2b3d68d0e96bd2af961625492bc33cf9c08cec313",
	name: "buscarNoServidor",
	filename: "src/services/anvisa.ts"
}, (opts) => buscarNoServidor.__executeServer(opts));
var buscarNoServidor = createServerFn({ method: "GET" }).inputValidator((nome) => nome).handler(buscarNoServidor_createServerFn_handler, async ({ data: nome }) => {
	const url = `https://api-medicamentos-anvisa.vercel.app/${encodeURIComponent(nome)}`;
	try {
		const res = await fetch(url, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(8e3)
		});
		console.log("[ANVISA Server]", nome, "status:", res.status);
		if (!res.ok) return [];
		const data = await res.json();
		console.log("[ANVISA Server] itens:", Array.isArray(data) ? data.length : "formato inesperado");
		return Array.isArray(data) ? data : [];
	} catch (error) {
		console.error("[ANVISA Server] falhou:", url, error);
		return [];
	}
});
//#endregion
export { buscarNoServidor_createServerFn_handler };
