/** @param {import("..").NS} ns */
export async function main(ns) {
	let servers = ns.getPurchasedServers();
	let ram = 2;
	ns.tail();
	ns.disableLog("ALL");

	while (true) {
		for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
			let name = "pserv-" + i;
			while (ns.getPurchasedServerCost(ram) > (ns.getServerMoneyAvailable("home") * 0.2)) {
				await ns.sleep(50);
			}
			if (servers.includes(name)) {
				if (ns.getServerMaxRam(name) < ram) {
					ns.killall(name);
					ns.deleteServer(name);
				} else {
					continue;
				}
			}
			ns.purchaseServer(name,ram)
			ns.print("SUCCESS: Purchased server: ",name," RAM: ",ram);
		}
		ram *= 2;
		servers = ns.getPurchasedServers()
		await ns.sleep(0);
	}
}