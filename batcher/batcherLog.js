/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL"); ns.tail(); ns.clearLog();
    const dataFile = "/data/batcherLog.txt";
    ns.clear(dataFile);
    const dataPort = ns.getPortHandle(ns.pid);

    while(true) {
        const data = dataPort.read();
        if (data === "NULL PORT DATA") { await ns.sleep(0); continue; }
        ns.print(data);
        ns.write(dataFile, data, "a");
        await ns.sleep(0);
    }
}