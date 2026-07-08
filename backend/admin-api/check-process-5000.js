const { execSync } = require('child_process');
try {
  const output = execSync('netstat -ano | findstr :5000').toString();
  console.log('Connections on 5000:\n', output);
  const lines = output.trim().split('\n');
  const pids = new Set();
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && pid !== '0') pids.add(pid);
  }
  for (const pid of pids) {
    try {
      const procInfo = execSync(`powershell -Command "Get-CimInstance Win32_Process -Filter \\"ProcessId = ${pid}\\" | Select-Object CommandLine | Format-List"`).toString();
      console.log(`Process ID ${pid} Info:\n`, procInfo);
    } catch (e) {
      console.log(`Could not get info for PID ${pid}:`, e.message);
    }
  }
} catch (e) {
  console.log('Error:', e.message);
}
process.exit(0);
