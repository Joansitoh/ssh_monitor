import fs from "fs";
import { exec } from "child_process";

const checkSyslog = () => {
  // Check if file /etc/rsyslog.d/netvisr.conf exists
  const netvisrConf = "/etc/rsyslog.d/netvisr.conf";
  return fs.existsSync(netvisrConf);
};

const createSyslog = () => {
  // Create file /etc/rsyslog.d/netvisr.conf
  const netvisrConf = "/etc/rsyslog.d/netvisr.conf";
  const netvisrConfContent = `# Netvisr logs format for SSH and Sudo activities

$template sshFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:([a-zA-Z0-9_.-]+) from ([0-9.]+)--end%"
$template sudoFailFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:authentication failure; logname=([a-zA-Z0-9_.-]+) uid=([0-9]+) euid=([0-9]+) tty=([a-zA-Z0-9_.-/]+) ruser=([a-zA-Z0-9_.-]+) rhost=  user=([a-zA-Z0-9_.-]+)--end%"
$template sudoSuccessFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:([^:]+) :--end%\n"

# Rule for failed SSH login attempts
if $programname == 'sshd' and $msg contains 'Failed password' then /var/log/netvisr/ssh_failed.log;sshFormat

# Rule for successful SSH login attempts
if $programname == 'sshd' and $msg contains 'Accepted password' then /var/log/netvisr/ssh_accepted.log;sshFormat

# Rule for sudo password failures
if $programname == 'sudo' and $msg contains 'authentication failure' then /var/log/netvisr/sudo_fail.log;sudoFailFormat

# Rule for sudo password successes
if $programname == 'sudo' and $msg contains 'COMMAND=' and not ($msg contains 'incorrect password attempt') then /var/log/netvisr/sudo_success.log;sudoSuccessFormat
`;
  fs.writeFileSync(netvisrConf, netvisrConfContent);
};

const restartSyslog = () => {
  // Restart rsyslog service
  exec("systemctl restart rsyslog", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
};

export { checkSyslog, createSyslog, restartSyslog };
