export type Command = (args: string[]) => Promise<void> | void;

/**
 * Options to be given to {@link commandHandler}
 */
export interface CommandHandlerOptions {
  /**
   * The list of commands available in this handler
   */
  commands: Record<string, Command>;
  /*
   The default command to be used if no command is specified.
   */
  defaultCommand?: string;
  /**
   * The parent command name, to be shown in the Usage output when an invalid command is given
   */
  parentCommandName: string;
}

/**
 * Creates a handler function that takes arguments and interprets the first argument as a
 * command, calling that command's function in the `options.commands` object.
 *
 * If the command exists, returns true after it runs.
 *
 * If no function exists for the given command, prints a usage message and returns false.
 *
 * If the command given is 'help', prints the usage message and returns true.
 */
export function commandHandler({commands, defaultCommand, parentCommandName}: CommandHandlerOptions) {
  return async (args: string[]): Promise<boolean> => {

    const [command, ...commandArgs] = args;
    const cmd = command || defaultCommand;

    const usage = () => `USAGE: ${
        parentCommandName
      } ${
        defaultCommand ? '[' : '<'
      }${
        Object.keys(commands).map(c => c === defaultCommand ? `*${c}*` : c).join('|')
      }${
        defaultCommand ? ']' : '>'
      }`;

    if (cmd === 'help') {
      console.log(usage());
      return true;
    }

    const commandFn = cmd ? commands[cmd] : undefined;

    if (commandFn) {
      await commandFn(commandArgs);
      return true;

    } else {

      console.warn(`Unrecognized command '${command}'`);
      console.warn(usage());

      return false;
    }
  }
}
