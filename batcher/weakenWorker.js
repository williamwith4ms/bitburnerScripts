
/** @param {NS} ns */
export async function main(ns) {
	ns.disableLog("ALL"); ns.tail(); ns.clearLog();
}

export function isPrepped(ns, server) {
    const minSecurity = ns.getServerMinSecurityLevel(server);
    const maxMoney = ns.getServerMaxMoney(server);
    const money = ns.getServerMoneyAvailable(server);
    const security = ns.getServerSecurityLevel(server);
    const tolerance = 0.005;
    const adjustedSecurity = Math.abs(security - minSecurity) < tolerance;
    return (money === maxMoney && adjustedSecurity) ? true : false;
}

export async function prep():