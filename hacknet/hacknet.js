/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	ns.clearLog();

	// find the most cost effective upgrade for the nodes
	while (true) {
		if (
			ns.hacknet.getPurchaseNodeCost() <
			ns.getServerMoneyAvailable("home") * 0.05
		) {
			ns.hacknet.purchaseNode();
		}
		const numNodes = ns.hacknet.numNodes();

		if (numNodes === 0) {
			ns.hacknet.purchaseNode();
		}

		for (let node = 0; node < numNodes; node++) {
			const hacknet = ns.hacknet.getNodeStats(node);
			const coreMult = getCoreUpgradeMultiplier(hacknet.cores);
			const ramMult = getRamUpgradeMultiplier(hacknet.ram);
			const levelMult = getUpgradeLevelMultiplier(hacknet.level);

			const upgrades = { core: coreMult, ram: ramMult, level: levelMult };

			for (let upgrade in upgrades) {
				if (upgrade === "core") {
					const cost = ns.hacknet.getCoreUpgradeCost(node, 1);
					if (cost === Infinity) continue;
					if (cost > ns.getServerMoneyAvailable("home") * 0.05)
						continue;

					const moneyIncrease =
						hacknet.production * coreMult - hacknet.production;
					const timeToPayOff = cost / moneyIncrease;
					if (
						(timeToPayOff < 600 &&
							ns.getServerMoneyAvailable("home") > cost) ||
						hacknet.cores < 4 ||
						cost < ns.getServerMoneyAvailable("home") * 0.01
					) {
						ns.print(`SUCCESS: Upgrading core on node ${node}`);
						ns.hacknet.upgradeCore(node);
					}
				}
				if (upgrade === "ram") {
					const cost = ns.hacknet.getRamUpgradeCost(node, 1);
					if (cost === Infinity) continue;
					if (cost > ns.getServerMoneyAvailable("home") * 0.05)
						continue;

					const moneyIncrease =
						hacknet.production * ramMult - hacknet.production;
					const timeToPayOff = cost / moneyIncrease;
					if (
						(timeToPayOff < 600 &&
							ns.getServerMoneyAvailable("home") > cost) ||
						hacknet.ram < 4 ||
						cost < ns.getServerMoneyAvailable("home") * 0.01
					) {
						ns.print(`SUCCESS: Upgrading ram on node ${node}`);
						ns.hacknet.upgradeRam(node);
					}
				}
				if (upgrade === "level") {
					const cost = ns.hacknet.getLevelUpgradeCost(node, 1);
					if (cost === Infinity) continue;
					if (cost > ns.getServerMoneyAvailable("home") * 0.05)
						continue;

					const moneyIncrease =
						hacknet.production * levelMult - hacknet.production;
					const timeToPayOff = cost / moneyIncrease;

					if (
						(timeToPayOff < 600 &&
							ns.getServerMoneyAvailable("home") > cost) ||
						hacknet.level < 10 ||
						cost < ns.getServerMoneyAvailable("home") * 0.01
					) {
						ns.print(`SUCCESS: Upgrading level on node ${node}`);
						ns.hacknet.upgradeLevel(node);
					}
				}
			}
		}

		// buy a new node if it is less than 5% of the current ns.getServerMoneyAvailable("home")

		await ns.sleep(0);
	}
}

function getUpgradeLevelMultiplier(level) {
	return (level + 1) / level;
}
function getRamUpgradeMultiplier(ram) {
	return Math.pow(1.035, ram * 2 - 1) / Math.pow(1.035, ram - 1);
}
function getCoreUpgradeMultiplier(core) {
	return (core + 6) / 6 / ((core + 5) / 6);
}
