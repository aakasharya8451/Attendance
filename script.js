window.addEventListener('DOMContentLoaded', () => {
const circle = new CircularProgressBar("pie");
circle.initial();

  setInterval(() => {
    const typeFont = [100, 200, 300, 400, 500, 600, 700];
    const colorHex = `#${Math.floor((Math.random() * 0xffffff) << 0).toString(16)}`;
    const options = {
      index: 16,
      percent: Math.floor((Math.random() * 100) + 1),
      colorSlice: colorHex,
      fontColor: colorHex,
      fontSize: `${Math.floor(Math.random() * (1.4 - 1 + 1) + 1)}rem`,
      fontWeight: typeFont[Math.floor(Math.random() * typeFont.length)]
    }
    circle.animationTo(options);
  }, 3000);
});