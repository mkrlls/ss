const { getCrossPoint } = require('./utils');

// テストケースの記述
describe('getCrossPoint', () => {
  it('should calculate the correct cross points for given coordinates', () => {
    const lineACoords = {
      tl: { x: 0, y: 0 },
      bl: { x: 0, y: 10 },
    };
    const imgACoords = {
      tl: { x: -5, y: 5 },
      tr: { x: 5, y: 5 },
      br: { x: 5, y: -5 },
      bl: { x: -5, y: -5 },
    };

    const result = getCrossPoint(lineACoords, imgACoords);

    expect(result).toEqual({
      top: 0.5,
      bottom: 0.5,
    });
  });

  it('should return an empty object if there are no intersections', () => {
    const lineACoords = {
      tl: { x: 20, y: 20 },
      bl: { x: 20, y: 30 },
    };
    const imgACoords = {
      tl: { x: -5, y: 5 },
      tr: { x: 5, y: 5 },
      br: { x: 5, y: -5 },
      bl: { x: -5, y: -5 },
    };

    const result = getCrossPoint(lineACoords, imgACoords);

    expect(result).toEqual({});
  });
});
