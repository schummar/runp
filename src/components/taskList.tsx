import { Paragraph } from '@schummar/react-terminal';
import { Task } from '../task';
import { TaskListEntry } from './taskListEntry';

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Paragraph>
      {tasks.map((task, index) => (
        <TaskListEntry key={index} {...task} />
      ))}
    </Paragraph>
  );
}
