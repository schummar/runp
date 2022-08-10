import { Box, render } from 'ink';
import { Task } from '../task';
import { TaskListEntry } from './taskListEntry';

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Box flexDirection="column">
      {tasks.map((task, index) => (
        <TaskListEntry key={index} {...task} />
      ))}
    </Box>
  );
}

export function renderTaskList(tasks: Task[]) {
  render(<TaskList tasks={tasks} />);
}
