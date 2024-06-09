function generateRedColorScheme() {
  let redColorScheme = [];
  for (let i = 255; i >= 0; i -= 10) {
    redColorScheme.push({ r: i, g: 0, b: 0 });
  }
  return redColorScheme;
}

function generateGreenColorScheme() {
  let greenColorScheme = [];
  for (let i = 255; i >= 0; i -= 10) {
    greenColorScheme.push({ r: 0, g: i, b: 0 });
  }
  return greenColorScheme;
}

const ColorScheme = {
  GreenScheme: generateGreenColorScheme(),
  RedScheme: generateRedColorScheme(),
};

export default ColorScheme;
