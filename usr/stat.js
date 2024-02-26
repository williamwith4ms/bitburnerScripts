/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL")
    let server = ns.args[0]

    if (typeof server === "string") {

        let money = ns.getServerMoneyAvailable(server);
        let usedRam = ns.getServerUsedRam(server);
        if (money === 0) money = 1;
        const maxMoney = ns.getServerMaxMoney(server);
        const minSec = ns.getServerMinSecurityLevel(server);
        const sec = ns.getServerSecurityLevel(server);
        const maxRam = ns.getServerMaxRam(server);
        
        ns.tprint(` ---${server}---`);
        
        // max ram and ram usage
        ns.tprint(` RAM        : ${usedRam} / ${maxRam} (${(usedRam / maxRam * 100).toFixed(2)}%)`)

        // general server info
        ns.tprint(` Level      : ${ns.getHackingLevel()} / ${ns.getServerRequiredHackingLevel(server)} (${(ns.getHackingLevel() / ns.getServerRequiredHackingLevel(server) * 100).toFixed(2)}%)`)
        ns.tprint(` $          : $${ns.formatNumber(money)} / $${ns.formatNumber(maxMoney)} (${(money / maxMoney * 100).toFixed(2)}%)`);
        ns.tprint(` Security   : +${(sec - minSec).toFixed(2)}`);

        // the time taken for certain operations
        ns.tprint(` Hack time  : ${ns.tFormat(ns.getHackTime(server))}`)
        ns.tprint(` Grow time  : ${ns.tFormat(ns.getGrowTime(server))} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`);
        ns.tprint(` Weak time  : ${ns.tFormat(ns.getWeakenTime(server))} (t=${Math.ceil(sec - minSec) * 20})`);
        ns.tprint(` Grow rate  : `,ns.getServerGrowth(server))

        // prints the time to grow the server by a multiple
        ns.tprint(` Grow x2    : ${ns.growthAnalyze(server, 2).toFixed(2)} threads`);
        ns.tprint(` Grow x3    : ${ns.growthAnalyze(server, 3).toFixed(2)} threads`);
        ns.tprint(` Grow x4    : ${ns.growthAnalyze(server, 4).toFixed(2)} threads`);

        // prints the time to hack the server by a percent
        ns.tprint(` Hack 10%   : ${(ns.hackAnalyzeThreads(server, (money * 0.25))).toFixed(2)} threads`)
        ns.tprint(` Hack 25%   : ${(ns.hackAnalyzeThreads(server, (money * 0.25))).toFixed(2)} threads`)
        ns.tprint(` Hack 50%   : ${(ns.hackAnalyzeThreads(server, (money * 0.50))).toFixed(2)} threads`)
    } // END of if (server == "")

    else {
    ns.tprint("This command requires a server as an argument")
    }
}
export const autocomplete = (data) => data.servers;