/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL")
    ns.tail()

    const refreshRate = 500
    const server = ns.args[0]

    while (true) {

        let money = ns.getServerMoneyAvailable(server);
        let usedRam = ns.getServerUsedRam(server);
        if (money === 0) money = 1;
        const maxMoney = ns.getServerMaxMoney(server);
        const minSec = ns.getServerMinSecurityLevel(server);
        const sec = ns.getServerSecurityLevel(server);
        const maxRam = ns.getServerMaxRam(server);

        ns.print(` ---${server}---`);
        // max ram and ram usage
        ns.print(` RAM        : ${usedRam} / ${maxRam} (${(usedRam / maxRam * 100).toFixed(2)}%)`)
        // general server info
        ns.print(` Level      : ${ns.getHackingLevel()} / ${ns.getServerRequiredHackingLevel(server)} (${(ns.getHackingLevel() / ns.getServerRequiredHackingLevel(server) * 100).toFixed(2)}%)`)
        ns.print(` $          : $${ns.formatNumber(money)} / $${ns.formatNumber(maxMoney)} (${(money / maxMoney * 100).toFixed(2)}%)`);
        ns.print(` Security   : +${(sec - minSec).toFixed(2)}`);
        // the time taken for certain operations
        ns.print(` Hack time  : ${ns.tFormat(ns.getHackTime(server))}`)
        ns.print(` Grow time  : ${ns.tFormat(ns.getGrowTime(server))} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`);
        ns.print(` Weak time  : ${ns.tFormat(ns.getWeakenTime(server))} (t=${Math.ceil(sec - minSec) * 20})`);
        await ns.sleep(refreshRate)
        ns.clearLog()
    }
}

export function autocomplete(data, args) {
    return data.servers;
}