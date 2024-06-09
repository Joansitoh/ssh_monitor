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

$template sshFailFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:Invalid user ([a-zA-Z0-9_.-]+) from ([0-9.]+\\.[0-9.]+\\.[0-9.]+\\.[0-9.]+)--end%\n"
$template sshSuccessFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:Accepted password for ([a-zA-Z0-9_.-]+) from ([0-9.]+) port ([0-9]+) ssh2--end%\n"
$template sshKeyAuthFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:Accepted publickey for ([a-zA-Z0-9_.-]+) from ([0-9.]+\\.[0-9.]+\\.[0-9.]+\\.[0-9.]+) port ([0-9]+) ssh2: .*--end%\n"

$template sudoFailFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:pam_unix\\(sudo:auth\\): authentication failure; logname=([a-zA-Z0-9_.-]+) uid=([0-9]+) euid=([0-9]+) tty=([a-zA-Z0-9_.-/]+) ruser=([a-zA-Z0-9_.-]+) rhost=  user=([a-zA-Z0-9_.-]+)--end%"
$template sudoSuccessFormat,"%timestamp:::date-rfc3339% %msg:R,ERE,1,FIELD:([^:]+) :--end%\n"

# Rule for failed SSH login attempts
if $programname == 'sshd' and $msg contains 'Invalid user' then /var/log/netvisr/ssh_failed.log;sshFailFormat

# Rule for failed SSH login attempts using password
if $programname == 'sshd' and $msg contains 'Failed password' then /var/log/netvisr/ssh_failed.log;sshFailFormat

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
