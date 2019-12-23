/** String parsable as a math expression. Arrays are joined with AND operators.  */
export type MathExpressionString = string | string[];
/** Text sent through the Fancy Text Maker system */
export type FancyTextMakerString = string;

export type Scene = NormalScene | EndingScene;

export interface NormalScene {
  type: 'scene';
  passage: FancyTextMakerString;
  options: Option[]; // the options you have
  source: null | Source | Source[]; // who made the scene

  onActivate?: MathExpressionString;
  onFirstActivate?: MathExpressionString;
  onDeactivate?: MathExpressionString;
  onFirstDeactivate?: MathExpressionString;

  /** Custom CSS */
  css?: string;

  /** A list of scenes that the game should preload while the game is idling on this scene.
   * it is automatically set to all possible option destinations. */
  preloadScenes?: string[];

  meta?: any;
}
export interface EndingScene {
  type: 'ending';
  passage: FancyTextMakerString;
  title: FancyTextMakerString;
  description: FancyTextMakerString;
  source: null | Source | Source[]; // who made the scene

  /** Custom CSS */
  css?: string;

  meta?: any;
}

export type Option =
  | 'separator'
  | {
      label: string;
      to: string;

      /** If option is visible at all */
      isVisible?: MathExpressionString;
      /** If visible and greyed out. Requires isVisible to be true */
      isDisabled?: MathExpressionString;

      /** Run when clicked on. */
      onActivate?: MathExpressionString;
    };

/** Who made something. */
export type Source = string | { name: string; desc?: string };
