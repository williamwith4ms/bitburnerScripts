/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.tprint("This is a function library. It should not be run directly.");
}

/** @param {import("..").NS} ns */
export function isPrepped(ns, server) {
	let maxMoney = ns.getServerMaxMoney(server);
	let money = ns.getServerMoneyAvailable(server);
	let sec = ns.getServerSecurityLevel(server);
	let minSec = ns.getServerMinSecurityLevel(server);
	let tolerance = 0.0005;

	// adjust sec for floating point inaccuracy
	let adjustedSecurity = Math.abs(sec - minSec) < tolerance;

	return money === maxMoney && adjustedSecurity ? true : false;
}

/** @param {import("..").NS} ns */
export async function prep(ns, info, serverPool) {
	while (!isPrepped(ns, info.target)) {
		const servers = JSON.parse(ns.read("data/servers.txt"));
		let maxMoney = ns.getServerMaxMoney(info.target);
		let money = ns.getServerMoneyAvailable(info.target);
		let sec = ns.getServerSecurityLevel(info.target);
		let minSec = ns.getServerMinSecurityLevel(info.target);
		let tolerance = 0.0005;

		if (!Math.abs(sec - minSec) < tolerance) {
			let sleepTime = ns.getWeakenTime(info.target);
			sleepTime = ns.getWeakenTime(info.target);
			for (const server of servers) {
				let threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75);
				if (threads <= 0) continue;
				ns.exec("/share/weaken.js", server, threads, info.target);
			}
			await ns.sleep(sleepTime);
		}

		if (money < maxMoney) {
			let sleepTime = ns.getGrowTime(info.target);
			for (const server of servers) {
				let threads = Math.floor((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 1.75);
				if (threads <= 0) continue;
				ns.exec("/share/grow.js", server, threads, info.target);
			}
			await ns.sleep(sleepTime);
		}

	}
	return true;
}
