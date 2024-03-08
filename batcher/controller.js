import { isPrepped, prep,upgradeServers,findServers,bestServer } from "batcher/utils.js";
/** @param {import("..").NS} ns */

const TYPES = ["hack", "weaken1", "grow", "weaken2"];
const COSTS = { hack: 1.7, weaken1: 1.75, grow: 1.75, weaken2: 1.75 };
const scripts = [
	"/batcher/hackWorker.js",
	"/batcher/weakenWorker.js",
	"/batcher/growWorker.js",
];
const workers = {
	hack: "/batcher/hackWorker.js",
	weaken1: "/batcher/weakenWorker.js",
	grow: "/batcher/growWorker.js",
	weaken2: "/batcher/weakenWorker.js",
};
const OFFSETS = { hack: 0, weaken1: 1, grow: 2, weaken2: 3 };

/** @param {import("..").NS} ns */

export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();

	let logPort = ns.exec("/batcher/batcherLog.js","home");
	ns.exec("/utils/list-servers.js","home");
	/*while (true) {
		const dataPort = ns.getPortHandle(ns.pid);
		dataPort.clear();

		let target = "n00dles";
		let servers = findServers(ns)

		for (const server of servers) {
			for (const script of scripts) {
				ns.scp(script, server);
			}
		}
		
		const serverPool = new ServerPool(ns, servers);
		const info = new Info(ns, target);
		if (!isPrepped(ns, target)) {
			ns.print(`Awaiting prep`);
			await prep(ns, info, serverPool);
		}
		info.update(ns);
		optimizeBatch(ns, info, serverPool);
		info.update(ns);
		info.end = performance.now() + info.wTime - info.spacer;

		const jobs = [];
		batchCount++;
		for (const type of TYPES) {
			info.end += info.spacer;
			const job = new Job(type, info, batchCount);
			if (!serverPool.assign(job)) {
				ns.tprint(`ERROR: Unable to assign ${type} dumping debug info`);
				ns.tprint(job);
				ns.tprint(info);
				serverPool.printBlocks(ns);
				return;
			}
			jobs.push(job);
		}

		for (const job of jobs) {
			job.end += info.delay;
			const jobPID = ns.exec(
				workers[job.type],
				job.server,
				{ threads: job.threads, temporary: true },
				JSON.stringify(job)
			);
			if (!jobPID) {
				ns.tprint(
					`ERROR: Unable to start ${job.type} dumping debug info`
				);
				ns.tprint(job);
				ns.tprint(info);
				serverPool.printBlocks(ns);
				throw new Error("Unable to start job");
			}
			const tPort = ns.getPortHandle(jobPID);
			await tPort.nextWrite();
			info.delay += tPort.read();
		}
		ns.print(`Batch ${batchCount} started`);

		do {
			await dataPort.nextWrite();
			dataPort.clear();
			serverPool.finish(jobs.shift());
		} while (jobs.length > 0);
	}*/

	while (true) {
		const dataPort = ns.getPortHandle(ns.pid);
		dataPort.clear();
		let servers = findServers(ns);
		// ns.tprint(`servers: ${servers}`);
		for (const server of servers) {
			for (const script of scripts) {
				ns.scp(script, server);
			}
		}
		let target = bestServer(ns,servers);
		// let target = "n00dles";
		let info = new Info(ns, target);
		info.logPort = logPort;
		ns.writePort(info.logPort,`INFO: Starting batcher for ${target}`);
		let serverPool = new ServerPool(ns, servers);
		
		if (await upgradeServers(ns,info)) {
			serverPool = new ServerPool(ns, servers);
			info = new Info(ns, target);
			info.logPort = logPort;
		}

		servers = findServers(ns)
		if (!isPrepped(ns, target)) await prep(ns, info, serverPool);	
		ns.clearLog();

		//ns.tprint(`awaiting optimization`);
		await optimizeShotgun(ns, info, serverPool);
		info.update(ns);

		const jobs = [];
		let batchCount = 0;


		info.end = performance.now() + info.wTime - info.spacer;


		ns.writePort(info.logPort,`INFO: Creating Jobs for: ${info.depth} batches`);

		while (batchCount++ < info.depth) {
			for (const type of TYPES) {
				info.end += info.spacer;

				const job = new Job(type, info, batchCount);
				if (!serverPool.assign(job)) {
					ns.writePort(info.logPort,`ERROR: Unable to assign ${type}. Dumping debug info:`);
					ns.tprint(`ERROR: Unable to assign ${type}. Dumping debug info:`);
					ns.tprint(job);
					ns.tprint(info);
					serverPool.printBlocks(ns);
					return;
				}
				jobs.push(job);
			}
		}

		ns.writePort(info.logPort,`SUCCESS: Created Batches: ${batchCount - 1} batches`);
		ns.writePort(info.logPort,`INFO: Deploying Jobs: ${jobs.length} jobs`);
		for (const job of jobs) {
			job.end += info.delay;
			const jobPID = ns.exec(
				workers[job.type],
				job.server,
				{ threads: job.threads, temporary: true },
				JSON.stringify(job)
			);
			// ns.tprint(jobPID);
			if (!jobPID) {
				ns.tprint(
					`ERROR: Unable to start ${job.type} dumping debug info`
				);
				ns.tprint(job);
				ns.tprint(info);
				serverPool.printBlocks(ns);
				throw new Error(`Unable to start job ${job.type}`);
			}
			const tPort = ns.getPortHandle(jobPID);
			await tPort.nextWrite();
			info.delay += tPort.read();
		}
		ns.writePort(info.logPort,`SUCCESS: Deployed Jobs: successfully`);

		jobs.reverse();

		do {
			await dataPort.nextWrite();
			dataPort.clear();
			serverPool.finish(jobs.pop());
		} while (jobs.length > 0);

		ns.atExit(() => {
			ns.kill(logPort);
		});
	}

}

