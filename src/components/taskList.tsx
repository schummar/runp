import { Paragraph } from '@schummar/react-terminal';
import { Task } from '../task';
import { WriteLineGrouped } from './renderTaskList';
import { TaskListEntry } from './taskListEntry';

export function TaskList({ tasks, writeLine }: { tasks: Task[]; writeLine: WriteLineGrouped }) {
  return (
    <Paragraph margin={[1, 0, 0, 0]}>
      {tasks.map((task, index) => (
        <TaskListEntry key={index} writeLine={writeLine} {...task} />
      ))}
    </Paragraph>
  );
}
