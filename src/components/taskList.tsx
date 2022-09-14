import { Task } from '../task';
import { TaskListEntry } from './taskListEntry';
import { render, Paragraph } from '@schummar/react-terminal';

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Paragraph>
      {tasks.map((task, index) => (
        <TaskListEntry key={index} {...task} />
      ))}
    </Paragraph>
  );
}

export function renderTaskList(tasks: Task[]) {
  render(<TaskList tasks={tasks} />);
}
