import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const checkSyslog = () => {
  // Check if file /etc/rsyslog.d/netvisr.conf exists
  const netvisrConf = "/etc/rsyslog.d/netvisr.conf";
  return fs.existsSync(netvisrConf);
};

const createSyslog = () => {
  // Create file /etc/rsyslog.d/netvisr.conf
  const netvisrConf = "/etc/rsyslog.d/netvisr.conf";
  const netvisrConfContent = `# Netvisr logs format for SSH and Sudo activities

$template sshInvalidUserFormat,"%timestamp:::date-rfc3339% Invalid user %msg:R,ERE,1,FIELD:Invalid user ([a-zA-Z0-9_.-]+) from ([0-9.]+) port [0-9]+--end% from %msg:R,ERE,1,FIELD:from ([0-9.]+)--end%\n"
$template sshFailedPasswordFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:([a-zA-Z0-9_.-]+) from ([0-9.]+)--end%\n"

$template sshSuccessFormat,"%timestamp:::date-rfc3339% Accepted password for %msg:R,ERE,1,FIELD:Accepted password for ([a-zA-Z0-9_.-]+) from ([0-9.]+) port [0-9]+--end% from %msg:R,ERE,1,FIELD:from ([0-9.]+)--end%\n"
$template sshKeyAuthFormat,"%timestamp:::date-rfc3339% Accepted publickey for %msg:R,ERE,1,FIELD:Accepted publickey for ([a-zA-Z0-9_.-]+) from ([0-9.]+) port [0-9]+--end% from %msg:R,ERE,1,FIELD:from ([0-9.]+)--end%\n"

$template sudoFailFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:pam_unix\\(sudo:auth\\): authentication failure; logname=([a-zA-Z0-9_.-]+) uid=([0-9]+) euid=([0-9]+) tty=([a-zA-Z0-9_.-/]+) ruser=([a-zA-Z0-9_.-]+) rhost=  user=([a-zA-Z0-9_.-]+)--end%"
$template sudoSuccessFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:([^:]+) :--end%\n"

# Rule for failed SSH login attempts due to invalid user
if $programname == 'sshd' and $msg contains 'Invalid user' then /var/log/netvisr/ssh_failed.log;sshInvalidUserFormat

# Rule for failed SSH login attempts due to failed password
if $programname == 'sshd' and $msg contains 'Failed password' then /var/log/netvisr/ssh_failed.log;sshFailedPasswordFormat

# Rule for successful SSH login attempts using password
if $programname == 'sshd' and $msg contains 'Accepted password' then /var/log/netvisr/ssh_accepted.log;sshSuccessFormat

# Rule for successful SSH login attempts using public key
if $programname == 'sshd' and $msg contains 'Accepted publickey' then /var/log/netvisr/ssh_accepted.log;sshKeyAuthFormat

# Rule for sudo password failures
if $programname == 'sudo' and $msg contains 'authentication failure' then /var/log/netvisr/sudo_failed.log;sudoFailFormat

# Rule for sudo password successes
if $programname == 'sudo' and $msg contains 'COMMAND=' and not ($msg contains 'incorrect password attempt') then /var/log/netvisr/sudo_accepted.log;sudoSuccessFormat
`;
  fs.writeFileSync(netvisrConf, netvisrConfContent);
};

const createScripts = () => {
  // Define source and destination paths
  const sourceJudgePath = path.join(__dirname, "files/netvisr-judge.sh");
  const sourcePolicePath = path.join(__dirname, "files/netvisr-police.sh");
  const destJudgePath = path.join("/usr/bin", "netvisr-judge");
  const destPolicePath = path.join("/usr/bin", "netvisr-police");

  // Copy and rename netvisr-judge.sh
  fs.copyFileSync(sourceJudgePath, destJudgePath);
  fs.chmodSync(destJudgePath, "755"); // Make the script executable

  // Copy and rename netvisr-police.sh
  fs.copyFileSync(sourcePolicePath, destPolicePath);
  fs.chmodSync(destPolicePath, "755"); // Make the script executable
};

const createCronJob = () => {
  cron.schedule("*/5 * * * *", () => {
    console.log("Starting ip police job...");
    exec("/bin/bash /usr/bin/netvisr-police", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
    });
  });

  cron.schedule("*/7 * * * *", () => {
    console.log("Starting log judge job...");
    exec("/bin/bash /usr/bin/netvisr-judge", (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
    });
  });
};

const restartSyslog = () => {
  // Restart rsyslog service
  exec("systemctl restart rsyslog", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
  });
};

export {
  checkSyslog,
  createSyslog,
  restartSyslog,
  createCronJob,
  createScripts,
};
