const colors = {
  black: 0,
  gray: 0,
  grey: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  purple: 5,
  cyan: 6,
  white: 7,
  default: 9
}

for(const c in colors) {
  colors['bg_'+c] = (40+colors[c]).toString()
}

for(const c in colors) {
  colors['bright_'+c] = (90+colors[c]).toString()
}

for(const c in colors) {
  colors['bright_bg_'+c] = (100+colors[c]).toString()
}

for(const c in colors) {
  colors[c] = (30+colors[c]).toString()
}

const attributes = {
  bold: '1',
  dim: '2',
  italic: '3',
  underline: '4',
  blink: '5',
  overline: '6',
  inverse: '7',
  invisible: '8',
  strikethrough: '9',
  dbl_underline: '21'
}

const base = '\033[A;Cm'
const reset_to_default = '\033[0;39m'

/**
 * Prepend a string with an ANSI escape sequence to set the terminal color. Append the reset sequence.
 * @param {string} str String to be colored
 * @param {string} color Color word. Can be one of: `black`, `gray`, `grey`, `red`, `green`, `yellow`, `blue`, `purple`, `cyan`, `white`, `default`. If `null` or `undefined`, only attributes will be applied.
 * @param {string} attr Attribute word. Can be one of: `bold`, `dim`, `italic`, `underline`, `blink`, `overline`, `inverse`, `invisible`, `strikethrough`, `dbl_underline`.
 * @returns {string} Colored `str`
 */
function colored_str(str, color, attr) {
  let esc = base // start with base escape sequence
  if(color && attr)
    esc = esc.replace('C', colors[color]).replace('A', attributes[attr])
  else if(color)
    esc = esc.replace('C', colors[color]).replace('A;', '')
  else if(attr)
    esc = esc.replace('C', '39').replace('A', attributes[attr])
  else
    return str
  return (esc+str+reset_to_default)
}

// create function properties in the export object for colors
// create function properties in the color function objects for attributes
for(const c in colors) {
  module.exports[c] = (x) => colored_str(x, c)
  for(const a in attributes)
    module.exports[c][a] = (x) => colored_str(x, c, a)
}

// create functions in the export object for truecolor support
const rgb_base = '\033[A;F/G;2;R;G;Bm'
function rgb_function_generator(base) {
  return function(r, g, b) {
    const esc = base.replace('R', r.toString()).replace('G', g.toString()).replace('B', b.toString())
    const func = (x) => (esc.replace('A;', '') + x + reset_to_default)
    for(const a in attributes)
      func[a] = (x) => (esc.replace('A', attributes[a]) + x + reset_to_default)
    return func
  }
}
module.exports.rgb = rgb_function_generator(rgb_base.replace('F/G', '38'))
module.exports.bg_rgb = rgb_function_generator(rgb_base.replace('F/G', '48'))

function hex_to_rgb(hex) {
  
}
module.exports.hex = function(hex) {
  hex = hex.replace('#', '')

}

module.exports.colored_str = colored_str
