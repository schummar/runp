import { runp } from '.';

runp({
  commands: [
    {
      name: 'foo',
      async cmd({ updateStatus, updateTitle }) {
        const redStatusString = '\u001b[31mred\u001b[39m';
        updateStatus(redStatusString);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        updateTitle('bar');
      },
    },

    {
      name: 'foo',
      async cmd({ updateTitle, updateOutput }) {
        updateOutput('foo\nbar');
        await new Promise((resolve) => setTimeout(resolve, 2000));
        updateTitle('bar');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      },
    },
  ],
});
