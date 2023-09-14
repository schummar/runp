import { Paragraph, Text } from '@schummar/react-terminal';
import { useStore } from 'cross-state/react';
import { useEffect } from 'react';
import { statusIcons } from '../statusIcons';
import { Task } from '../task';
import { WriteLineGrouped } from './renderTaskList';
import { Spinner } from './spinner';

export function TaskListEntry({
  command: { keepOutput, forever, outputLength, displayTimeOver = -Infinity, linearOutput },
  state,
  writeLine,
}: Task & { writeLine: WriteLineGrouped }) {
  const status = useStore(state, (x) => x.status);
  const statusString = useStore(state, (x) => x.statusString);
  const title = useStore(state, (x) => x.title);
  const time = useStore(state, (x) => x.time);
  const subTasks = useStore(state, (x) => x.subTasks);

  const output = useStore(state, (x) => {
    if (linearOutput) {
      return undefined;
    }

    const output = x.output.trim();

    if ((status === 'error' || status === 'inProgress' || keepOutput) && output.length > 0) {
      return output;
    }

    return undefined;
  });

  useEffect(() => {
    if (!linearOutput) {
      return;
    }

    let offset = 0;

    return state
      .map((x) => x.output)
      .subscribe((output) => {
        const newOutput = output.slice(offset);
        if (newOutput) {
          writeLine(newOutput, state);
        }
        offset = output.length;
      });
  }, [linearOutput, state]);

  return (
    <Paragraph>
      {statusString !== undefined ? (
        <Text>{statusString}</Text>
      ) : status === 'pending' ? (
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
        {title}
      </Text>

      {time !== undefined && time > displayTimeOver && (
        <>
          <Text>&nbsp;</Text>
          <Text dim>[{(time / 1000).toFixed(3)}s]</Text>
        </>
      )}

      {forever && !linearOutput && (
        <>
          {' '}
          <Text shrink fill="─" />{' '}
        </>
      )}

      {output && (
        <Paragraph margin={[1, 0, 1, 2]} maxLines={status === 'error' ? undefined : outputLength}>
          {output}
        </Paragraph>
      )}

      {subTasks?.map((task, index) => (
        <Paragraph key={index} margin={[0, 0, 0, 2]}>
          <TaskListEntry writeLine={writeLine} {...task} />
        </Paragraph>
      ))}
    </Paragraph>
  );
}
