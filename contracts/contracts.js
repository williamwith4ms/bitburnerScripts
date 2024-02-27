import { solvers } from "contracts/solvers";

/** @param {import("..").NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.tail();
    ns.clearLog();
    while (true) {
        runContracts(ns);
        await ns.sleep(10000);
    }

    function runContracts() {
        ns.exec("/utils/list-servers.js", "home", 1);
        let servers = JSON.parse(ns.read("/data/servers.txt"));

        const cc = ns.codingcontract;
        let contracts = [];

        for (const server of servers) {
            for (const file of ns.ls(server)) {
                if (file.includes(".cct")) {
                    contracts.unshift({
                        server: server,
                        filename: file,
                        type: cc.getContractType(file, server),
                        data: cc.getData(file, server),
                    });
                }
            }
        }

        contracts.forEach((contract) => {
            let answer = solvers[contract.type](contract.data);
            if (answer !== "Not implemented") {
                let result = cc.attempt(answer, contract.filename, contract.server);
                if (result === "") ns.print(`WARN: Failed to solve, ${contract.type} on ${contract.server} (${contract.filename})`);

            }
        });
    }
}

