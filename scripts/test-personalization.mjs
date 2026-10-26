import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {check,validateClient,root} from './validate-client.mjs';
const {birthdayConfig:c,distributePhotos,getCountdown}=await check();
assert.deepEqual([c.photoCarousel.photos.length,c.gallery.photos.length,c.scrapbook.pages.length,c.scrapbook.pages.flatMap(p=>p.photos).length,c.photoUniverse.photos.length],[5,10,8,16,10]);
for (const count of [10,20,35]) {
 const photos=Array.from({length:count},(_,i)=>({src:`photo-${i}`}));
 const result=distributePhotos(photos,41);
 assert.deepEqual(result,distributePhotos(photos,41));
 assert.equal(new Set(result.map(p=>p.src)).size,count);
 result.forEach((p,i)=>{if(i) assert.notEqual(p.src,result[i-1].src);});
}
const client=JSON.parse(readFileSync(resolve(root,'src/config/client.json'),'utf8'));
for (const mutate of [c=>c.sender.name='', c=>c.siteId='', c=>c.recipient.birthdayDate='2026-02-30', c=>c.recipient.birthdayTime='25:00',c=>c.recipient.timezone='Invalid/Zone',c=>c.recipient.age=0,c=>c.photos.pop(),c=>c.photos[0].src='/missing.jpg',c=>c.music={src:'/missing.mp3',title:'Missing'},c=>c.photos[1].src=c.photos[0].src,c=>c.scrapbookNotes[0]=['only one']]) {
 const bad=structuredClone(client); mutate(bad); assert.ok(validateClient(bad,getCountdown).length,'Invalid fixture must fail');
}
console.log('Personalization tests passed: capacities, deterministic 10/20/35 distribution, coverage, adjacency, and 11 invalid-input cases.');
