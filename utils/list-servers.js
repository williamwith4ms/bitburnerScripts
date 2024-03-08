/** @param {NS} ns */
export function main(ns) {
    let servers = [];
    let serversToScan = ns.scan("home")
		while (serversToScan.length > 0) {
			let server = serversToScan.shift();
			if (!servers.includes(server) && server !== "home" && server !== "darkweb") {
				servers.push(server);
				serversToScan = serversToScan.concat(ns.scan(server));
                let openPorts = 0;
                if (ns.fileExists("BruteSSH.exe")) {
                    ns.brutessh(server);
                    openPorts++;
                }
                if (ns.fileExists("FTPCrack.exe")) {
                    ns.ftpcrack(server);
                    openPorts++;
                }
                if (ns.fileExists("RelaySMTP.exe")) {
                    ns.relaysmtp(server);
                    openPorts++;
                }
                if (ns.fileExists("HTTPWorm.exe")) {
                    ns.httpworm(server);
                    openPorts++;
                }
                if (ns.fileExists("SQLInject.exe")) {
                    ns.sqlinject(server);
                    openPorts++;
                }
                if (ns.getServerNumPortsRequired(server) <= openPorts) {
                    ns.nuke(server);
                }
            }
        }
        let jsonServer = JSON.stringify(servers);
        ns.write("/data/servers.txt", jsonServer, "w")
}