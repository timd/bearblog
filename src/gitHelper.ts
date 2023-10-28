import { exec } from 'child_process';

function executeCommand(command: string, directory: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: directory }, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

export async function gitAdd(directory: string) {
    await executeCommand('git add .', directory);
}
  
export async function gitCommit(message: string, directory: string) {
    await executeCommand(`git commit -m "${message}"`, directory);
}
  
export async function gitPush(branch: string, directory: string) {
    await executeCommand(`git push origin ${branch}`, directory);
}

export async function performGitOperations(directory: string, branch: string, message: string, push: boolean) {
    
    try {
      await gitAdd(directory);

      await gitCommit(message, directory);

      if(push) {
          await gitPush(branch, directory);
      }

    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }
  