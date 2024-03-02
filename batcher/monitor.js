/** @param {import("..").NS} ns */
export async function main(ns) {
	ns.disableLog("ALL"); ns.tail(); ns.clearLog();

    const logFile = "data/batcherLogs.txt";
    ns.clear(logFile);
    let logPort = ns.getPortHandle(ns.pid);
    logPort.clear();

    let max = 0
    let count = 0
    let total = 0
    let errors = 0;

    while(true) {
        await logPort.nextWrite();
        do {
            const data = logPort.read();
            ns.print(data);
            ns.write(logFile, data, "a");
        } while (!logPort.empty());
    }
}