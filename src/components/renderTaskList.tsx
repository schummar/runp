import { render, RenderOptions } from '@schummar/react-terminal';
import { Task } from '../task';
import { TaskList } from './taskList';

export function renderTaskList(tasks: Task[], options?: RenderOptions) {
  return render(<TaskList tasks={tasks} />, options);
}
