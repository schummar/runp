import { RenderOptions, createRoot } from '@schummar/react-terminal';
import { Store } from 'cross-state';
import { Task, TaskState } from '../task';
import { TaskList } from './taskList';
import chalk from 'chalk';

export type WriteLineGrouped = (text: string, taskState: Store<TaskState>) => void;

export function renderTaskList(tasks: Task[], options?: RenderOptions) {
  const { render, writeLine } = createRoot(options);

  let lastTask: Store<TaskState> | undefined;

  const endTask = (task: Store<TaskState> | undefined) => {
    if (task) {
      writeLine(`  ${task.get().title} `, {
        grow: 1,
        shrink: 1,
        ellipsis: true,
        backgroundColor: 'white',
        color: 'black',
        bold: true,
      });
    }
  };

  const writeLineGrouped: WriteLineGrouped = (text, taskState) => {
    if (taskState !== lastTask) {
      endTask(lastTask);

      writeLine('');
      writeLine(`  ${taskState.get().title} `, {
        grow: 1,
        shrink: 1,
        ellipsis: true,
        backgroundColor: 'white',
        color: 'black',
        bold: true,
      });
    }
    lastTask = taskState;

    writeLine(text, { prefix: chalk.bgWhite(' ') + ' ' });
  };

  Promise.all(
    tasks.map((task) =>
      task.result
        .catch(() => undefined)
        .finally(() => {
          if (task.state === lastTask) {
            endTask(task.state);
          }
        }),
    ),
  ).then(() => {
    endTask(lastTask);
  });

  return render(<TaskList tasks={tasks} writeLine={writeLineGrouped} />);
}
