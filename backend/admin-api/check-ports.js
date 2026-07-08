const { execSync } = require('child_process');
try {
  for (const port of [5000, 5001]) {
    console.log(`=== PORT ${port} ===`);
    try {
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      console.log(output);
      const lines = output.trim().split('\n');
      const pids = new Set();
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0') pids.add(pid);
      }
      for (const pid of pids) {
        try {
          const procInfo = execSync(`powershell -Command "Get-CimInstance Win32_Process -Filter \\"ProcessId = ${pid}\\" | Select-Object -Property Path, CommandLine | Format-List"`).toString();
          console.log(`Process ID ${pid} Info:\n`, procInfo);
        } catch (e) {
          console.log(`Could not get info for PID ${pid}:`, e.message);
        }
      }
    } catch (e) {
      console.log(`No processes on port ${port}`);
    }
  }
} catch (e) {
  console.log('Error:', e.message);
}
process.exit(0);
