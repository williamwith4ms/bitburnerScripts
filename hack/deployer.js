/** @param {import("..").NS} ns */
export async function main(ns) {
    ns.exec("/utils/list-servers.js", "home", 1);
    let target = "";
    let ramPerThread = ns.getScriptRam("/share/weaken.js");
    let best = "";
    let best_value = 0;
    let server_value = 0;
    let servers = [];
    let chosen = ns.args[0];
    
    ns.disableLog("ALL");
    ns.tail();
    
    if (!(ns.hasRootAccess("n00dles"))) {
        ns.nuke("n00dles");
    }
    
    while (true) {
        ns.exec("/utils/list-servers.js", "home", 1);
        await ns.sleep(50);
        let servers = JSON.parse(ns.read("/data/servers.txt"));
        let avalible = ["n00dles"];
        if (typeof chosen !== undefined)  {
        for (let server of servers) {
            if (ns.hasRootAccess(server)) {
                if (ns.getHackingLevel() > (ns.getServerRequiredHackingLevel(server) * 1.1) && ns.getHackTime(server) < 150000) {
                    avalible = avalible.concat(server);

                }
            }
        }
        }
        for (let server in avalible) {
            server_value = (ns.getServerMaxMoney(avalible[server]) * ns.getServerGrowth(avalible[server])) / (ns.getGrowTime(avalible[server])) * ns.getWeakenTime(avalible[server]);
            if (best_value < server_value) {
                best_value = server_value;
                best = avalible[server];
            }
        }
        
        
        target = best;
        ns.print("Best Server: ", target);

        let moneyThresh = ns.getServerMaxMoney(target);
        let securityThresh = ns.getServerMinSecurityLevel(target);
        let sleepTime = 3000;
        for (let server of servers) {
            ns.scp([
                "/share/weaken.js",
                "/share/grow.js",
                "/share/hack.js"
            ], server);
            if (ns.hasRootAccess(server)) {
                let ramAvailable =
                    ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
                let threads = Math.floor(ramAvailable / ramPerThread);

                if (threads > 0) {
                    if (ns.getServerSecurityLevel(target) > securityThresh) {
                        sleepTime = ns.getWeakenTime(target);
                        ns.print("SUCCESS: weaken (t=",threads,") on ", target);
                        ns.exec("/share/weaken.js", server, threads, target);
                    } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
                        sleepTime = ns.getGrowTime(target)
                        ns.print("SUCCESS: grow (t=",threads,") on ", target);
                        ns.exec("/share/grow.js", server, threads, target);
                    } else {
                        sleepTime = ns.getHackTime(target)
                        ns.print("SUCCESS: hack (t=",threads,") on ", target);
                        ns.exec("/share/hack.js", server, threads, target);
                    }
                }
            }
        }
        ns.print("Sleeping for ", (sleepTime + 20) / 1000, "s");
        await ns.sleep(sleepTime + 20);
    }
}