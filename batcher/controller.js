import { isPrepped, prep } from "batcher/utils.js";
/* 

1) Figure out the optimal size and number of batches.
2) Schedule your entire depth into distinct queues for each job type, note that this is just the schedule, no execs have happened yet.
3) Set the end time of the first weaken (or second for HWGW) as the initial cutoff and deploy every job with an expected start time before that cutoff#
4) Refill the schedule
5) Wait for that weaken to finish (nextWrite)
6) Set the next weaken to end as the new cutoff and deploy every job with an expected start time before then
7) Repeat from 4 forever

*/

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
	ns.clearLog();
	let target = "n00dles";
	let servers = JSON.parse(ns.read("/data/servers.txt"));

	for (const server of servers) {
		for (const script of scripts) {
			ns.scp(script, server, "home");
		}
	}

	
	const serverPool = new ServerPool(ns, servers);
	const info = new Info(ns, target);

	if (!isPrepped(ns, target)) {
		ns.print(`Awaiting prep`);
		await prep(ns, info, serverPool);
	}
	info.update(ns);
	ns.print(`Prepped`);
	ns.print(`Optimizing batch...`);
	optimizeBatch(ns, info, serverPool);
	info.update(ns);
	ns.print(`Optimized`);
	const batch = [];
	ns.print(`Creating batch...`);
	for (const type of TYPES) {
		ns.print(`Creating ${type} job`);
		info.ends[type] =
			performance.now() + info.wTime + (info.spacer * OFFSETS[type]) + 100;
		const job = new Job(type, info);
		if (!serverPool.assign(job)) {
			ns.tprint(`ERROR: Unable to assign ${type} dumping debug info`);
			ns.tprint(job);
			ns.tprint(info);
			serverPool.printBlocks(ns);
			return;
		}
		batch.push(job);
		ns.print(`Job created`);
	}
	ns.print(`Batch created`);
	ns.print(`Running batch...`);
	for (const job of batch) {
		ns.tprint(job);
		ns.exec(
			workers[job.type],
			job.server,
			{ threads: job.threads, temporary: true },
			JSON.stringify(job)
		);
	}
	ns.print(`Batch running`);

	const timer = setInterval(() => {
		ns.ui.clearTerminal();
		ns.tprint(
			`Hacking \$${ns.formatNumber(
				info.maxMoney * info.sPercent
			)} from ${info.target}`
		);
		ns.tprint(
			`Running batch: ETA ${ns.tFormat(
				info.ends.weaken2 - performance.now()
			)}`
		);
	}, 1000);

	ns.atExit(() => clearInterval(timer));
	await ns.asleep(info.wTime);
	clearInterval(timer);
	ns.tprint(`Done!`);
}

class Job {
	constructor(type, info, server = "none") {
		this.type = type;
		this.ends = info.ends[type];
		this.time = info.times[type];
		this.target = info.target;
		this.threads = info.threads[type];
		this.cost = this.threads * COSTS[type];
		this.server = server;
		this.report = false;
		this.port = info.port;
		this.batch = 0;
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

		this.wTime - ns.getWeakenTime(server);
		this.spacer = 5;
		this.chance = ns.hackAnalyzeChance(server);

		this.times = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
		this.starts = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
		this.threads = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
		this.ends = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };

		//this.port = ns.pid();
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
		this.depth = (this.wTime / this.spacer) * 4;

		const hPercent = ns.hackAnalyze(server);
		const amount = maxMoney * sPercent;
		const hThreads = Math.max(
			1,
			Math.floor(ns.hackAnalyzeThreads(server, amount))
		);
		const tSPercent = hPercent - hThreads;
		const gThreads = Math.ceil(
			ns.growthAnalyze(
				server,
				1+ (maxMoney / (maxMoney - maxMoney * tSPercent))
			)
		);
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
	#maxBlockRam = 0;
	#minBlockRam = Infinity;
	#totalRam = 0;
	#maxRam = 0;
	#index = new Map();

	/** @param {import("..").NS} ns */
	constructor(ns, servers) {
		for (const server of servers) {
			if (!ns.hasRootAccess(server)) continue; // next item if no root access
			const maxRam = ns.getServerMaxRam(server);
			const ram = maxRam - ns.getServerUsedRam(server);

			//if (ram <= 1.7) continue; // next item if not enough ram for a single script
			const block = { server: server, ram: ram };
			this.#blocks.push(block);
			if (maxRam > this.#maxBlockRam) this.#maxBlockRam = maxRam;
			if (maxRam < this.#minBlockRam) this.#minBlockRam = maxRam;
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

	get minBlockRam() {
		return this.#minBlockRam;
	}

	get maxBlockRam() {
		return this.#maxBlockRam;
	}

	assign(job) {
		const block = this.#blocks.find((block) => block.ram >= job.cost);
		if (block) {
			job.server = block.server;
			block.ram -= job.cost;
			this.#totalRam -= job.cost;
			return true;
		}
		return false;
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
		this.#blocks.forEach((block) => ns.print(block));
	}
}

export function optimizeBatch(ns, info, serverPool) {
	// brute force method start at stealing 99% down to 0.1% and take the largest that fits

	const maxThreads = serverPool.maxBlockRam / 1.75;
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
		const tSPercent = hPercent * hThreads;
		const gThreads = Math.ceil(
			ns.growthAnalyze(
				info.target,
				1+ (maxMoney / (maxMoney - maxMoney * tSPercent))
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
