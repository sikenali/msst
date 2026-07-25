const fs = require('fs');
function readJSON(file) {
  let buf = fs.readFileSync(file);
  if (buf[0]===0xFF && buf[1]===0xFE) {
    buf = buf.slice(2);
    let str = '';
    for (let i=0; i<buf.length; i+=2) {
      if (i+1<buf.length) str += String.fromCharCode(buf[i] | (buf[i+1]<<8));
    }
    return JSON.parse(str);
  }
  if (buf[0]===0xEF && buf[1]===0xBB && buf[2]===0xBF) buf = buf.slice(3);
  return JSON.parse(buf.toString('utf8'));
}

const files = ['scratch/dlt_selection.json','scratch/ssq_selection.json','scratch/ssq_result.json','scratch/dlt_result.json'];
for (const f of files) {
  try {
    const d = readJSON(f);
    const data = d.result?.data;
    if (!data) { console.log(f+': no data'); continue; }
    console.log('\n=== ' + data.name + ' (' + f + ') ===');
    console.log('Layout:', data.layout, 'BG:', data.fills?.substring(0,80));
    console.log('Width:', data.width, 'Gap:', data.gap, 'Padding:', JSON.stringify(data.padding));
    if (data.children) {
      for (const child of data.children) {
        if (child.type==='frame' || child.type==='rectangle') {
          const ctext = child.content || (child.children?.[0]?.content) || '';
          const bg = child.fills ? ' bg=' + child.fills.substring(0,50) : '';
          const txt = ctext ? ' text="' + ctext + '"' : '';
          console.log('  [' + child.name + '] w=' + child.width + ' h=' + (child.height||'') + bg + txt);
        }
      }
    }
  } catch(e) { console.log(f + ': ' + e.message); }
}
