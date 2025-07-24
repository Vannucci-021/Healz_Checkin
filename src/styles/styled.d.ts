import 'styled-components';
import type { ThemeType } from './styles/theme';

type ThemeType = typeof theme;

declare module 'styled-components' {
  export interface DefaultTheme extends ThemeType {}
}