class Job {
	constructor(type, info, batch) {
		this.type = type;
		this.end = info.end;
		this.time = info.times[type];
		this.target = info.target;
		this.threads = info.threads[type];
		this.cost = this.threads * COSTS[type];
		this.server = "none";
		this.report = true;
		this.port = info.port;
		this.batch = batch;
		this.logPort = info.logPort;
		this.log = true;
	}
}

class Info {
	/** @param {import("..").NS} ns */
	constructor(ns, server) {
		this.target = server;
		this.maxMoney = ns.getServerMaxMoney(server);
		this.money = ns.getServerMoneyAvailable(server);
		this.minSec = ns.getServerMinSecurityLevel(server);
		this.sec = ns.getServerSecurityLevel(server);
		this.prepped = isPrepped(ns, server);
		this.sPercent = 0.1; // the amount to hack
		this.delay = 0;
		this.end = 0;
		this.depth = 0;
		this.logPort = 0;

		this.wTime - ns.getWeakenTime(server);
		this.spacer = 5;
		this.chance = ns.hackAnalyzeChance(server);

		this.times = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
		this.starts = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
		this.threads = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
		//this.ends = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };

		this.port = ns.pid;
	}
	/** @param {import("..").NS} ns */
	update(ns, sPercent = this.sPercent) {
		const server = this.target;
		const maxMoney = this.maxMoney;
		this.money = ns.getServerMoneyAvailable(server);
		this.sec = ns.getServerSecurityLevel(server);
		this.wTime = ns.getWeakenTime(server);
		this.times.weaken1 = this.wTime;
		this.times.weaken2 = this.wTime;
		this.times.hack = this.wTime / 4;
		this.times.grow = this.wTime * 0.8;
		//this.depth = (this.wTime / this.spacer) * 4;

		const hPercent = ns.hackAnalyze(server);
		const amount = maxMoney * sPercent;
		const hThreads = Math.max(
			1,
			Math.floor(ns.hackAnalyzeThreads(server, amount))
		);
		const tsPercent = hPercent * hThreads;
		const gThreads = Math.ceil(ns.growthAnalyze(server, maxMoney / (maxMoney - maxMoney * tsPercent)) * 1.01);
		this.threads.weaken1 = Math.max(
			Math.ceil((hThreads * 0.002) / 0.05),
			1
		);
		this.threads.weaken2 = Math.max(
			Math.ceil((gThreads * 0.004) / 0.05),
			1
		);
		this.threads.hack = hThreads;
		this.threads.grow = gThreads;
		this.chance = ns.hackAnalyzeChance(server);
	}
}

class ServerPool {
	#blocks = [];
	#maxBlockSize = 0;
	#minBlockSize = Infinity;
	#totalRam = 0;
	#maxRam = 0;
	#index = new Map();

