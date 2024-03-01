/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.run("hack/deployer.js");
	ns.run("contracts/contracts.js");
	ns.run("servers/serverManager.js");
}
