# Typesetter

[![Circle CI](https://circleci.com/gh/palantir/svg-typewriter.svg?style=svg)](https://circleci.com/gh/palantir/svg-typewriter)

### Overview

**Typesetter** is a library for measuring, wrapping, and writing text on Canvas
and SVG. Canvas supports some rudimentary wrapping, but SVG does not support
any. Furthermore, developers often want wrapped text to auto-hyphenate and
truncate with ellipses when overflowing the bounding box. **Typesetter** aims to
make this entire process easier.

**Typesetter** works with native browser APIs and has no external dependencies.

### Features

- *Measurers* efficiently measure the size of a piece of text, taking into
  account the font styles affecting that text.
- *Wrappers* calculate how best to fit text into a given space, based on results
  from the Measurer.
- *Writers* layout and write text based on specified options such as wrapping,
  alignment, rotation, and shearing.
- *SvgContext* and *CanvasContext* implement factories for the *IRuler* and
  *IPen* objects, which encapsulate the functionality for measuring and writing
  text in SVG and Canvas elements.

### Installation

```
npm install --save @palantir/typesetter
```

# Usage

### Example Two Liner

```ts
import { Typesetter } from "@palantir/typesetter";

const typesetter = Typesetter.svg(document.querySelector("svg"));
typesetter.write("Hello World!", 200, 200);
```

### Example SVG & Canvas

Use typesetters with both SVG and Canvas elements:

```ts
import { Typesetter } from "@palantir/typesetter";

// A typesetter for SVG elements
const svgTypesetter = Typesetter.svg(document.querySelector("svg"));

// A typesetter for Canvas elements
const canvasTypesetter = Typesetter.canvas(document.querySelector("canvas").getContext("2d"));

// The dimensions into which the text will be wrapped and truncated
const width = 300;
const height = 50;

// Options for alignment, etc.
const writeOptions = {
  xAlign: "left",
  yAlign: "top",
  textRotation: 0,
  textShear: 0,
};

// Write the text to the elements
svgTypesetter.write("Hello SVG!", width, height, writeOptions);
canvasTypesetter.write("Hello Canvas!", width, height, writeOptions);
```

### Example Shared Cache

If you are typesetting multiple strings of text with the same font style,
maintain a cache of Measurer results to improve performance.

```html
<svg>
  <g class="section-one"></g>
  <g class="section-two" transform="translate(120 0)"></g>
</svg>
```

```ts
import { Typesetter } from "@palantir/typesetter";

const svg = document.querySelector("svg");
const typesetter = Typesetter.svg(svg);
const writeOptions = { xAlign: "center" };

typesetter.write(
  "This text is in the first section",
  100, 400, writeOptions,
  svg.querySelector("g.section-one")
);

typesetter.write(
  "This text is in the second section",
  100, 200, writeOptions,
  svg.querySelector("g.section-two")
);
```

# API Docs

See [the docs](http://palantir.github.io/typesetter) for more detailed examples.
