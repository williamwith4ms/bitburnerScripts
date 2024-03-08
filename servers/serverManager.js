/** @param {import("..").NS} ns */
export async function main(ns) {
    let servers = ns.getPurchasedServers();
    let ram = 2;
    ns.tail();
    ns.disableLog("ALL");

    while (true) {
        let money = ns.getServerMoneyAvailable("home");
        let serverCost = ns.getPurchasedServerCost(ram);
        // Purchase servers if server cost * 25 < money / 10
        if (serverCost * ns.getPurchasedServerLimit() < money / 5) {
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
                ns.print("SUCCESS: Purchased server: ", name, " RAM: ", ram);
            }
            ram *= 2;
            servers = ns.getPurchasedServers();
        }
        await ns.sleep(1000);
    }
}