	/** @param {import("..").NS} ns */
	constructor(ns, servers) {
		this.ns = ns;
		for (const server of servers) {
			if (!ns.hasRootAccess(server)) continue; // next item if no root access
			const maxRam = ns.getServerMaxRam(server);
			const ram = maxRam - ns.getServerUsedRam(server);
			//ns.tprint(`Server: ${server} has ${ram} ram`);
			//if (ram <= 1.7) continue; // next item if not enough ram for a single script
			const block = { server: server, ram: ram };
			this.#blocks.push(block);
			if (maxRam > this.#maxBlockSize) this.#maxBlockSize = maxRam;
			if (maxRam < this.#minBlockSize) this.#minBlockSize = maxRam;
			this.#totalRam += ram;
			this.#maxRam += maxRam;
		}
		this.#sort();
		this.#blocks.forEach((block, index) =>
			this.#index.set(block.server, index)
		);
	}

	#sort() {
		this.#blocks.sort((a, b) => {
			if (a.server === "home") return 1;
			if (b.server === "home") return -1;

			return a.ram - b.ram;
		});
	}

	getBlock(server) {
		if (this.#index.has(server))
			return this.#blocks[this.#index.get(server)];
		throw new Error(`Server: ${server} not found in pool`);
	}

	get totalRam() {
		return this.#totalRam;
	}

	get minBlockSize() {
		return this.#minBlockSize;
	}

	get maxBlockSize() {
		return this.#maxBlockSize;
	}

	assign(job) {
		const block = this.#blocks.find((block) => block.ram >= job.cost);
		if (block) {
			job.server = block.server;
			block.ram -= job.cost;
			this.#totalRam -= job.cost;
			return true;
		} else return false;
	}

	finish(job) {
		const block = this.getBlock(job.server);
		block.ram += job.cost;
		this.#totalRam += job.cost;
	}

	cloneBlocks() {
		return this.#blocks.map((block) => ({ ...block }));
	}

	printBlocks(ns) {
		this.#blocks.forEach((block) => ns.tprint(block));
	}

	testThreads(threadCosts) {
		const cPool = this.cloneBlocks();
		let batches = 0;
		let found = true;
		while (found) {
			for (const cost of threadCosts) {
				found = false;
				const block = cPool.find(block => block.ram >= cost);
				if (block) {
					block.ram -= cost;
					found = true;
				} else break;
			}
			if (found) batches++; 
		}
		return batches;
	}
}
/** @param {import("..").NS} ns */
function optimizeBatch(ns, info, serverPool) {
	// brute force method start at stealing 99% down to 0.1% and take the largest that fits

	const maxThreads = serverPool.maxBlockSize / 1.75;
	const maxMoney = info.maxMoney;
	const hPercent = ns.hackAnalyze(info.target);

	const minSPercent = 0.001;
	const step = 0.001;
	let sPercent = 0.99;

	while (sPercent > minSPercent) {
		const amount = maxMoney * sPercent;
		const hThreads = Math.max(
			1,
			Math.floor(ns.hackAnalyzeThreads(info.target, amount))
		);
		const tsPercent = hPercent * hThreads;
		const gThreads = Math.ceil(
			ns.growthAnalyze(
				info.target,
				maxMoney / (maxMoney - maxMoney * tsPercent)
			)
		);
		if (Math.max(hThreads, gThreads) <= maxThreads) {
			const wThreads1 = Math.max(Math.ceil((hThreads * 0.002) / 0.05), 1);
			const wThreads2 = Math.max(Math.ceil((gThreads * 0.004) / 0.05), 1);

			const threadCosts = [
				hThreads * 1.7,
				wThreads1 * 1.75,
				gThreads * 1.75,
				wThreads2 * 1.75,
			];

			const cPool = serverPool.cloneBlocks();
			let found;
			for (const cost of threadCosts) {
				found = false;
				for (const block of cPool) {
					if (block.ram < cost) continue;
					found = true;
					block.ram -= cost;
					break;
				}
				if (found) continue;
			}
			if (found) {
				info.sPercent = sPercent;
				info.threads = {
					hack: hThreads,
					weaken1: wThreads1,
					grow: gThreads,
					weaken2: wThreads2,
				};
				return true;
			}
		}
		sPercent -= step;
	}
	throw new Error("No solution found, something is wrong");
}
/** @param {import("..").NS} ns */
async function optimizeShotgun(ns, info, serverPool) {
	// Setup is mostly the same.
	ns.writePort(info.logPort,`INFO: Optimizing batch for ${info.target}`);
	const maxThreads = (serverPool.maxBlockSize / 1.75);
	ns.writePort(info.logPort,`INFO: Max Threads: ${maxThreads}`)
	const maxMoney = info.maxMoney;
	const hPercent = ns.hackAnalyze(info.target);
	const wTime = ns.getWeakenTime(info.target);

	const minsPercent = 0.001;
	const stepValue = 0.01;
	let sPercent = 0.99;
	let best = 0; 

	while (sPercent > minsPercent) {
		
		const amount = maxMoney * sPercent;
		const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(info.target, amount)), 1);
		const tsPercent = hPercent * hThreads;
		const gThreads = Math.ceil(ns.growthAnalyze(info.target, maxMoney / (maxMoney - maxMoney * tsPercent)) * 1.01);
		if (Math.max(hThreads, gThreads) <= maxThreads) {
			//ns.tprint(`hThreads: ${hThreads} gThreads: ${gThreads}`);
			const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
			const wThreads2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);

			const threadCosts = [hThreads * 1.7, wThreads1 * 1.75, gThreads * 1.75, wThreads2 * 1.75];
			
			const batchCount = serverPool.testThreads(threadCosts);
			const income = tsPercent * maxMoney * batchCount / (info.spacer * 4 * batchCount + wTime);
			if (income > best) {
				best = income;
				info.sPercent = tsPercent;
				info.depth = batchCount;
			}
		}
		await ns.sleep(0);
		sPercent -= stepValue;
	}
	ns.writePort(info.logPort,`SUCCESS: Optimization complete, best depth: ${info.depth} `);
	if (best === 0) throw new Error("Not enough ram to run even a single batch. Something has gone seriously wrong.");
}