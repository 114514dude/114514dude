/*
 * Armor Front: wiki-grounded vehicle/round data and independent approximate
 * volumetric damage simulation. NOT Gaijin's proprietary collision engine.
 * Wiki front/side/rear values are summary values, not exact in-game plate maps.
 * Local plate geometry, spall spread and module coordinates are provisional.
 */
export const DISTANCES=[10,100,500,1000,1500,2000];
const round=(id,type,pen,more={})=>({id,type,pen, ...more});
export const VEHICLE_PROFILES={
 'T-34-85':{
   provenance:'https://wiki.warthunder.com/unit/ussr_t_34_85_zis_53',dataKind:'wiki-verified summary',
   armor:{hull:[45,45,45],turret:[90,75,52],roof:15},crew:5,reload:9.6,
   shells:[
     round('BR-365K','APHE',[148,143,126,106,90,77],{fuze:true,heFillTntG:null}),
     round('O-365K','HE',[19,18,17,16,15,14],{blast:true}),
     round('BR-365','APHEBC',[135,133,124,114,104,95],{fuze:true,heFillTntG:null}),
     round('BR-365P','APCR',[195,187,154,122,96,76])
   ]
 },
 'Panzer III':{
   provenance:'https://wiki.warthunder.com/unit/germ_pzkpfw_III_ausf_J_td',dataKind:'wiki J1 configuration',
   armor:{hull:[53,30,53],turret:[50,30,30],roof:16},crew:5,reload:4.8,
   shells:[
     round('PzGr 39','APC',[106,101,83,65,50,39]),
     round('Sprgr. 38','HE',[12,11,9,7,6,5],{blast:true}),
     round('PzGr 40/1','APCR',[130,121,90,62,42,29]),
     round('PzGr 40','APCR',[137,126,88,56,36,23])
   ]
 },
 'Abrams (Freeciv)':{
   provenance:'custom testing data; Freeciv model is not a War Thunder M1A2',dataKind:'fictional/unverified',
   armor:{hull:[180,100,80],turret:[210,140,95],roof:25},crew:4,reload:7.0,
   shells:[
     round('Prototype APFSDS','APFSDS',[270,266,251,235,218,202]),
     round('Prototype HEAT-FS','HEATFS',[220,220,220,220,220,220],{chemical:true}),
     round('Prototype HE','HE',[24,24,24,24,24,24],{blast:true})
   ]
 }
};

