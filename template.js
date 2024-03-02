/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL"); ns.tail(); ns.clearLog();
}