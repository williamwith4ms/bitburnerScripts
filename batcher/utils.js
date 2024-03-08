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
		ns.writePort(info.logPort, "Prepping " + info.target);
		const servers = findServers(ns);
		//ns.tprint(servers);
		let maxMoney = ns.getServerMaxMoney(info.target);
		let money = ns.getServerMoneyAvailable(info.target);
		let sec = ns.getServerSecurityLevel(info.target);
		let minSec = ns.getServerMinSecurityLevel(info.target);
		let tolerance = 0.0005;
		for (const server of servers) {
			ns.scp("/share/weaken.js", server);
			ns.scp("/share/grow.js", server);
		}
		if (!Math.abs(sec - minSec) < tolerance) {
			ns.writePort(
				info.logPort,
				"Adjusting security level on " + info.target
			);
			let sleepTime = ns.getWeakenTime(info.target);
			sleepTime = ns.getWeakenTime(info.target);
			for (const server of servers) {
				//ns.tprint(server);
				let threads = Math.floor(
					(ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) /
						1.75
				);
				if (threads <= 0) continue;
				ns.exec("/share/weaken.js", server, threads, info.target);
			}
			await ns.sleep(sleepTime);
		}

		if (money < maxMoney) {
			ns.writePort(info.logPort, "Growing " + info.target);
			let sleepTime = ns.getGrowTime(info.target);
			for (const server of servers) {
				let threads = Math.floor(
					(ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) /
						1.75
				);
				if (threads <= 0) continue;
				ns.exec("/share/grow.js", server, threads, info.target);
			}
			await ns.sleep(sleepTime);
		}
	}
	return true;
}
/** @param {import("..").NS} ns */
export async function upgradeServers(ns, info) {
	let servers = ns.getPurchasedServers();
	let ram = 2;
	try {
		ram = ns.getServerMaxRam(servers[0]);
		ram *= 2;
	} catch (e) {
	}
	let money = ns.getServerMoneyAvailable("home");
	let serverCost = ns.getPurchasedServerCost(ram);
	// Purchase servers if server cost * server limit < money / 5
	if (serverCost * ns.getPurchasedServerLimit() < money / 5) {
		ns.writePort(
			info.logPort,
			`INFO: Upgrading servers. Server cost: ${serverCost} Money: ${money} Server Limit: ${ns.getPurchasedServerLimit()} RAM: ${ram}`
		);
		for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
			let name = "pserv-" + i;
			if (servers.includes(name)) {
				if (ns.getServerMaxRam(name) < ram) {
					ns.killall(name);
					ns.deleteServer(name);
				} else {
					continue;
				}
			}
			ns.purchaseServer(name, ram);
			ns.writePort(
				info.logPort,
				"SUCCESS: Purchased server: ",
				name,
				" RAM: ",
				ram
			);
		}
		await ns.sleep(1000);
		return true;
	} else {
		ns.writePort(
			info.logPort,
			"INFO: Skipping server upgrade. Insufficient funds."
		);
		await ns.sleep(1000);
		return false;
	}
	await ns.sleep(1000);
}

/** @param {import("..").NS} ns */
export function findServers(ns) {
    let servers = [];
    let serversToScan = ns.scan("home")
		while (serversToScan.length > 0) {
			let server = serversToScan.shift();
			if (!servers.includes(server) && server !== "home" && server !== "darkweb") {
				servers.push(server);
				serversToScan = serversToScan.concat(ns.scan(server));
                let openPorts = 0;
                if (ns.fileExists("BruteSSH.exe")) {
                    ns.brutessh(server);
                    openPorts++;
                }
                if (ns.fileExists("FTPCrack.exe")) {
                    ns.ftpcrack(server);
                    openPorts++;
                }
                if (ns.fileExists("RelaySMTP.exe")) {
                    ns.relaysmtp(server);
                    openPorts++;
                }
                if (ns.fileExists("HTTPWorm.exe")) {
                    ns.httpworm(server);
                    openPorts++;
                }
                if (ns.fileExists("SQLInject.exe")) {
                    ns.sqlinject(server);
                    openPorts++;
                }
                if (ns.getServerNumPortsRequired(server) <= openPorts) {
                    ns.nuke(server);
                }
            }
        }
		//ns.tprint(servers);
		return servers;
}
/** @param {import("..").NS} ns */
export function bestServer(ns,servers) {
	let best = "";
	let bestScore = 0;
	for (const server of servers) {
		if (!ns.hasRootAccess(server)) continue;
		if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) continue;
		if (server === "home") continue;

		let serv = ns.getServer(server)
		// ns.tprint(serv);
		let score = serv.moneyMax / serv.minDifficulty / ns.getWeakenTime(serv.hostname);
		//ns.tprint(`${serv.hostname} ${serv} ${serv.minDifficulty} ${ns.getWeakenTime(serv.hostname)}`);
		if (score > bestScore) {
			best = serv.hostname;
			bestScore = score;
		}
	}
	return best;
}