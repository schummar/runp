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

  for (const task of tasks) {
    task.run(writeLineGrouped);
  }

  const tracked = new Set<Task>();
  tasks.forEach(trackCompletion);

  function trackCompletion(task: Task) {
    if (tracked.has(task)) {
      return;
    }
    tracked.add(task);

    task.result
      .catch(() => undefined)
      .finally(() => {
        if (task === currentTask) {
          endTask();
          currentTask = undefined;
        }
      });

    task.state
      .map((x) => x.subTasks)
      .subscribe((subTasks) => {
        subTasks.forEach(trackCompletion);
      });
  }
}
