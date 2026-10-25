const D=Math.PI/180;
const configs={
 'T-34-85':{verified:true,source:'https://wiki.warthunder.com/unit/ussr_t_34_85_zis_53',hp:442,ton:32.2,hpPerTon:13.7,forward:55,reverse:8,turretDegSec:14.9,elevationDegSec:2.2,depress:-5,elevate:22,arc:[-180,180],stabilizer:false,crew:5},
 'Panzer III':{verified:true,source:'https://wiki.warthunder.com/unit/germ_pzkpfw_III_ausf_J',hp:265,ton:21.8,hpPerTon:12.2,forward:53,reverse:10,turretDegSec:8.3,elevationDegSec:2.2,depress:-10,elevate:20,arc:[-180,180],stabilizer:false,crew:5},
 'Abrams (Freeciv)':{verified:false,source:'Freeciv fictional values (not a War Thunder variant)',hp:1500,ton:62,hpPerTon:24.2,forward:55,reverse:28,turretDegSec:23,elevationDegSec:8,depress:-9,elevate:20,arc:[-180,180],stabilizer:true,crew:4},
 'Ferdinand':{verified:false,source:'approximate, unplayable pending model',hp:600,ton:65,hpPerTon:9.2,forward:30,reverse:10,turretDegSec:5,elevationDegSec:2.2,depress:-8,elevate:14,arc:[-12,12],stabilizer:false,fixedCasemate:true},
 'Maus':{verified:false,source:'approximate, unplayable pending model',hp:1200,ton:188,hpPerTon:6.4,forward:20,reverse:12,turretDegSec:5,elevationDegSec:2.2,depress:-7,elevate:20,arc:[-180,180],stabilizer:false,gunCount:2}
};
export const getKinematics=name=>configs[name]||{verified:false,hpPerTon:10,forward:35,reverse:8,turretDegSec:7,elevationDegSec:2.2,depress:-5,elevate:15,arc:[-180,180],stabilizer:false};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function approachTurret(current,goal,dt,st,health=1){const low=st.arc[0]*D,high=st.arc[1]*D;const dest=clamp(wrap(goal),low,high);const diff=low<=-Math.PI&&high>=Math.PI?wrap(dest-current):dest-current;const rate=st.turretDegSec*D*(health<.12?.04:health<.4?.27:health<.7?.55:1);return clamp(wrap(current+clamp(diff,-rate*dt,rate*dt)),low,high)}
export function approachAxis(current,goal,dt,st,health=1){const low=-st.elevate*D,high=-st.depress*D;const dest=clamp(goal,low,high);const rate=st.elevationDegSec*D*(health<.12?.05:health<.4?.3:health<.7?.6:1);return clamp(current+clamp(dest-current,-rate*dt,rate*dt),low,high)}
export const estimateAcceleration=(st,power=1)=>Math.max(.1,Math.min(4.5,st.hpPerTon/9))*Math.max(.05,power)*1.6;
