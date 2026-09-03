// Inline of `@codemirror/legacy-modes/mode/shell` to add additional common commands
import { StreamLanguage, type StringStream } from '@codemirror/language';

export type ShellState = {
  tokens: Tokenizer[];
};

type Tokenizer = (stream: StringStream, state: ShellState) => string | null;

const words: Record<string, string> = {};
function define(style: string, dict: readonly string[]) {
  for (let i = 0; i < dict.length; i++) {
    words[dict[i]] = style;
  }
}

const commonAtoms = ['true', 'false'];
const commonKeywords = [
  'if',
  'then',
  'do',
  'else',
  'elif',
  'while',
  'until',
  'for',
  'in',
  'esac',
  'fi',
  'fin',
  'fil',
  'done',
  'exit',
  'set',
  'unset',
  'export',
  'function',
];
const commonCommands = [
  'ab',
  'awk',
  'bash',
  'beep',
  'cat',
  'cc',
  'cd',
  'chown',
  'chmod',
  'chroot',
  'clear',
  'cp',
  'curl',
  'cut',
  'diff',
  'echo',
  'find',
  'gawk',
  'gcc',
  'get',
  'git',
  'grep',
  'hg',
  'kill',
  'killall',
  'ln',
  'ls',
  'make',
  'mkdir',
  'openssl',
  'mv',
  'nc',
  'nl',
  'node',
  'npm',
  'ping',
  'ps',
  'restart',
  'rm',
  'rmdir',
  'sed',
  'service',
  'sh',
  'shopt',
  'shred',
  'source',
  'sort',
  'sleep',
  'ssh',
  'start',
  'stop',
  'su',
  'sudo',
  'svn',
  'tee',
  'telnet',
  'top',
  'touch',
  'vi',
  'vim',
  'wall',
  'wc',
  'wget',
  'who',
  'write',
  'yes',
  'zsh',

  'uv',
  'poetry',
  'pip',
  'pipenv',
  'pipx',

  'pnpm',
  'bun',
  'yarn',
  'deno',
];

define('atom', commonAtoms);
define('keyword', commonKeywords);
define('builtin', commonCommands);

function tokenBase(stream: StringStream, state: ShellState): string | null {
  if (stream.eatSpace()) return null;

  const sol = stream.sol();
  const ch = stream.next();
  if (ch == null) return null;

  if (ch === '\\') {
    stream.next();
    return null;
  }
  if (ch === "'" || ch === '"' || ch === '`') {
    state.tokens.unshift(tokenString(ch, ch === '`' ? 'quote' : 'string'));
    return tokenize(stream, state);
  }
  if (ch === '#') {
    if (sol && stream.eat('!')) {
      stream.skipToEnd();
      return 'meta';
    }
    stream.skipToEnd();
    return 'comment';
  }
  if (ch === '$') {
    state.tokens.unshift(tokenDollar);
    return tokenize(stream, state);
  }
  if (ch === '+' || ch === '=') {
    return 'operator';
  }
  if (ch === '-') {
    stream.eat('-');
    stream.eatWhile(/\w/);
    return 'attribute';
  }
  if (ch == '<') {
    if (stream.match('<<')) return 'operator';
    const heredoc = stream.match(/^<-?\s*(?:['"]([^'"]*)['"]|([^'"\s]*))/);
    if (Array.isArray(heredoc)) {
      state.tokens.unshift(tokenHeredoc(heredoc[1] || heredoc[2]));
      return 'string.special';
    }
  }
  if (/\d/.test(ch)) {
    stream.eatWhile(/\d/);
    const next = stream.peek();
    if (stream.eol() || next === undefined || !/\w/.test(next)) {
      return 'number';
    }
  }
  stream.eatWhile(/[\w-]/);
  const cur = stream.current();
  if (stream.peek() === '=' && /\w+/.test(cur)) return 'def';
  return Object.prototype.hasOwnProperty.call(words, cur) ? words[cur] : null;
}

function tokenString(quote: string, style: string): Tokenizer {
  const close = quote === '(' ? ')' : quote === '{' ? '}' : quote;
  return function (stream: StringStream, state: ShellState) {
    let next,
      escaped = false;
    while ((next = stream.next()) != null) {
      if (next === close && !escaped) {
        state.tokens.shift();
        break;
      } else if (
        next === '$' &&
        !escaped &&
        quote !== "'" &&
        stream.peek() != close
      ) {
        escaped = true;
        stream.backUp(1);
        state.tokens.unshift(tokenDollar);
        break;
      } else if (!escaped && quote !== close && next === quote) {
        state.tokens.unshift(tokenString(quote, style));
        return tokenize(stream, state);
      } else if (!escaped && /['"]/.test(next) && !/['"]/.test(quote)) {
        state.tokens.unshift(tokenStringStart(next, 'string'));
        stream.backUp(1);
        break;
      }
      escaped = !escaped && next === '\\';
    }
    return style;
  };
}

function tokenStringStart(quote: string, style: string): Tokenizer {
  return function (stream: StringStream, state: ShellState) {
    state.tokens[0] = tokenString(quote, style);
    stream.next();
    return tokenize(stream, state);
  };
}

const tokenDollar: Tokenizer = function (stream, state) {
  if (state.tokens.length > 1) stream.eat('$');
  const ch = stream.next();
  if (ch == null) {
    state.tokens.shift();
    return 'def';
  }
  if (/['"({]/.test(ch)) {
    state.tokens[0] = tokenString(
      ch,
      ch === '(' ? 'quote' : ch === '{' ? 'def' : 'string'
    );
    return tokenize(stream, state);
  }
  if (!/\d/.test(ch)) stream.eatWhile(/\w/);
  state.tokens.shift();
  return 'def';
};

function tokenHeredoc(delim: string | undefined): Tokenizer {
  return function (stream: StringStream, state: ShellState) {
    if (stream.sol() && stream.string === delim) state.tokens.shift();
    stream.skipToEnd();
    return 'string.special';
  };
}

function tokenize(stream: StringStream, state: ShellState): string | null {
  return (state.tokens[0] || tokenBase)(stream, state);
}

export const shellLanguage = StreamLanguage.define<ShellState>({
  name: 'shell',
  startState() {
    return { tokens: [] };
  },
  token(stream, state) {
    return tokenize(stream, state);
  },
  languageData: {
    autocomplete: commonAtoms.concat(commonKeywords, commonCommands),
    closeBrackets: { brackets: ['(', '[', '{', "'", '"', '`'] },
    commentTokens: { line: '#' },
  },
});
