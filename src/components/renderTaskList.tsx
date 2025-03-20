import { RenderOptions, createRoot } from '@schummar/react-terminal';
import { Task } from '../task';
import { TaskList } from './taskList';
import { trackLinearOutput } from '../trackLinearOutput';

export function renderTaskList(tasks: Task[], options?: RenderOptions) {
  const { render, writeLine } = createRoot(options);

  trackLinearOutput(tasks, writeLine);

  return render(<TaskList tasks={tasks} />);
}
