// FitPro ELITE V11 PRO — program & exercise engine
const DAYS=['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const EXERCISES=[
['bench','Barbell Bench Press','Göğüs','barbell','push',3,6,10],['incline','Incline Dumbbell Press','Üst göğüs','dumbbell','push',3,8,12],['fly','Cable Fly','Göğüs','cable','isolation',2,10,15],['chestpress','Chest Press Machine','Göğüs','machine','push',3,8,12],['pushup','Push-up','Göğüs','bodyweight','push',3,8,20],
['ohp','Overhead Press','Omuz','barbell','push',3,5,10],['dbpress','Dumbbell Shoulder Press','Omuz','dumbbell','push',3,8,12],['latraise','Lateral Raise','Yan omuz','dumbbell','isolation',3,10,20],['rear','Rear Delt Fly','Arka omuz','dumbbell','isolation',3,12,20],['facepull','Face Pull','Arka omuz','cable','pull',3,12,20],
['latpulldown','Lat Pulldown','Sırt','machine','pull',3,6,12],['row','Seated Cable Row','Sırt','cable','pull',3,8,12],['pullup','Pull-up','Sırt','bodyweight','pull',3,5,12],['drow','Dumbbell Row','Sırt','dumbbell','pull',3,8,12],['barrow','Barbell Row','Sırt','barbell','pull',3,6,10],['pullover','Cable Pullover','Sırt','cable','pull',2,10,15],
['squat','Barbell Squat','Quadriceps','barbell','squat',3,5,10],['frontsquat','Front Squat','Quadriceps','barbell','squat',3,5,10],['legpress','Leg Press','Quadriceps','machine','squat',3,8,15],['lunge','Walking Lunge','Quadriceps','dumbbell','squat',3,8,15],['bulgarian','Bulgarian Split Squat','Glute','dumbbell','squat',2,8,12],['extension','Leg Extension','Quadriceps','machine','isolation',3,10,15],
['rdl','Romanian Deadlift','Hamstring','barbell','hinge',3,6,12],['deadlift','Conventional Deadlift','Posterior chain','barbell','hinge',3,3,8],['curlleg','Leg Curl','Hamstring','machine','curl',3,10,15],['hip','Hip Thrust','Glute','barbell','hinge',3,6,12],['backext','Back Extension','Posterior chain','bodyweight','hinge',2,10,15],['calf','Calf Raise','Calf','machine','calf',3,10,20],
['bcurl','Barbell Curl','Biceps','barbell','curl',3,8,12],['dbcurl','Dumbbell Curl','Biceps','dumbbell','curl',3,8,15],['hcurl','Hammer Curl','Biceps','dumbbell','curl',2,10,15],['preacher','Preacher Curl','Biceps','machine','curl',2,10,15],
['pushdown','Triceps Pushdown','Triceps','cable','isolation',3,10,15],['ohtri','Overhead Triceps Extension','Triceps','dumbbell','isolation',2,10,15],['skull','Skull Crusher','Triceps','barbell','isolation',3,8,12],['dip','Dips','Triceps','bodyweight','push',3,6,15],
['cablecrunch','Cable Crunch','Karın','cable','core',3,10,20],['plank','Plank','Karın','bodyweight','core',3,30,60],['abwheel','Ab Wheel','Karın','bodyweight','core',3,6,15],['hanging','Hanging Knee Raise','Karın','bodyweight','core',3,8,15]
];

