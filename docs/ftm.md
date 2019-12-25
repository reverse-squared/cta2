# Scene Editor Documentation

- [Scene Editor Documentation](#scene-editor-documentation)
  - [Fancy Text Maker (FTM)](#fancy-text-maker-ftm)
    - [Basic Formatting](#basic-formatting)
    - [Built-in Variables](#built-in-variables)
    - [Expressions](#expressions)
    - [Using CSS in a Scene](#using-css-in-a-scene)
    - [Using Custom Variables](#using-custom-variables)
    - [Using Custom Components](#using-custom-components)

## Fancy Text Maker (FTM)

### Basic Formatting

Basic formatting includes bolding, italicizing, underlining, and encoding things. The format is very similar to markdown with a few notable syntax changes.

- **Bolding**. Simply surround any text you want bolded with **double asterisks**. (\*\*)
- _Italicizing_. Surround any text with a **single asterisk**. (\*)
- <u>Underlining</u>. Surround any text with **two underscores**. (\_\_)
- `Encoding`: Surround any text with **a back-tic**. (`)
- [Links](https://www.youtube.com/watch?v=dQw4w9WgXcQ). \[Link Text\]\(URL\)
- You can insert **new lines** with **\n**.

### Built-in Variables

You can reference variables in your scenes using `${VARIABLE}`, where `VARIABLE` is the variable you want to show. There are a couple of built-in variables you can use. These are:

- `scene`: The current scene.
- `prevScene`: The previous scene.
- `visitedScenes`: An array of scenes that you have visited already.

### Expressions

### Using CSS in a Scene

### Using Custom Variables

### Using Custom Components
