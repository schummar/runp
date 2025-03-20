import { exec } from 'child_process';
import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';

export async function loadNpmPackage(pkg: string): Promise<{ name: string; scriptNames: string[] }> {
  let json;
  try {
    json = await readFile(resolve(pkg, 'package.json'), 'utf-8');
  } catch {
    return { name: '', scriptNames: [] };
  }

  try {
    const pkg = JSON.parse(json);
    return { name: pkg.name, scriptNames: Object.keys(pkg.scripts ?? {}) };
  } catch (e) {
    console.error('Failed to read package.json:', e);
    return { name: '', scriptNames: [] };
  }
}

const supportedNpmRunners = ['npm', 'pnpm', 'yarn'] as const;

export async function loadNpmWorkspaceScripts(cwd: string): Promise<{ scriptName: string; scriptCommand: (args: string[]) => string[] }[]> {
  const npmRunner = await whichNpmRunner(cwd);
  const workspaceRoot = resolve(cwd);
  const workspaces = await listNpmWorkspaces(npmRunner, cwd);
  const scripts = new Array<{ scriptName: string; scriptCommand: (args: string[]) => string[] }>();

  const scriptCommandPrefix = {
    npm: (workspaceName: string, workspacePath: string, script: string) => (args: string[]) => [
      'npm',
      ...(workspacePath === workspaceRoot ? [] : [`--workspace=${workspaceName}`]),
      'run',
      '--silent',
      script,
      ...(args.length ? ['--', ...args] : []),
    ],
    pnpm: (workspace: string, workspacePath: string, script: string) => (args: string[]) => [
      'pnpm',
      ...(workspacePath === workspaceRoot ? [] : [`--filter=${workspace}`]),
      'run',
      '--silent',
      script,
      ...(args.length ? ['--', ...args] : []),
    ],
    yarn: (workspace: string, workspacePath: string, script: string) => (args: string[]) => [
      'yarn',
      ...(workspacePath === workspaceRoot ? [] : ['workspace', workspace]),
      'run',
      '--silent',
      script,
      ...(args.length ? ['--', ...args] : []),
    ],
  }[npmRunner];

  for (const workspacePath of workspaces) {
    const { name, scriptNames } = await loadNpmPackage(workspacePath);

    for (const scriptName of scriptNames) {
      scripts.push({
        scriptName: workspacePath === workspaceRoot ? scriptName : `${name}:${scriptName}`,
        scriptCommand: scriptCommandPrefix(name, workspacePath, scriptName),
      });
    }
  }

  return scripts;
}

export async function whichNpmRunner(cwd: string) {
  if ((supportedNpmRunners as unknown as string[]).includes(process.env.RUNP_PACKAGE_MANAGER ?? '')) {
    return process.env.RUNP_PACKAGE_MANAGER as (typeof supportedNpmRunners)[number];
  }

  if (process.env.npm_config_user_agent?.startsWith('yarn/')) {
    return 'yarn';
  } else if (process.env.npm_config_user_agent?.startsWith('pnpm/')) {
    return 'pnpm';
  } else if (process.env.npm_execpath?.endsWith('npm/')) {
    return 'npm';
  }

  try {
    await stat(resolve(cwd, 'yarn.lock'));
    return 'yarn';
  } catch {
    // ignore
  }

  try {
    await stat(resolve(cwd, 'pnpm-lock.yaml'));
    return 'pnpm';
  } catch {
    // ignore
  }

  return 'npm';
}

export async function listNpmWorkspaces(npmRunner: 'npm' | 'pnpm' | 'yarn', cwd: string): Promise<string[]> {
  const workspaces = new Array<string>();

  const command = {
    npm: 'npm query .workspace',
    pnpm: 'pnpm ls -r --depth=-1 --json',
    yarn: 'yarn workspaces info --json',
  }[npmRunner];

  try {
    const result = await new Promise<string>((resolve, reject) => {
      exec(command, { cwd }, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });

    const resultCleaned = `[${result.replace(/\]\s*\[/g, '],[')}]`;
    const json = JSON.parse(resultCleaned).flat();

    if (!Array.isArray(json)) {
      throw new Error('workspace list did not return an array');
    }

    for (const pkg of json) {
      if (typeof pkg !== 'object' || pkg === null) {
        console.warn('workspace list returned an invalid entry:', JSON.stringify(pkg));
        continue;
      }

      const path = pkg.path ?? pkg.location;

      if (typeof path !== 'string') {
        console.warn('workspace list returned an entry without a valid path:', JSON.stringify(pkg));
        continue;
      }

      workspaces.push(resolve(path));
    }
  } catch (e) {
    console.warn('Failed to read workspaces:', e);
  }

  const workspaceRoot = resolve(cwd);

  if (!workspaces.includes(workspaceRoot)) {
    workspaces.push(workspaceRoot);
  }

  return workspaces;
}
