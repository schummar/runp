import { Text, TextProps } from 'ink';
import { useEffect, useState } from 'react';

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export function Spinner(props: TextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index) => (index + 1) % frames.length);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  return <Text {...props}>{frames[index]}</Text>;
}
