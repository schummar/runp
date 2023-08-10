import { RenderOptions, createRoot } from '@schummar/react-terminal';
import { Store } from 'cross-state';
import { Task, TaskState } from '../task';
import { TaskList } from './taskList';
import chalk from 'chalk';

export type WriteLineGrouped = (text: string, taskState: Store<TaskState>) => void;

export function renderTaskList(tasks: Task[], options?: RenderOptions) {
  const { render, writeLine } = createRoot(options);

  let lastTask: Store<TaskState> | undefined;

  const endLastTask = () => {
    if (lastTask) {
      writeLine(`  ${lastTask.get().title} `, {
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
      endLastTask();

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

  Promise.all(tasks.map((task) => task.result.catch(() => undefined))).then(endLastTask);

  return render(<TaskList tasks={tasks} writeLine={writeLineGrouped} />);
}
