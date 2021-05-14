/**
 * Runs a command and returns the output and exit code
 * @param cmd The command args to run
 * @returns The process exit code
 */
export async function run(
  cmd: string[],
): Promise<{ stdout: string; stderr: string; status: number }> {
  const p = Deno.run({
    cmd,
    stderr: "piped",
    stdout: "piped",
  });
  const [status, stdout, stderr] = await Promise.all([
    p.status(),
    p.output(),
    p.stderrOutput(),
  ]);
  p.close();
  return {
    status: status.code,
    stdout: stdout.toString(),
    stderr: stderr.toString(),
  };
}

/**
 * Launches a program with disconnected stdin/stdout/stderr. Returns a Promise
 * for the process exit code.
 */
export async function launch(...cmd: string[]): Promise<number> {
  const p = Deno.run({
    cmd,
    stdout: "null",
    stderr: "null",
    stdin: "null",
  });
  const status = await p.status();
  return status.code;
}