const EXERCISE_MEDIA={
 bench:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Bench-Press.gif',
 incline:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Incline-Dumbbell-Press.gif',
 fly:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crossover.gif',
 chestpress:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Press-Machine.gif',
 pushup:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Push-Up.gif',
 ohp:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Shoulder-Press.gif',
 dbpress:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif',
 latraise:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif',
 rear:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Rear-Delt-Raise.gif',
 facepull:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Face-Pull.gif',
 latpulldown:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif',
 row:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif',
 pullup:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pull-Up.gif',
 drow:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Row.gif',
 barrow:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Row.gif',
 pullover:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Straight-Arm-Pulldown.gif',
 squat:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Squat.gif',
 frontsquat:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Front-Squat.gif',
 legpress:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Press.gif',
 lunge:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif',
 bulgarian:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Bulgarian-Split-Squat.gif',
 extension:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Leg-Extension.gif',
 rdl:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Romanian-Deadlift.gif',
 deadlift:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Deadlift.gif',
 curlleg:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lying-Leg-Curl.gif',
 hip:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Hip-Thrust.gif',
 backext:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hyperextension.gif',
 calf:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Standing-Calf-Raise.gif',
 bcurl:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Curl.gif',
 dbcurl:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Curl.gif',
 hcurl:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Hammer-Curl.gif',
 preacher:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Lever-Preacher-Curl.gif',
 pushdown:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Pushdown.gif',
 ohtri:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Triceps-Extension.gif',
 skull:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Barbell-Skull-Crusher.gif',
 dip:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Chest-Dips.gif',
 cablecrunch:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Cable-Crunch.gif',
 plank:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Plank.gif',
 abwheel:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Ab-Wheel-Rollout.gif',
 hanging:'https://fitnessprogramer.com/wp-content/uploads/2021/02/Hanging-Leg-Raise.gif'
};
const EXERCISE_TIPS={
 bench:['Kürek kemiklerini geriye-aşağı sabitle, ayakları yere bas ve barı kontrollü indir.','Dirsekleri tamamen yana açma; sekme yapma.','Dumbbell Bench Press','Kas kazanımı: 6–10 tekrar, son sette yaklaşık RIR 1–2.'],
 incline:['Bench açısını yaklaşık 20–35° tut; dirsekleri kontrollü aşağı indir.','Omuzları öne düşürme ve hareketi yarım yapma.','Push-up / Chest Press Machine','Üst göğüs odaklı günlerde kontrollü eksantrik kullan.'],
 fly:['Kolları hafif bükülü tut, göğüste esnemeyi kontrollü al ve elleri sıkıştır.','Aşırı ağırlıkla dirsekleri büküp press hareketine çevirme.','Dumbbell Fly / Chest Press Machine','İzolasyonda 10–15 tekrar ve 60–90 sn dinlenme.'],
 squat:['Derinliği hareket açıklığın izin verdiği kadar kullan; dizleri ayak yönünde takip ettir.','Belini aşırı kamburlaştırma veya dizleri içeri çökertme.','Goblet Squat / Leg Press','Teknik bozuluyorsa ağırlığı artırma.'],
 rdl:['Kalçayı geriye gönder, omurgayı nötr tut ve hamstring gerilimini takip et.','Hareketi çömelmeye çevirme veya barı vücuttan uzaklaştırma.','Dumbbell RDL / Back Extension','Hamstring odaklı çalışmada 6–12 tekrar uygundur.'],
 deadlift:['Barı vücuda yakın tut, başlangıçta karını sık ve zemini it.','Belden çekme, barı öne kaçırma veya tekrarları kontrolsüz bırakma.','Romanian Deadlift / Leg Curl','Güç hedefinde düşük tekrar kullan; teknik her zaman öncelikli.'],
 latpulldown:['Göğsü hafif yukarıda tut, dirsekleri aşağı-cebe doğru çek.','Barı enseye çekme veya vücudu aşırı geriye yatırma.','Pull-up / Seated Cable Row','Sırtı hissetmek için dönüş fazını 2–3 sn kontrol et.'],
 row:['Gövdeyi sabit tut, dirsekleri geriye sür ve kürekleri kontrollü sık.','Ağırlığı momentumla savurma.','Dumbbell Row / Lat Pulldown','8–12 tekrar aralığında tam kontrollü tekrarlar hedefle.'],
 latraise:['Dirsekleri hafif kır, kolları yana kaldır ve omuz hizasına yakın dur.','Ağırlığı savurma veya trapeziusu gereksiz yere yükseltme.','Cable Lateral Raise / Machine Lateral Raise','Yan omuz için 10–20 tekrar iyi bir başlangıç aralığıdır.'],
 pushdown:['Dirsekleri gövdeye yakın sabitle, sadece dirsek ekleminden aç-kapat.','Omuzdan sallama ve gövdeyi öne düşürme.','Overhead Triceps Extension / Dips','Kontrollü negatif ve tam dirsek açılımı kullan.'],
 bcurl:['Dirsekleri sabit tut, ön kolu kontrollü kaldır ve indir.','Belden momentum alma.','Dumbbell Curl / Hammer Curl','Biceps izolasyonunda 8–15 tekrar aralığını kullan.'],
 legpress:['Bel ve kalçayı pedden kaldırmadan kontrollü derinliğe in.','Dizleri kilitleme ve platformu sadece yarım hareket ettirme.','Squat / Bulgarian Split Squat','Ayak konumunu rahatlık ve hedef kasa göre ayarla.']
};
const genericTip=(e)=>[`${e.name} hareketinde kontrollü tekrar, tam güvenli hareket açıklığı ve sabit gövde önceliklidir.`,`Ağırlığı momentumla taşımak yerine kası hedefle; ağrı oluşursa hareketi durdur.`,`Aynı hareket desenindeki başka bir varyasyona geçebilirsin.`,`Başlangıç önerisi: ${e.min}-${e.max} tekrar, RIR 2–3.`];
function exerciseMeta(e,profile){const m=EXERCISE_TIPS[e[0]]||genericTip(e), level=profile?.level||'beginner', goal=profile?.goal||'muscle';let reps=e[6]+'–'+e[7],rir=level==='beginner'?3:(goal==='strength'||goal==='performance'?1:2);if(goal==='fat')rir=Math.max(rir,2);return {gif:EXERCISE_MEDIA[e[0]]||'',instructions:m[0],mistakes:m[1],alternative:m[2],tip:m[3],recommendation:`${level==='beginner'?'Teknik odaklı':level==='advanced'||level==='athlete'?'İleri seviye yükleme':'Orta seviye'}: ${reps} tekrar • RIR ${rir} • ${e[5]} set. ${goal==='strength'?'Güç hedefinde ana hareketlerde daha ağır, kontrollü setler tercih edilir.':goal==='fat'?'Yağ kaybında teknik ve toplam antrenman hacmi önceliklidir.':'Kas gelişiminde hedef tekrar aralığını tamamladığında ağırlığı küçük adımlarla artır.'}`}}
function exerciseAlternatives(ex,profile){return EXERCISES.filter(x=>x[0]!==ex.id&&x[2]===ex.muscle&&x[4]===ex.pattern&&exerciseAllowed(profile?.equipment,x[3])).slice(0,3).map(x=>x[1])}

