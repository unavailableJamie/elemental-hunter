const pptxgen = require('pptxgenjs');
const html2pptx = require('./html2pptx');
const path = require('path');

const SLIDES_DIR = path.resolve(__dirname, 'slides');

async function build() {
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.title = 'Quy trình làm Prototype bằng AI';

  const slides = [
    'slide1-title.html',
    'slide2-agenda.html',
    'slide2-phase1.html',
    'slide3-table.html',
    'slide4-phase2.html',
    'slide5-phase3.html',
    'slide6-summary.html',
  ];

  for (const file of slides) {
    console.log(`Processing: ${file}`);
    await html2pptx(path.join(SLIDES_DIR, file), pptx);
  }

  const out = path.resolve(__dirname, '..', 'AI_Prototype_Workflow_v3.pptx');
  await pptx.writeFile({ fileName: out });
  console.log(`\n✅  Saved: ${out}`);
}

build().catch(err => { console.error('❌', err.message || err); process.exit(1); });
