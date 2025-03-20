import type { TextProps } from '@schummar/react-terminal';
import type { Task } from './task';

export type WriteLine = (text: string, task: Task) => void;

export function trackLinearOutput(tasks: Task[], writeLine: (line: string, options?: TextProps) => void) {
  let currentTask: Task | undefined;

  const endTask = () => {
    if (!currentTask) {
      return;
    }

    writeLine('');
    writeLine(`<- [${currentTask.state.get().title}] --`, {
      grow: 1,
      shrink: 1,
      ellipsis: true,
      bold: true,
      backgroundColor: 'blue',
    });
  };

  const writeLineGrouped: WriteLine = (text, task) => {
    if (!task.command.linearOutput) {
      return;
    }

    if (task !== currentTask) {
      endTask();

      writeLine('');
      writeLine(`-- [${task.state.get().title}] ->`, {
        grow: 1,
        shrink: 1,
        ellipsis: true,
        bold: true,
        backgroundColor: 'blue',
      });
      writeLine('');
    }

    currentTask = task;
    writeLine(text);
  };

  tasks.forEach((task) =>
    task.result
      .catch(() => undefined)
      .finally(() => {
        if (task === currentTask) {
          endTask();
          currentTask = undefined;
        }
      }),
  );

  for (const task of tasks) {
    task.run(writeLineGrouped);
  }
}