function defaultWeekdays(days){const d=Math.max(2,Math.min(6,+days||3));return ({2:[0,3],3:[0,2,4],4:[0,1,3,5],5:[0,1,2,4,5],6:[0,1,2,3,4,5]})[d]||[0,2,4]}
function normalizeWeekdays(value,days){let a=Array.isArray(value)?value:(typeof value==='string'?(()=>{try{return JSON.parse(value)}catch{return[]}})():[]);a=[...new Set(a.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<7))];return a.length===+days?a:defaultWeekdays(days)}
function buildPlan(p){const d=Math.max(2,Math.min(6,+p.daysPerWeek||3));const splits=({2:['Full Body A','Full Body B'],3:['Full Body A','Full Body B','Full Body C'],4:['Upper A','Lower A','Upper B','Lower B'],5:['Push','Pull','Legs','Upper','Lower'],6:['Push A','Pull A','Legs A','Push B','Pull B','Legs B']})[d];return {splits,weekdays:normalizeWeekdays(p.weekdays,d),daysPerWeek:d}}
function exerciseAllowed(profileEquipment,exerciseEquipment){return profileEquipment==='home'?['barbell','dumbbell','bodyweight'].includes(exerciseEquipment):true}
function exercisesFor(split,profile){const p=profile||{};const t=split.toLowerCase();let wanted;if(t.includes('push'))wanted=['push','isolation'];else if(t.includes('pull'))wanted=['pull','curl'];else if(t.includes('legs')||t.includes('lower'))wanted=['squat','hinge','curl','calf','isolation'];else if(t.includes('upper'))wanted=['push','pull','isolation','curl'];else wanted=['push','pull','squat','hinge','core'];let pool=EXERCISES.filter(e=>exerciseAllowed(p.equipment,e[3]));let out=pool.filter(e=>wanted.includes(e[4]));if(!out.length)out=pool;const count=p.sessionMinutes>=105?9:p.sessionMinutes>=75?8:p.sessionMinutes>=60?6:5;const beginner=p.level==='beginner';return out.slice(0,count).map(e=>{const meta=exerciseMeta(e,p);return {id:e[0],name:e[1],muscle:e[2],equipment:e[3],pattern:e[4],sets:beginner?Math.min(3,e[5]):e[5],min:e[6],max:e[7],rest:['isolation','curl','calf','core'].includes(e[4])?75:150,...meta}})}
function splitForToday(plan){const idx=plan.weekdays.indexOf(((new Date().getDay()+6)%7));return idx<0?null:plan.splits[idx%plan.splits.length]}
