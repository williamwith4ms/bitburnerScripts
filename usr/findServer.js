/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");

	const path = [ns.args[0]];

	// this might look like it won't work but it does
	// this is because the first result of ns.scan is always closer to home
	// this means you can start scanning from the target server and work your way back to home
	while (path[0] !== "home") path.unshift(ns.scan(path[0])[0]);
	path.shift();
	ns.tprint(`\nconnect ${path.join(";connect ")}`);
}
export const autocomplete = (data) => data.servers;
