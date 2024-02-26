/** @param {import("..").NS} ns */
export async function main(ns) {
    let serversToScan = ns.scan("home");
    let server_value = 0;
    let best_value = 0;
    let best = "";

    ns.exec("/usr/list-servers.js", "home", 1);
    await ns.sleep(20);
    let servers = JSON.parse(ns.read("/data/servers.txt"));
    
    let avalible = ["n00dles"];
    for (let server of servers) {
        if (ns.hasRootAccess(server)) {
            if (
                ns.getHackingLevel() >
                    ns.getServerRequiredHackingLevel(server) * 1.1 &&
                ns.getHackTime(server) < 150000
            ) {
                avalible = avalible.concat(server);
            }
        }
    }
    for (let server in avalible) {
        server_value =
            ((ns.getServerMaxMoney(avalible[server]) *
                ns.getServerGrowth(avalible[server])) /
                ns.getGrowTime(avalible[server])) *
            ns.getWeakenTime(avalible[server]);
        if (best_value < server_value) {
            best_value = server_value;
            best = avalible[server];
        }
    }
    ns.exec("/usr/stats.js", "home", 1, best);
}
