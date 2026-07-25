const fs = require('fs');

function readOuterJSON(file) {
  let buf = fs.readFileSync(file);
  if (buf[0]===0xFF && buf[1]===0xFE) {
    buf = buf.slice(2);
    let out = '';
    for (let i = 0; i < buf.length; i += 2) {
      if (i+1 >= buf.length) break;
      out += String.fromCharCode(buf[i] | (buf[i+1] << 8));
      if (out.length > 500) break;
    }
    const idx = out.indexOf('{');
    const last = out.lastIndexOf('}');
    if (idx >= 0 && last > idx) {
      out = out.substring(idx, last+1);
    }
    return JSON.parse(out);
  }
  if (buf[0]===0xEF && buf[1]===0xBB && buf[2]===0xBF) buf = buf.slice(3);
  return JSON.parse(buf.toString('utf8'));
}

function extractColors(node, colors) {
  if (!node || typeof node !== 'object') return;
  if (node.fills && typeof node.fills === 'string' && node.fills.startsWith('rgb')) {
    if (!colors[node.fills]) colors[node.fills] = 0;
    colors[node.fills]++;
  }
  if (node.fontFill && typeof node.fontFill === 'string' && node.fontFill.startsWith('rgb')) {
    if (!colors[node.fontFill]) colors[node.fontFill] = 0;
    colors[node.fontFill]++;
  }
  if (node.stroke?.fills && typeof node.stroke.fills === 'string' && node.stroke.fills.startsWith('rgb')) {
    if (!colors['stroke:'+node.stroke.fills]) colors['stroke:'+node.stroke.fills] = 0;
    colors['stroke:'+node.stroke.fills]++;
  }
  if (node.children) node.children.forEach(c => extractColors(c, colors));
}

function extractLayout(node, depth, out) {
  if (!node || depth > 8) return;
  if (node.type === 'frame' && node.name) {
    out.push({
      name: node.name,
      depth,
      w: node.width,
      h: node.height,
      layout: node.layout,
      padding: node.padding,
      gap: node.gap,
      bg: node.fills?.substring(0,40),
      corner: node.cornerRadius,
      content: node.content || ''
    });
  }
  if (node.children) node.children.forEach(c => extractLayout(c, depth+1, out));
}

const files = [
  ['scratch/dlt_selection.json', 'DLT Selection'],
  ['scratch/ssq_selection.json', 'SSQ Selection'],
  ['scratch/ssq_result.json', 'SSQ Result'],
  ['scratch/dlt_result.json', 'DLT Result']
];

for (const [file, label] of files) {
  try {
    const outer = readOuterJSON(file);
    const text = outer?.content?.[0]?.text;
    if (!text) { console.log(label + ': no text field'); continue; }
    
    const inner = JSON.parse(text);
    const result = inner.result;
    const data = Array.isArray(result) ? result[0]?.layer_data : result?.data;
    if (!data) { console.log(label + ': no data in inner JSON'); continue; }
    
    console.log('\n========== ' + label + ' ==========');
    console.log('Name:', data.name);
    console.log('BG:', data.fills);
    console.log('Width:', data.width, 'Height:', data.height);
    console.log('Layout:', data.layout, 'Gap:', data.gap, 'Padding:', JSON.stringify(data.padding));
    
    const colors = {};
    extractColors(data, colors);
    console.log('\nColors:');
    Object.entries(colors).sort((a,b) => b[1]-a[1]).forEach(([k,v]) => {
      console.log('  ' + k + ' x' + v);
    });
    
    const layout = [];
    extractLayout(data, 0, layout);
    console.log('\nTop frames:');
    layout.filter(l => l.depth <= 2).forEach(l => {
      console.log('  [' + l.name + '] ' + (l.w||'') + 'x' + (l.h||'') + (l.layout ? ' lay='+l.layout : '') + (l.bg ? ' '+l.bg : '') + (l.corner ? ' rad='+l.corner : ''));
    });
    
  } catch(e) { console.log(label + ': ' + e.message); }
}
