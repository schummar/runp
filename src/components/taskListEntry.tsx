import { Paragraph, Text } from '@schummar/react-terminal';
import { useStoreState } from 'schummar-state/react';
import { statusIcons } from '../statusIcons';
import { Task } from '../task';
import { Spinner } from './spinner';

export function TaskListEntry({ command: { keepOutput, forever, outputLength }, name, state }: Task) {
  const status = useStoreState(state, (x) => x.status);
  const time = useStoreState(state, (x) => x.time);
  const output = useStoreState(state, (x) => x.output.trim());
  const subTasks = useStoreState(state, (x) => x.subTasks);

  const showOutput = (status === 'error' || status === 'inProgress' || keepOutput) && output.length > 0;

  return (
    <Paragraph>
      {status === 'pending' ? (
        <Text>{statusIcons.pending}</Text>
      ) : status === 'inProgress' && forever ? (
        <Text color="green">{statusIcons.forever}</Text>
      ) : status === 'inProgress' ? (
        <Spinner color="yellow" />
      ) : status === 'done' ? (
        <Text color="green">{statusIcons.done}</Text>
      ) : (
        <Text color="red">{statusIcons.error}</Text>
      )}
      <Text>&nbsp;</Text>

      <Text bold shrink ellipsis>
        {name}
      </Text>

      {time !== undefined && (
        <>
          <Text>&nbsp;</Text>
          <Text dim>{time !== undefined && `[${(time / 1000).toFixed(3)}s]`}</Text>
        </>
      )}

      {showOutput && (
        <Paragraph margin={[1, 0, 1, 2]} maxLines={outputLength}>
          {output}
        </Paragraph>
      )}

      {subTasks?.map((task, index) => (
        <Paragraph key={index} margin={[0, 0, 0, 2]}>
          <TaskListEntry {...task} />
        </Paragraph>
      ))}
    </Paragraph>
  );
}
