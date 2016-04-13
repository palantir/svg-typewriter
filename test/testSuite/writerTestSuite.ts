///<reference path="../testReference.ts" />

var assert = chai.assert;

describe("Writer Test Suite", () => {
  var wrapper: SVGTypewriter.Wrappers.Wrapper;
  var measurer: SVGTypewriter.Measurers.AbstractMeasurer;
  var writer: SVGTypewriter.Writers.Writer;
  var svg: d3.Selection<any>;
  var writeOptions: SVGTypewriter.Writers.WriteOptions;
  var isHorizontal: boolean;

  var checkWriting = (text: string, width: number, height: number, shouldHaveTitle = false) => {
    svg.attr("width", width);
    svg.attr("height", height);
    writer.write(text, width, height, writeOptions);
    var bbox = SVGTypewriter.Utils.DOM.getBBox(svg.select(".text-area"));
    var dimensions = measurer.measure(
                      wrapper.wrap(text, measurer, isHorizontal ? width : height, isHorizontal ? height : width).wrappedText);

    assert.closeTo(bbox.width, dimensions.width, 1, "width of the text should be almost the same as measurer width");
    assert.closeTo(bbox.height, dimensions.height, 1, "height of the text should be almost the same as measurer height");

    assertBBoxInclusion(svg, svg.select(".text-area"));
    assert.equal(svg.select(".text-container").select("title").empty(),
                 !shouldHaveTitle,
                 "title element was created according to writer options");

    svg.remove();
  };

  beforeEach(() => {
    svg = generateSVG(200, 200);
    measurer = new SVGTypewriter.Measurers.Measurer(svg);
    wrapper = new SVGTypewriter.Wrappers.Wrapper();
    writer = new SVGTypewriter.Writers.Writer(measurer, wrapper);
    writeOptions = {
      selection: svg,
      xAlign: "right",
      yAlign: "center",
      textRotation: 0,
    };
  });

  describe("Core", () => {
    it("unsupported text rotation", () => {
      writeOptions.textRotation = 45;
      assert.throws(() => checkWriting("test", 200, 200), Error);
      svg.remove();
    });

    it("unique writer id", () => {
      var writer2 = new SVGTypewriter.Writers.Writer(measurer, wrapper);
      assert.operator(writer._writerID, "<" , writer2._writerID, "each writer has unique id");
      svg.remove();
    });
  });

  describe("Horizontal", () => {
    beforeEach(() => {
      writeOptions.textRotation = 0;
      isHorizontal = true;
    });

    it("one word", () => {
      checkWriting("test", 200, 200);
    });

    it("multiple lines", () => {
      checkWriting("test\ntest", 200, 200);
    });

    it("wrapping", () => {
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("whitespaces", () => {
      checkWriting("a    a", 50, 150);
    });

    it("maxLines", () => {
      wrapper.maxLines(3);
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("maxLines + no ellipsis", () => {
      wrapper.maxLines(3).textTrimming("none");
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment corner", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "bottom";
      writeOptions.xAlign = "right";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment center", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "center";
      writeOptions.xAlign = "center";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });
  });

  describe("Horizontal flipside", () => {
    beforeEach(() => {
      writeOptions.textRotation = 180;
      isHorizontal = true;
    });

    it("one word", () => {
      checkWriting("test", 200, 200);
    });

    it("multiple lines", () => {
      checkWriting("test\ntest", 200, 200);
    });

    it("wrapping", () => {
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("whitespaces", () => {
      checkWriting("a    a", 50, 150);
    });

    it("maxLines", () => {
      wrapper.maxLines(3);
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("maxLines + no ellipsis", () => {
      wrapper.maxLines(3).textTrimming("none");
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment corner", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "bottom";
      writeOptions.xAlign = "right";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment center", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "center";
      writeOptions.xAlign = "center";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("addTitleElement", () => {
      wrapper.maxLines(3);
      writer.addTitleElement(true);
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150, true);
    });
  });

  describe("Vertical left", () => {
    beforeEach(() => {
      writeOptions.textRotation = -90;
      isHorizontal = false;
    });

    it("one word", () => {
      checkWriting("test", 200, 200);
    });

    it("multiple lines", () => {
      checkWriting("test\ntest", 200, 200);
    });

    it("wrapping", () => {
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("whitespaces", () => {
      checkWriting("a    a", 50, 150);
    });

    it("maxLines", () => {
      wrapper.maxLines(3);
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("maxLines + no ellipsis", () => {
      wrapper.maxLines(3).textTrimming("none");
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment corner", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "bottom";
      writeOptions.xAlign = "right";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment center", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "center";
      writeOptions.xAlign = "center";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });
  });

  describe("Vertical right", () => {
    beforeEach(() => {
      writeOptions.textRotation = 90;
      isHorizontal = false;
    });

    it("one word", () => {
      checkWriting("test", 200, 200);
    });

    it("multiple lines", () => {
      checkWriting("test\ntest", 200, 200);
    });

    it("wrapping", () => {
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("whitespaces", () => {
      checkWriting("a    a", 50, 150);
    });

    it("maxLines", () => {
      wrapper.maxLines(3);
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("maxLines + no ellipsis", () => {
      wrapper.maxLines(3).textTrimming("none");
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment corner", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "bottom";
      writeOptions.xAlign = "right";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });

    it("allignment center", () => {
      wrapper.maxLines(3).textTrimming("none");
      writeOptions.yAlign = "center";
      writeOptions.xAlign = "center";
      checkWriting("reallylongsepntencewithmanycharacters", 50, 150);
    });
  });
});
