/** @param {import("..").NS} ns */
export async function main(ns) {
	const job = JSON.parse(ns.args[0]);
	let delay = job.ends - job.time - performance.now();
	if (delay < 0) {
		ns.tprint(`WARN: Batch ${job.batch} ${job.type} was ${-delay}ms too late. (${job.ends})\n`);
		ns.writePort(ns.pid, -delay);
		delay = 0;
	} else {
		ns.writePort(ns.pid, 0);
	}
	await ns.grow(job.target, {additionalMsec: delay});
	const end = performance.now();
	ns.atExit(() => {
		// if (job.report) ns.writePort(job.port, job.type + job.server);
		ns.tprint(`Batch ${job.batch}: ${job.type} finished at ${end.toString()}`);
	});
}