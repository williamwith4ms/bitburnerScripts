/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL"); ns.tail(); ns.clearLog();

	ns.exec("/utils/list-servers.js", "home", 1);
	let servers = JSON.parse(ns.read("/data/servers.txt"));

	let dict = {};
	servers = servers.forEach((server) => {
		dict[server] = 0;
	});

	Object.entries(dict).forEach(([server, count]) => {
		const files = ns.ls(server);
		files.forEach((file) => {
			if (file.includes(".cct")) {
				dict[server]++;
			}
		});
	});

	Object.keys(dict)
		.filter((key) => dict[key] > 0)
		.forEach((key) => ns.tprint(`${key}: ${dict[key]}`));
}