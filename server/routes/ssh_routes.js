import fs from 'fs';
import util from 'util';

export default async function (fastify, opts) {
    fastify.get("/ssh-logs", async (request, reply) => {
        const readFile = util.promisify(fs.readFile);
        try {
            const data = await readFile('/var/log/auth.log', 'utf8');
            const sshAttempts = data.split('\n').filter(line => line.includes('sshd'));
            return { sshAttempts };
        } catch (err) {
            console.error(err);
            return { error: 'Unable to read SSH logs' };
        }
    });
}