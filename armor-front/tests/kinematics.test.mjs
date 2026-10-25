import assert from 'node:assert/strict';import {getKinematics,approachTurret,approachAxis,estimateAcceleration} from '../app/src/main/assets/kinematics.js';
const d=Math.PI/180,p=getKinematics('Panzer III'),t=getKinematics('T-34-85'),fixed=getKinematics('Ferdinand');
assert.equal(p.hpPerTon,12.2);assert.equal(t.turretDegSec,14.9);
assert.ok(Math.abs(approachTurret(0,90*d,1,p)-8.3*d)<1e-5);
assert.ok(Math.abs(approachAxis(0,40*d,1,t)-2.2*d)<1e-5);
assert.ok(approachAxis(0,40*d,30,t)<=5*d+1e-5);
assert.ok(approachAxis(0,-50*d,30,t)>=-22*d-1e-5);
assert.ok(approachTurret(0,90*d,100,fixed)<=12*d+1e-5);
assert.ok(estimateAcceleration(t,1)>estimateAcceleration(p,.5));console.log('kinematics test passed');
