import { Box, Text } from 'ink';
import { useStoreState } from 'schummar-state/react';
import { Task } from '../task';
import { Spinner } from './spinner';

export function TaskListEntry({ command: { keepOutput, forever }, name, state }: Task) {
  const status = useStoreState(state, (x) => x.status);
  const time = useStoreState(state, (x) => x.time);
  const shortOutput = useStoreState(state, (x) => x.shortOutput);

  return (
    <Box flexDirection="column">
      <Box>
        <Box>
          {status === 'pending' ? (
            <Text>↳</Text>
          ) : status === 'inProgress' && forever ? (
            <Text color="green">▶</Text>
          ) : status === 'inProgress' ? (
            <Spinner color="yellow" />
          ) : status === 'done' ? (
            <Text color="green">✔</Text>
          ) : (
            <Text color="red">✖</Text>
          )}
        </Box>

        <Box marginLeft={1}>
          <Text>{name}</Text>
        </Box>

        {time !== undefined && (
          <Box marginLeft={1}>
            <Text color="gray">[{(time / 1000).toFixed(3)}s]</Text>
          </Box>
        )}
      </Box>

      {(status === 'error' || status === 'inProgress' || keepOutput) && shortOutput.length > 0 && (
        <Box marginLeft={2} paddingX={2} paddingY={1}>
          <Text>{shortOutput}</Text>
        </Box>
      )}
    </Box>
  );
}
