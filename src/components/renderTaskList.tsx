import { RenderOptions, createRoot } from '@schummar/react-terminal';
import { Store } from 'cross-state';
import { Task, TaskState } from '../task';
import { TaskList } from './taskList';

export type WriteLineGrouped = (text: string, taskState: Store<TaskState>) => void;

export function renderTaskList(tasks: Task[], options?: RenderOptions) {
  const { render, writeLine } = createRoot(options);

  let currentTask: Store<TaskState> | undefined;

  const endTask = () => {
    if (!currentTask) {
      return;
    }

    writeLine('');
    writeLine(`<- [${currentTask.get().title}] --`, {
      grow: 1,
      shrink: 1,
      ellipsis: true,
      bold: true,
      backgroundColor: 'blue',
    });
  };

  const writeLineGrouped: WriteLineGrouped = (text, taskState) => {
    if (taskState !== currentTask) {
      endTask();

      writeLine('');
      writeLine(`-- [${taskState.get().title}] ->`, {
        grow: 1,
        shrink: 1,
        ellipsis: true,
        bold: true,
        backgroundColor: 'blue',
      });
      writeLine('');
    }

    currentTask = taskState;
    writeLine(text);
  };

  tasks.forEach((task) =>
    task.result
      .catch(() => undefined)
      .finally(() => {
        if (task.state === currentTask) {
          endTask();
          currentTask = undefined;
        }
      }),
  );

  return render(<TaskList tasks={tasks} writeLine={writeLineGrouped} />);
}