export function getProfile(name){return VEHICLE_PROFILES[name]||null}
export function availableRounds(name){return getProfile(name)?.shells||[]}
export function chooseRound(name,slot=0){let r=availableRounds(name);return r[(slot+r.length)%r.length]||null}
export function penetrationAt(range,round){
  if(!round||!round.pen)return 0;
  if(range<=DISTANCES[0])return round.pen[0];
  for(let i=1;i<DISTANCES.length;i++)if(range<=DISTANCES[i]){
    const t=(range-DISTANCES[i-1])/(DISTANCES[i]-DISTANCES[i-1]);
    return round.pen[i-1]+(round.pen[i]-round.pen[i-1])*t;
  }
  return round.pen.at(-1);
}
const norm=a=>{let m=Math.hypot(...a)||1;return a.map(x=>x/m)},dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k];
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const len=v=>Math.hypot(...v);
const CLAMP=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
// Hull front slope / roof geometry is an ESTIMATE, not an extracted armor mesh.
export function armorPlate(name,hit,direction){
  const p=getProfile(name);if(!p)return null;
  let [x,y,z]=hit;
  const roof=y>2.72 && direction[1]<-.45;
  const turret=y>=1.9;
  const flank=Math.abs(x)>1.25;
  const rear=z>1.65;
  const face=roof?'roof':flank?'side':rear?'rear':'front';
  const vals=turret?p.armor.turret:p.armor.hull;
  const mm=roof?p.armor.roof:vals[face==='front'?0:face==='side'?1:2];
  // Normals point outwards. Front upper and lower hull have different inclinations.
  let n=roof?[0,1,0]:flank?[Math.sign(x),0,0]:rear?[0,0,1]:[0,0,-1];
  let detail=turret?'turret':y>1.25?'upperHull':'lowerHull';
  if(!turret&&face==='front')n=y>1.25?[0,.80,-.60]:[0,.50,-.866];
  if(turret&&face==='front')n=norm([CLAMP(x*.28,-.32,.32),0,-1]);
  return {mm,group:turret?'turret':'hull',face,detail,normal:n};
}
const MODULES={
 driver:{p:[0,1.0,-1.45],radius:.51},gunner:{p:[-.65,2.28,-.2],radius:.47},
 commander:{p:[.65,2.31,.45],radius:.47},loader:{p:[.68,2.18,-.55],radius:.51},
 engine:{p:[0,1.06,1.67],radius:.74},transmission:{p:[0,.84,-1.93],radius:.60},
 tracksL:{p:[-1.7,.77,0],radius:.58},tracksR:{p:[1.7,.77,0],radius:.58},
 turret:{p:[0,2.35,0],radius:.60},breech:{p:[0,2.3,-.92],radius:.54},
 ammo:{p:[.32,1.15,.55],radius:.61}
};
export const MODULE_LAYOUT=MODULES;
function raySphere(origin,direction,center,radius){
 const from=sub(center,origin),t=dot(from,direction);
 if(t<0||t>6.5)return false;
 let closest=add(origin,direction,t);
 return len(sub(center,closest))<=radius;
}
function fragmentRays(direction,halfAngleDeg,count){
 let d=norm(direction),u=norm(cross(d,Math.abs(d[1])<.9?[0,1,0]:[1,0,0])),v=cross(d,u);
 const rays=[d];let half=halfAngleDeg*Math.PI/180;
 for(let i=1;i<count;i++){
   let theta=half*Math.sqrt((i-.5)/Math.max(count-1,1)),phi=i*2.399963229728653;
   rays.push(norm(add(add(d.map(k=>k*Math.cos(theta)),u,Math.sin(theta)*Math.cos(phi)),v,Math.sin(theta)*Math.sin(phi))));
 }
 return rays;
}
// This is a line/cone test against schematic compartments. Not Gaijin's 3-D damage model.
export function resolveArmorHit({targetName,hit,direction,distance=10,round,damageModule,onDestroyed}){
 const profile=getProfile(targetName),impact=armorPlate(targetName,hit,direction);
 if(!profile||!impact||!round)return {message:'无可信弹药配置',pierced:false,penetration:0,eff:0,slope:0};
 const d=norm(direction),incident=CLAMP(-dot(d,norm(impact.normal)),.001,1);
 let slope=Math.acos(incident)*180/Math.PI;
 let chemical=['HE','HEAT','HEATFS','ATGM','HESH'].includes(round.type);
 const normalizeDeg=chemical?0:['APCBC','APHEBC'].includes(round.type)?6:round.type==='APC'?4:round.type==='APCR'?1:3;
 const angle=CLAMP(slope-normalizeDeg,0,88)*Math.PI/180;
 const eff=impact.mm/Math.max(.08,Math.cos(angle));
 const pen=penetrationAt(distance,round);
 const ricochet=!chemical && slope>74 && pen<eff*1.6;
 const pierced=!ricochet&&pen>=eff;
 const explosive=round.type==='HE'||round.type==='HESH';
 // HE does not magically transmit blast through intact armor; its penetration is from shell-specific table.
 const breach=pierced && (explosive||round.type==='APHE'||round.type==='APHEBC'||round.chemical);
 if(!pierced)return {message:ricochet?'跳弹':'未击穿',pierced:false,penetration:Math.round(pen),eff:Math.round(eff),slope:Math.round(slope),plate:impact,damaged:[]};
 const damageHits=new Map();
 // Main penetrator path always begins just inside the entry plate. APHE burst is delayed.
 const slugOrigin=add(hit,d,.03);
 for(const [key,m] of Object.entries(MODULES))if(raySphere(slugOrigin,d,m.p,m.radius)){
    damageHits.set(key,.42);
 }
 const firedAsChemical=round.chemical||['HEAT','HEATFS','ATGM'].includes(round.type);
 const apBurst=['APHE','APHEBC'].includes(round.type);
 const width=firedAsChemical?9:apBurst?42:explosive?36:round.type==='APCR'?15:25;
 const num=firedAsChemical?11:apBurst?29:explosive?35:round.type==='APCR'?11:18;
 const origin=add(hit,d,.18+(apBurst?.55:0));
 let rays=fragmentRays(d,width,num);
 for(let n=0;n<rays.length;n++)for(const [key,m] of Object.entries(MODULES)){
   if(raySphere(origin,rays[n],m.p,m.radius)){
      let prior=damageHits.get(key)||0;
      damageHits.set(key,Math.min(1.2,prior+(n===0?.42:.065)*(firedAsChemical?.9:1)));
   }
 }
 // Overpressure: requires a HE-effect breach and a damaged internal module.
 // APHE only qualifies if its VERIFIED TNT equivalent >=170 g; unknown fillers cannot qualify.
 const apPressure=apBurst&&Number.isFinite(round.heFillTntG)&&round.heFillTntG>=170;
 const overpressureEligible=breach && (explosive||apPressure || (firedAsChemical&&round.blast===true));
 const compartmentBreach=[...damageHits.keys()].some(k=>!['tracksL','tracksR','breech'].includes(k));
 let overpressure=false;
 if(overpressureEligible&&compartmentBreach){
   overpressure=true;
   const radius=explosive?2.4:1.45;
   for(const key of ['driver','gunner','commander','loader']){
     const module=MODULES[key];
     if(len(sub(module.p,origin))<=radius)damageHits.set(key,Math.max(damageHits.get(key)||0,.70));
   }
 }
 if(damageHits.size===0){ // grazing shot; armor pierced but no module struck.
   return {message:'击穿（无内部损伤）',pierced:true,penetration:Math.round(pen),eff:Math.round(eff),slope:Math.round(slope),plate:impact,damaged:[],overpressure:false};
 }
 for(let [key,amount] of damageHits)damageModule(key,CLAMP(amount,0,1));
 if(onDestroyed)onDestroyed();
 return {message:overpressure?'爆炸超压':`穿透 · ${damageHits.size}模块受损`,pierced:true,penetration:Math.round(pen),eff:Math.round(eff),slope:Math.round(slope),plate:impact,damaged:[...damageHits.keys()],overpressure};
}