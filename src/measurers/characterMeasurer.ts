///<reference path="../reference.ts" />

namespace SVGTypewriter.Measurers {
  export class CharacterMeasurer extends Measurer {
    public _measureCharacter(c: string) {
      return super._measureLine(c);
    }

    public _measureLine(line: string) {
      var charactersDimensions = line.split("").map(c => this._measureCharacter(c));
      return {
        width: d3.sum(charactersDimensions, dim => dim.width),
        height: d3.max(charactersDimensions, dim => dim.height),
      };
    }
  }
}
