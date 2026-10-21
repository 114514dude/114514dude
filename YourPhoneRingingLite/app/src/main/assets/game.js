"use strict";
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const b = (text, act, cls="") => '<button type="button" data-act="'+esc(act)+'" class="'+cls+'">'+esc(text)+'</button>';
const ITEMS = ["绿茶 · +1 生命", "白手套 · 查看真伪", "充电宝 · 双倍伤害", "胶带 · 跳过敌方回合", "盒饭 · 随机生命", "第三只手 · 丢弃手机"];
const g = {
  stage:"bathroom", mode:"normal", name:"UNKNOWN", round:1, wins:0, losses:0,
  hp:4, foeHp:4, maxHp:4, ammo:[], initialReal:0, initialFake:0,
  items:[1,1,1,1,1,1], foeTea:true, double:false, skip:false, peek:null,
  thrown:0, used:0, streak:0, locked:false, note:""
};
const rand = n => Math.floor(Math.random()*n);
const delay = ms => new Promise(res=>setTimeout(res,ms));
let audio;
function sound(freq=250, duration=.09, wave="square"){
  try {
    const Ctx=window.AudioContext||window.webkitAudioContext;
    if(!Ctx)return;
    audio=audio||new Ctx();
    if(audio.state==="suspended")audio.resume();
    const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
    osc.type=wave;osc.frequency.setValueAtTime(freq,t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(45,freq*.52),t+duration);
    gain.gain.setValueAtTime(.06,t);
    gain.gain.exponentialRampToValueAtTime(.001,t+duration);
    osc.connect(gain);gain.connect(audio.destination);osc.start(t);osc.stop(t+duration+.02);
  } catch(e){}
}
function glitch(){
  const f=$("#flash");
  f.classList.remove("on");void f.offsetWidth;f.classList.add("on");
  sound(150,.22,"sawtooth");
}
function fly(){
  const el=$("#projectile");el.classList.remove("throw");void el.offsetWidth;el.classList.add("throw");
  sound(390,.16);
}
function faceHurt(active){
  $("#face").src="art/"+(active?"face_hurt.svg":"face.svg");
  const el=$("#portrait");el.classList.remove("shock");
  if(active){void el.offsetWidth;el.classList.add("shock");}
}
function backgrounds(file){
  $("#backdrop").src="art/"+file+".svg";
  const inGame=(g.stage==="game"||g.stage==="items");
  $("#portrait").style.display=inGame?"block":"none";
  $("#phones").style.display=inGame?"flex":"none";
  $("#lifelines").style.display=inGame?"block":"none";
  $("#dialogue").classList.toggle("items",g.stage==="items");
  if(inGame)faceHurt(false);
}
function bars(n,max){
  return '<div style="display:inline-flex;gap:3px">'+Array.from({length:max},(_,i)=>'<i class="cable'+(i>=n?' cut':'')+'"></i>').join('')+'</div>';
}
function hud(){
  const rounds=g.mode==="endless"?"∞ / "+g.streak:g.wins+" : "+g.losses;
  $("#score").textContent="ROUND "+g.round+" · "+rounds;
  $("#status").textContent="BOX "+g.ammo.length+" · REAL "+g.initialReal+" · DUMMY "+g.initialFake;
  $("#lifelines").innerHTML='<div class="ll"><span>'+esc(g.name)+'</span>'+bars(g.hp,g.maxHp)+'</div><div class="ll"><span>冯萍</span>'+bars(g.foeHp,g.maxHp)+'</div>';
  $("#phones").innerHTML=g.ammo.map((_,i)=>'<i class="phoneicon'+(i===0&&g.peek===1?' preview':'')+'"></i>').join('');
}
function view(title,story,buttons,art){
  $("#heading").textContent=title;
  $("#story").textContent=story;
  $("#actions").innerHTML=buttons;
  $("#entry").innerHTML="";
  $("#entry").classList.remove("show");
  $("#subtitle").textContent=g.stage==="game"?"EMERGENCY LIFE SUPPORT ACTIVE":g.stage==="items"?"INVENTORY / ONE USE PER ROUND":g.stage==="ending"?"TRANSMISSION TERMINATED":"INCOMING CALL · UNKNOWN";
  backgrounds(art);
  hud();
}
function bathroom(){
  g.stage="bathroom";g.locked=false;
  view("YOUR PHONE RINGING",
    "厕所的灯管嗡嗡作响。镜面里的像素正在脱落。\n走廊传来一阵熟悉的手机铃声。",
    b("踢开门 · 三局两胜","normal","danger")+b("神秘药片 · 无尽模式","endless","gold"),
    "bathroom");
}
function contract(mode){
  g.mode=mode;g.stage="contract";g.locked=false;
  view("生 死 状",
    "拿起笔。签下你的名字。\n游戏一旦开始，这张纸便无法复原。",
    b("签署并撕毁纸张","sign","danger")+b("返回洗手间","bathroom"),
    "paper");
  $("#entry").classList.add("show");
  $("#entry").innerHTML='<input id="playerName" maxlength="18" autocomplete="off" placeholder="YOUR NAME" aria-label="玩家姓名">';
  $("#playerName").focus();
}
function sign(){
  const input=$("#playerName");g.name=(input&&input.value.trim().slice(0,18))||"UNKNOWN";
  g.wins=0;g.losses=0;g.round=1;g.streak=0;g.used=0;g.thrown=0;
  sound(110,.33,"triangle");
  startRound();
}
function startRound(){
  g.stage="game";g.maxHp=3+Math.min(g.round,3);
  g.hp=g.maxHp;g.foeHp=g.maxHp;g.peek=null;g.double=false;g.skip=false;
  g.items=[1,1,1,1,1,1];g.foeTea=true;g.locked=false;
  nextBox("新的一箱手机推上桌面。\n冯萍的表情一动不动。");
}
function nextBox(message){
  g.ammo=[];const size=Math.min(4+g.round,8);
  g.initialReal=1+rand(size-1);g.initialFake=size-g.initialReal;
  for(let i=0;i<size;i++)g.ammo.push(i<g.initialReal?1:0);
  for(let i=g.ammo.length-1;i>0;i--){let j=rand(i+1);[g.ammo[i],g.ammo[j]]=[g.ammo[j],g.ammo[i]];}
  g.peek=null;showGame(message);
}
function showGame(message){
  g.stage="game";
  const state=g.ammo.length?
    b("投向冯萍","throw","danger")+b("桌面刀测","test")+b("打开道具箱","items","gold"):
    b("打开下一箱手机","refill","gold")+b("打开道具箱","items");
  const extra=g.peek===1?"\n白手套提示：下一部真机亮起 66:6 PM":g.peek===0?"\n白手套提示：下一部只是空壳":"";
  view("冯萍  ＝）",message+"\n剩余 "+g.ammo.length+" 部手机｜本箱真 "+g.initialReal+" / 假 "+g.initialFake+extra,state,"table");
}
function showItems(){
  if(g.locked)return;
  g.stage="items";
  const choices=ITEMS.map((txt,i)=>g.items[i]?
    b(txt,"item-"+i,(i===2||i===4)?"gold":""):
    b("✓ "+txt,"none")).join("");
  view("道 具 箱","每种道具每局可用一次。选择后立即生效。",choices+b("合上道具箱","back"),"items");
}
function useItem(i){
  if(g.locked||g.stage!=="items"||!g.items[i])return;
  g.items[i]=0;g.used++;sound(620,.10,"triangle");
  let message="";
  switch(i){
    case 0:g.hp=Math.min(g.maxHp,g.hp+1);message="一升绿茶：生命线恢复一格。";break;
    case 1:g.peek=g.ammo.length?g.ammo[0]:null;message=g.peek===1?"白手套：屏幕显示 66:6 PM。这是真机。":g.peek===0?"白手套：屏幕毫无反应。只是假机。":"盒子已空。";break;
    case 2:g.double=true;message="充电宝接通：下一次真机投掷造成双倍伤害。";break;
    case 3:g.skip=true;message="胶带：冯萍下一回合将无法行动。";break;
    case 4:{let x=rand(2)?1:-1;g.hp=Math.max(0,Math.min(g.maxHp,g.hp+x));message=x>0?"盒饭：恢复一格生命。":"盒饭：身体失去一格生命。";break;}
    case 5:if(g.ammo.length)g.ammo.shift();g.peek=null;message="第三只手将最前面的手机丢进回收箱。";break;
  }
  if(checkEnd())return;
  showGame(message);
}
function lockButtons(lock){g.locked=lock;document.querySelectorAll("button").forEach(el=>el.disabled=lock);}
async function playerAction(isTest){
  if(g.stage!=="game"||g.locked||!g.ammo.length)return;
  lockButtons(true);
  const real=g.ammo.shift()===1;g.peek=null;g.thrown++;
  fly();await delay(280);
  if(real)glitch();
  await delay(280);
  if(!isTest&&real){g.foeHp-=g.double?2:1;faceHurt(true);}
  if(!isTest)g.double=false;
  const msg=isTest?(real?"刀尖刺破屏幕，真机炸出一团虚构的像素电火花。":"刀尖刺穿空壳，什么都没发生。"):(real?"手机击中了冯萍。又一根生命线熄灭。":"手机是空壳。冯萍没有受伤。");
  if(checkEnd())return;
  showGame(msg+"\n等待对方行动……");
  await delay(680);
  if(g.stage==="game")await enemyTurn();
}
async function enemyTurn(){
  if(g.stage!=="game")return;
  if(g.skip){g.skip=false;g.locked=false;showGame("胶带牢牢束住了冯萍的手。她跳过这一回合。");return;}
  if(!g.ammo.length){g.locked=false;showGame("盒子空了。打开下一箱。");return;}
  let pre="";
  if(g.foeHp<g.maxHp&&g.foeHp<=2&&g.foeTea){g.foeTea=false;g.foeHp=Math.min(g.maxHp,g.foeHp+1);pre="冯萍使用绿茶，恢复一格生命。\n";}
  const real=g.ammo.shift()===1;
  fly();await delay(280);
  if(real){glitch();g.hp--;}
  await delay(360);
  if(checkEnd())return;
  g.locked=false;
  showGame(pre+(real?"冯萍扔出真机！你的生命维持线被切断。":"冯萍扔出假机。你躲过一劫。"));
}
function checkEnd(){
  if(g.hp>0&&g.foeHp>0)return false;
  g.locked=false;
  if(g.foeHp<=0){g.wins++;g.streak++;}
  else {g.losses++;g.streak=0;}
  if(g.mode==="endless"){
    if(g.hp<=0){ending(false);return true;}
    g.round++;interlude(true);return true;
  }
  if(g.wins>=2||g.losses>=2){ending(g.wins>=2);return true;}
  g.round++;interlude(false);return true;
}
function interlude(endless){
  g.stage="interlude";
  const text=endless?
    "铃声又一次响起。你赢下第 "+g.streak+" 场。\n塔顶的电梯重新降落，另一箱手机已经准备就绪。":
    "虚构世界内的处分通告：\n有人未经许可改写了高塔里的朗读装置。\n新的纸张从墙缝中慢慢滑出来。";
  view(endless?"无 尽 轮 回":"处分通告 · 下一局",text,
    b("撕开纸张，继续","continue","danger")+b("退出到首页","bathroom"),"paper");
}
function ending(win){
  g.stage="ending";
  view(win?"SIGNAL RESTORED":"NO SIGNAL",
    win?"你坐在昏暗汽车的后排。\n座位旁放着手机箱，以及一把已经入鞘的刀。\n这一次，铃声终于停止。":
       "生命维持装置断电。屏幕上最后一个信号点悄然熄灭。\n你听见远处仍有人在拨打电话。",
    b("重新开始","bathroom","gold"),
    win?"car":"bathroom");
  $("#status").textContent="SCORE "+g.wins+":"+g.losses+" · THROWS "+g.thrown+" · ITEMS "+g.used;
}
function dispatch(action){
  if(g.locked)return;
  if(action==="normal"||action==="endless")contract(action);
  else if(action==="bathroom")bathroom();
  else if(action==="sign")sign();
  else if(action==="throw")playerAction(false);
  else if(action==="test")playerAction(true);
  else if(action==="items")showItems();
  else if(action==="back")showGame("你合上道具箱。");
  else if(action==="refill")nextBox("又一批手机被摆在桌上。");
  else if(action==="continue")startRound();
  else if(action.startsWith("item-"))useItem(Number(action.slice(5)));
}
document.addEventListener("click",event=>{
  const el=event.target.closest("[data-act]");if(!el)return;
  sound(510,.065,"triangle");
  dispatch(el.dataset.act);
});
window.goBack=function(){
  if(g.locked)return;
  if(g.stage==="items")showGame("你合上道具箱。");
  else if(g.stage==="contract")bathroom();
  else if(g.stage==="game")showItems();
  else bathroom();
};
bathroom();