import sharp from 'sharp';
const names=['medal','football','golf'];
const cell=280; const comps=[];
for(let i=0;i<names.length;i++){
  const b=await sharp(`public/textures/wall/${names[i]}.webp`).resize({width:cell,height:cell,fit:'inside'}).flatten({background:'#ccc'}).toBuffer();
  const m=await sharp(b).metadata();
  comps.push({input:b,left:i*(cell+8)+4+Math.floor((cell-m.width)/2),top:4+Math.floor((cell-m.height)/2)});
}
await sharp({create:{width:names.length*(cell+8)+8,height:cell+8,channels:3,background:'#ccc'}}).composite(comps).png().toFile('/tmp/wall2.png');
console.log('ok');
