/* ===== phase85：ストーリーに合わせたスタンプと、集める楽しさ（2026-11-27 の要望） =====
   ① クリアのスタンプの絵を道ごとに変える
      キルギスの物語・歴史の道（マナス・セメテイ・クルマンジャン・トクトグル）＝ユルタ（phase84）
      剣の道＝剣、魔法の道＝星、王の道＝冠、武士の道＝かぶと、海の道＝いかり
   ② 装備（各道17こ）に絵をつける。名前の言葉（剣・盾・かぶと…）から形を、
      （金・銀・赤・木…）から色を決める。すべてオリジナルの SVG。
      手に入れる順に「★1〜★4」の格（ふつう・めずらしい・とても貴重・伝説）をつけ、枠の色を変える。
   ③ 次にもらえるごほうびを冒険の画面に予告（影絵＋あと何テーマ）。
   ④ レッスンの結果で、新しい装備を絵つきのカードで見せる。 */

/* ---------- ① 道ごとのスタンプ（はんこ風の線画、currentColor で描く） ---------- */
function p85StampArt(v){
  var pid="";try{pid=p74S().path||"";}catch(_){}
  var P=null;try{P=p74Path();}catch(_){}
  if(!P||P.hist||!/^(sword|magic|king|samurai|sea)$/.test(pid))return p84Face(v);
  var C='currentColor',L='stroke="'+C+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"',F='fill="'+C+'" fill-opacity=".22"';
  var s='<circle cx="20" cy="20" r="18.4" fill="none" stroke="'+C+'" stroke-width="2"/>';
  /* 小さな顔（目とほっぺ）。v で表情を変える */
  var face=function(x,y,w){var E='stroke="'+C+'" stroke-width="1.3" stroke-linecap="round" fill="none"',o='';
    if(v===1)o+='<path d="M'+(x-w-1.1)+' '+(y+.4)+' q1.1 -1.4 2.2 0 M'+(x+w-1.1)+' '+(y+.4)+' q1.1 -1.4 2.2 0" '+E+'/>';
    else if(v===2)o+='<circle cx="'+(x-w)+'" cy="'+y+'" r="1.2" fill="'+C+'"/><path d="M'+(x+w-1.1)+' '+y+' h2.2" '+E+'/>';
    else o+='<circle cx="'+(x-w)+'" cy="'+y+'" r="1.2" fill="'+C+'"/><circle cx="'+(x+w)+'" cy="'+y+'" r="1.2" fill="'+C+'"/>';
    o+='<path d="M'+(x-1.2)+' '+(y+1.9)+' q1.2 1.1 2.4 0" '+E+'/>';
    return o;};
  var spark=function(x,y){return '<path d="M'+x+' '+(y-2.4)+' L'+x+' '+(y+2.4)+' M'+(x-2.4)+' '+y+' L'+(x+2.4)+' '+y+'" stroke="'+C+'" stroke-width="1.2" stroke-linecap="round"/>';};
  if(pid==="sword"){/* 剣：ななめの剣に顔 */
    s+='<g transform="rotate(40 20 20)"><path d="M17.6 25 L17.6 9 L20 5.4 L22.4 9 L22.4 25 Z" '+F+' '+L+'/><path d="M13 25 H27 V27.8 H13 Z" '+F+' '+L+'/><path d="M18.8 27.8 H21.2 V33 H18.8 Z" '+F+' '+L+'/><circle cx="20" cy="34.6" r="1.7" fill="none" '+L+'/>'+face(20,16,1.2).replace(/r="1.2"/g,'r=".9"')+'</g>';
    if(v===3)s+=spark(29,30);
  }else if(pid==="magic"){/* 魔法：ふっくらした星に顔 */
    s+='<path d="M20 6.5 L23.6 14.2 L32 15 L25.6 20.6 L27.6 29 L20 24.6 L12.4 29 L14.4 20.6 L8 15 L16.4 14.2 Z" '+F+' '+L+'/>'+face(20,18.6,2.6);
    if(v===3)s+=spark(30.5,8.5);
  }else if(pid==="king"){/* 王：冠に顔 */
    s+='<path d="M8.6 28 L8.6 13 L14.2 19.4 L20 10 L25.8 19.4 L31.4 13 L31.4 28 Z" '+F+' '+L+'/><path d="M8.6 28 H31.4 V31 H8.6 Z" '+F+' '+L+'/><circle cx="8.6" cy="12" r="1.3" fill="'+C+'"/><circle cx="20" cy="8.8" r="1.3" fill="'+C+'"/><circle cx="31.4" cy="12" r="1.3" fill="'+C+'"/>'+face(20,22.4,3.4);
    if(v===3)s+=spark(31,7);
  }else if(pid==="samurai"){/* 武士：くわ形のついたかぶとに顔 */
    s+='<path d="M15 14 Q12 8 9.4 6.4 M25 14 Q28 8 30.6 6.4" fill="none" '+L+'/><path d="M8.6 26 Q8.6 13 20 13 Q31.4 13 31.4 26 Z" '+F+' '+L+'/><path d="M6.4 26 Q20 23 33.6 26 L31 30.6 Q20 28.4 9 30.6 Z" '+F+' '+L+'/><circle cx="20" cy="16.2" r="1.5" fill="'+C+'"/>'+face(20,20.6,3.4);
    if(v===3)s+=spark(31,33);
  }else{/* 海：いかりに顔 */
    s+='<circle cx="20" cy="9.4" r="2.8" fill="none" '+L+'/><path d="M20 12.2 V31.2" fill="none" '+L+' stroke-width="2.2"/><path d="M14.4 16.4 H25.6" fill="none" '+L+'/><path d="M9.2 22.6 Q10 31.4 20 31.6 Q30 31.4 30.8 22.6" fill="none" '+L+'/><path d="M7.4 24.6 L9.2 22 L11.6 24 M32.6 24.6 L30.8 22 L28.4 24" fill="none" '+L+'/>'+
       '<ellipse cx="20" cy="23" rx="5.4" ry="4.6" '+F+' '+L+'/>'+face(20,22.4,2.2);
    if(v===3)s+=spark(31,10);
  }
  return s;
}

/* ---------- ② 装備の絵 ---------- */
/* 色：名前の言葉から素材の色を選ぶ（f＝面、a＝差し色） */
function p85Mat(n,P){
  var M=[[/金/,"#E8B931","#B8860B"],[/白銀|銀/,"#C9D3DE","#8A99AA"],[/鉄|鋼/,"#9AA4AE","#5F6B76"],[/水晶|紫水晶/,"#B9A5F2","#7B5FD6"],[/紫/,"#8E5BC8","#5E3592"],
         [/赤|紅/,"#D9483B","#9E2A20"],[/青/,"#3A7EE0","#21539E"],[/緑/,"#3FA35F","#22703C"],[/黒/,"#4A4F5A","#22252C"],[/白/,"#F3F1EA","#B9B3A3"],
         [/星|光|夜明け|聖|月/,"#FFE27A","#E0A100"],[/夜空/,"#3B3F8F","#22255E"],[/革|毛皮/,"#B07A47","#7A4E27"],[/木|竹|くわ|棒|オール|つりざお/,"#C8955B","#8A5D2E"],[/羊毛|フェルト|カルパク/,"#F3F1EA","#B9B3A3"]];
  for(var i=0;i<M.length;i++)if(M[i][0].test(n))return {f:M[i][1],a:M[i][2]};
  return {f:P&&P.color||"#8A99AA",a:"#5F6B76"};
}
/* 形：名前の言葉から選ぶ（上から順に調べる） */
var P85_KIND=[
  [/かぶと/,"helm"],[/陣がさ/,"jingasa"],[/三角帽子/,"tricorn"],[/とんがり|星の帽子|賢者の帽子/,"wizhat"],[/カルパク/,"kalpak"],[/毛皮の帽子/,"furhat"],[/提督の帽子|水夫の帽子|革の帽子|帽子/,"cap"],[/フード/,"hood"],
  [/エレチェク|頭布/,"turban"],[/バンダナ|はちがね/,"band"],
  [/冠石|玉/,"orb"],[/冠/,"crown"],
  [/刀|名刀/,"katana"],[/剣|大剣|光剣|宝剣/,"sword"],[/盾/,"shield"],[/よろい|胴丸/,"armor"],
  [/マント|陣羽織/,"cloak"],[/ローブ|上着|チャパン|服|コート/,"robe"],
  [/王しゃく|杖/,"staff"],[/槍|やり/,"spear"],[/弓/,"bow"],[/矢筒/,"quiver"],[/むち/,"whip"],[/棒/,"stick"],
  [/魔導書/,"book"],[/地図|海図/,"map"],[/まき物|名簿|記録/,"scroll"],[/かご/,"basket"],[/指輪/,"ring"],[/かぎ/,"key"],[/旗/,"flag"],[/印章/,"seal"],
  [/羽/,"feather"],[/かざり/,"jewel"],[/帯どめ|帯/,"belt"],[/袋/,"bag"],[/コムズ/,"komuz"],[/弦/,"strings"],
  [/くわ/,"hoe"],[/つりざお/,"rod"],[/オール/,"oar"],[/羅針盤/,"compass"],[/遠めがね/,"scope"],[/軍配/,"gunbai"],[/采配/,"saihai"],[/贈り物/,"belt"]
];
function p85Kind(n){for(var i=0;i<P85_KIND.length;i++)if(P85_KIND[i][0].test(n))return P85_KIND[i][1];return "jewel";}
/* 1つの装備の絵（viewBox 0 0 40 40）。sil＝まだ持っていない（影絵） */
function p85Item(n,P,sil){
  var k=p85Kind(n),m=p85Mat(n,P),f=sil?"#9AA0A8":m.f,a=sil?"#80868F":m.a,o=sil?"#6B7079":"#3A3026";
  var L='stroke="'+o+'" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"',W='fill="#C8955B"';if(sil)W='fill="'+f+'"';
  var s='';
  switch(k){
  case "sword":s='<g transform="rotate(40 20 20)"><path d="M17.8 25 L17.8 8 L20 4.4 L22.2 8 L22.2 25 Z" fill="'+f+'" '+L+'/><path d="M20 7 V24" stroke="#fff" stroke-opacity=".55" stroke-width="1"/><path d="M12.6 25 H27.4 V28 H12.6 Z" fill="'+a+'" '+L+'/><path d="M18.7 28 H21.3 V34 H18.7 Z" fill="#7A4E27" '+L+'/><circle cx="20" cy="35.4" r="1.9" fill="'+a+'" '+L+'/></g>';break;
  case "katana":s='<path d="M12.6 30.4 Q19 17 32.4 6.4 Q22.6 18.6 14.6 31.8 Z" fill="'+f+'" '+L+'/><ellipse cx="13.4" cy="31.2" rx="3.6" ry="1.8" transform="rotate(-50 13.4 31.2)" fill="'+a+'" '+L+'/><path d="M12 32.8 L7.4 37.4" stroke="#3A3026" stroke-width="3.4" stroke-linecap="round"/>';break;
  case "shield":s=/丸/.test(n)?'<circle cx="20" cy="20" r="13.6" fill="'+f+'" '+L+'/><circle cx="20" cy="20" r="9.6" fill="none" stroke="'+a+'" stroke-width="1.6"/><circle cx="20" cy="20" r="3.2" fill="'+a+'" '+L+'/>'
     :'<path d="M9.6 7.6 H30.4 V19.4 Q30.4 29.6 20 35 Q9.6 29.6 9.6 19.4 Z" fill="'+f+'" '+L+'/><path d="M20 9.6 V32 M12 17 H28" stroke="'+a+'" stroke-width="2.4"/>'+(/聖/.test(n)?'<circle cx="20" cy="17" r="3" fill="#FFE27A" '+L+'/>':'');break;
  case "helm":s='<path d="M9 27 Q9 9.6 20 9.6 Q31 9.6 31 27 Z" fill="'+f+'" '+L+'/><path d="M7 26 H33 V29.4 H7 Z" fill="'+a+'" '+L+'/><path d="M20 10 V26" stroke="'+a+'" stroke-width="1.6"/>'+
     (/羽/.test(n)?'<path d="M21 10 Q26 2 33 4 Q28 9 22 11" fill="#D9483B" '+L+'/>':'')+(/くわ形/.test(n)?'<path d="M15 13 Q11 6 7.6 4 M25 13 Q29 6 32.4 4" fill="none" stroke="#E8B931" stroke-width="2.6" stroke-linecap="round"/>':'')+
     (P&&P.id==="samurai"?'<path d="M5.4 27 Q20 23.4 34.6 27 L32 32 Q20 29.6 8 32 Z" fill="'+a+'" '+L+'/>':'');break;
  case "jingasa":s='<path d="M4.6 26 L20 13 L35.4 26 Q20 29.4 4.6 26 Z" fill="'+f+'" '+L+'/><circle cx="20" cy="20.6" r="2.4" fill="#E8B931" '+L+'/>';break;
  case "tricorn":s='<path d="M5.4 22 Q12 26 20 22 Q28 26 34.6 22 L30 30.6 Q20 27.6 10 30.6 Z" fill="'+f+'" '+L+'/><path d="M11.4 23.6 Q12 12.6 20 12.6 Q28 12.6 28.6 23.6" fill="'+f+'" '+L+'/><path d="M10 29 Q20 26.6 30 29" stroke="#E8B931" stroke-width="1.4" fill="none"/>';break;
  case "wizhat":s='<path d="M8 30 Q20 34 32 30 Q27 27.6 26 26 L21.4 5.4 Q19.6 4.4 18.4 6.6 L14 26 Q13 27.6 8 30 Z" fill="'+f+'" '+L+'/><path d="M14.2 25.4 Q20 27.6 25.8 25.4" stroke="'+a+'" stroke-width="2.2" fill="none"/>'+(/星/.test(n)?'<path d="M19.6 13.4 l1 2 2.2.3 -1.6 1.5 .4 2.2 -2 -1 -2 1 .4 -2.2 -1.6 -1.5 2.2 -.3z" fill="#FFE27A" '+L+' stroke-width="1"/>':'');break;
  case "kalpak":s='<path d="M12 31 L14.4 10.4 Q20 7.4 25.6 10.4 L28 31 Z" fill="'+f+'" '+L+'/><path d="M11.4 31 L12.6 24 L20 25.6 L27.4 24 L28.6 31 Z" fill="#2B2B2B" '+L+'/><path d="M17 12 Q18 18 16.4 23 M23 12 Q22 18 23.6 23" stroke="#2B2B2B" stroke-width="1" fill="none"/><circle cx="20" cy="8.8" r="1.4" fill="#2B2B2B"/>';break;
  case "furhat":s='<path d="M10 22 Q10 9 20 9 Q30 9 30 22 Z" fill="'+f+'" '+L+'/><path d="M7.4 21 Q20 17 32.6 21 L32 29 Q20 26 8 29 Z" fill="#8A5D2E" '+L+'/><path d="M10 23 l1.4 3 M14 22 l1 3 M18 21.6 l.6 3 M22 21.6 l-.2 3 M26 22 l-.8 3 M30 23 l-1 3" stroke="#5A3A1A" stroke-width="1"/>';break;
  case "cap":s='<path d="M9 25 Q9 11 20 11 Q31 11 31 25 Z" fill="'+f+'" '+L+'/><path d="M6 25 Q20 21.6 34 25 Q20 29.4 6 25 Z" fill="'+a+'" '+L+'/>'+(/提督/.test(n)?'<circle cx="20" cy="18" r="2.6" fill="#E8B931" '+L+'/>':'');break;
  case "hood":s='<path d="M8 33 Q7 9 20 7.4 Q33 9 32 33 Q26 30 20 30 Q14 30 8 33 Z" fill="'+f+'" '+L+'/><path d="M13 27 Q13 14 20 13.4 Q27 14 27 27 Q20 25 13 27 Z" fill="#2B2B33" '+L+'/>';break;
  case "turban":s='<path d="M10 29 Q8.6 13 20 9.6 Q31.4 13 30 29 Z" fill="'+f+'" '+L+'/><path d="M10.4 18 Q20 14 29.6 18 M10 23 Q20 19 30 23" stroke="'+a+'" stroke-width="1.4" fill="none"/><path d="M12 29 Q20 33 28 29 L29 34 Q20 37 11 34 Z" fill="'+f+'" '+L+'/>';break;
  case "band":s='<path d="M7 18 Q20 13 33 18 L33 23 Q20 18 7 23 Z" fill="'+f+'" '+L+'/><path d="M31 21 Q35 25 33.6 31 M31.6 21.4 Q31 27 27.6 30" stroke="'+f+'" stroke-width="2.8" stroke-linecap="round" fill="none"/>'+(/はちがね/.test(n)?'<rect x="16" y="15" width="8" height="4.6" rx="1" fill="#C9D3DE" '+L+'/>':'');break;
  case "crown":s='<path d="M8 29 L8 13.4 L14 20 L20 10 L26 20 L32 13.4 L32 29 Z" fill="'+f+'" '+L+'/><path d="M8 29 H32 V32.6 H8 Z" fill="'+a+'" '+L+'/><circle cx="20" cy="24.4" r="2.4" fill="#D9483B" '+L+'/><circle cx="13" cy="25" r="1.6" fill="#3A7EE0"/><circle cx="27" cy="25" r="1.6" fill="#3A7EE0"/>';break;
  case "orb":s='<path d="M12 35 H28 L25 29 H15 Z" fill="#8A5D2E" '+L+'/><circle cx="20" cy="18" r="11" fill="'+f+'" '+L+'/><path d="M14.6 14 Q16 10.6 19.6 10" stroke="#fff" stroke-opacity=".8" stroke-width="2" fill="none" stroke-linecap="round"/>';break;
  case "armor":s='<path d="M12 9 L16.6 7 Q20 10.4 23.4 7 L28 9 L31.4 15.4 L28 17.4 L28 32 Q20 35 12 32 L12 17.4 L8.6 15.4 Z" fill="'+f+'" '+L+'/><path d="M12 22 Q20 25 28 22 M12 27 Q20 30 28 27" stroke="'+a+'" stroke-width="1.5" fill="none"/>'+(/くさり/.test(n)?'<path d="M14 13 h12 M14 17 h12" stroke="'+a+'" stroke-dasharray="1.4 1.4" stroke-width="1.4"/>':'');break;
  case "cloak":s='<path d="M14.4 7.4 H25.6 L33.6 33.6 Q20 30.4 6.4 33.6 Z" fill="'+f+'" '+L+'/><path d="M14.4 7.4 Q20 12 25.6 7.4" stroke="'+a+'" stroke-width="1.6" fill="none"/><circle cx="20" cy="10.4" r="1.8" fill="#E8B931" '+L+'/>';break;
  case "robe":s='<path d="M15 7 L25 7 L32.6 13 L29.6 17.4 L27.4 15.4 L28.4 34 H11.6 L12.6 15.4 L10.4 17.4 L7.4 13 Z" fill="'+f+'" '+L+'/><path d="M15 7 L20 14 L25 7 M20 14 V34" stroke="'+a+'" stroke-width="1.5" fill="none"/><path d="M12.2 22 H27.8" stroke="'+a+'" stroke-width="2.6"/>'+(/毛皮/.test(n)?'<path d="M15 7 Q20 11 25 7 L23.6 12.4 Q20 14 16.4 12.4 Z" fill="#B07A47" '+L+'/>':'')+(/刺しゅう|アクン|英雄/.test(n)?'<path d="M14 27 l2 2 2 -2 2 2 2 -2 2 2 2 -2" stroke="#E8B931" stroke-width="1.2" fill="none"/>':'');break;
  case "staff":s='<path d="M13 35 L25 9" stroke="'+(/木/.test(n)?"#8A5D2E":a)+'" stroke-width="2.8" stroke-linecap="round"/>'+(/王しゃく|水晶|光|アライ|大杖/.test(n)?'<circle cx="26" cy="7.6" r="4.4" fill="'+f+'" '+L+'/>':'<circle cx="25.4" cy="8.6" r="2.2" fill="#8A5D2E" '+L+'/>');break;
  case "stick":s='<path d="M12 34 Q18 22 28 7" stroke="#8A5D2E" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M21 19 l4 -1" stroke="#8A5D2E" stroke-width="2" stroke-linecap="round"/>';break;
  case "spear":s='<path d="M10 34 L27 9" stroke="#8A5D2E" stroke-width="2.4" stroke-linecap="round"/><path d="M25.4 11.2 L31.6 3.6 L29.4 13.2 Z" fill="'+(/竹/.test(n)?"#C8B25B":f)+'" '+L+'/>'+(/竹/.test(n)?'':'<path d="M23.6 13 l3.2 2.2" stroke="#D9483B" stroke-width="2"/>');break;
  case "bow":s='<path d="M13 5 Q34 20 13 35" stroke="#8A5D2E" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M13 5 V35" stroke="#555" stroke-width="1"/><path d="M8 20 H29 M26 17.6 L29.6 20 L26 22.4" stroke="#3A3026" stroke-width="1.4" fill="none"/>';break;
  case "quiver":s='<path d="M12 12 L24 32 L29.4 29 L17.4 9 Z" fill="'+(sil?f:"#B07A47")+'" '+L+'/><path d="M14 10 L10 4 M16.4 9 L14 3 M18.6 8.4 L18.4 2.6" stroke="#3A3026" stroke-width="1.2"/><path d="M8.6 4.6 l2.6 -1 M12.6 3.4 l2.6 -.4 M17 3 l2.6 .2" stroke="#D9483B" stroke-width="2"/>';break;
  case "whip":s='<path d="M8 34 L15 25" stroke="#7A4E27" stroke-width="3.4" stroke-linecap="round"/><path d="M15 25 Q24 12 31 14 Q36 17 30 22 Q24 26 27 31" stroke="'+(sil?f:"#B07A47")+'" stroke-width="1.8" fill="none" stroke-linecap="round"/>';break;
  case "book":s='<path d="M9 8 H29 Q31 8 31 10 V32 H11 Q9 32 9 30 Z" fill="'+f+'" '+L+'/><path d="M11 32 Q9 32 9 30 Q9 28 11 28 H31" stroke="'+o+'" stroke-width="1.5" fill="#F3F1EA"/><circle cx="20" cy="17.6" r="4" fill="none" stroke="#E8B931" stroke-width="1.6"/><path d="M20 13 V22.2 M15.4 17.6 H24.6" stroke="#E8B931" stroke-width="1"/>';break;
  case "scroll":s='<path d="M11 9 H29 V31 H11 Z" fill="#F3E7C8" '+L+'/><path d="M8.6 9 H31.4 M8.6 31 H31.4" stroke="'+(sil?f:"#8A5D2E")+'" stroke-width="3.6" stroke-linecap="round"/><path d="M14 15 H26 M14 19 H26 M14 23 H22" stroke="#8A7A5A" stroke-width="1.3"/>'+(/約束/.test(n)?'<circle cx="25" cy="25.6" r="2.4" fill="#D9483B"/>':'')+(/歌/.test(n)?'<path d="M24 22 v5 M24 22 l3 -1" stroke="#3A3026" stroke-width="1.2" fill="none"/><circle cx="23" cy="27" r="1.3" fill="#3A3026"/>':'');if(sil)s=s.replace('#F3E7C8',f);break;
  case "map":s='<path d="M6 10 L15 7 L25 10 L34 7 V30 L25 33 L15 30 L6 33 Z" fill="'+(sil?f:/海/.test(n)?"#BFE0EE":"#F3E7C8")+'" '+L+'/><path d="M15 7 V30 M25 10 V33" stroke="'+o+'" stroke-width="1" opacity=".5"/><path d="M10 25 Q15 17 21 22 T29 14" stroke="#D9483B" stroke-width="1.4" stroke-dasharray="2 1.6" fill="none"/><path d="M27.4 12 l3.2 3.2 M30.6 12 l-3.2 3.2" stroke="#D9483B" stroke-width="1.6"/>';break;
  case "basket":s='<path d="M13 18 Q13 6 20 6 Q27 6 27 18" stroke="#8A5D2E" stroke-width="2" fill="none"/><path d="M7 18 H33 L29.6 33 H10.4 Z" fill="'+(sil?f:"#C8955B")+'" '+L+'/><path d="M8.4 23 H31.6 M9.6 28 H30.4" stroke="#8A5D2E" stroke-width="1.2"/>'+(/薬草/.test(n)?'<path d="M15 18 Q14 12 17 11 M20 18 Q21 11 24 12 M25 18 Q27 14 29 15" stroke="#3FA35F" stroke-width="2" fill="none" stroke-linecap="round"/>':'')+(/羊毛/.test(n)?'<circle cx="16" cy="16.4" r="3.4" fill="#F3F1EA" '+L+'/><circle cx="23" cy="15.6" r="3.8" fill="#F3F1EA" '+L+'/>':'');break;
  case "ring":s='<circle cx="20" cy="24" r="9" fill="none" stroke="'+(sil?f:"#E8B931")+'" stroke-width="3.2"/><path d="M15.6 12.4 L20 7 L24.4 12.4 L20 16.4 Z" fill="'+f+'" '+L+'/>'+(/月/.test(n)&&!sil?'<path d="M18.6 9 Q17 11.6 19.4 14" stroke="#fff" stroke-width="1.2" fill="none"/>':'');break;
  case "key":s='<circle cx="13" cy="13" r="6" fill="none" stroke="'+(sil?f:"#E8B931")+'" stroke-width="3"/><path d="M17.4 17.4 L32 32 M27 27 l3.4 -3.4 M30 30 l2.6 -2.6" stroke="'+(sil?f:"#E8B931")+'" stroke-width="3" stroke-linecap="round"/>';break;
  case "flag":s='<path d="M10 36 V5" stroke="#8A5D2E" stroke-width="2.4" stroke-linecap="round"/><path d="M11 6 Q19 3 24 7 Q29 10 33 7 V21 Q29 24 24 21 Q19 17.6 11 20 Z" fill="'+f+'" '+L+'/>'+(/大提督/.test(n)?'<path d="M21.6 10 l1.2 2.4 2.6.3 -1.9 1.8 .5 2.6 -2.4 -1.3 -2.4 1.3 .5 -2.6 -1.9 -1.8 2.6 -.3z" fill="#FFE27A"/>':'');break;
  case "seal":s='<path d="M15 6 H25 V22 H15 Z" fill="#C8955B" '+L+'/><path d="M10 22 H30 V30 H10 Z" fill="'+(sil?f:"#8A5D2E")+'" '+L+'/><path d="M14 34 H26" stroke="#D9483B" stroke-width="3" stroke-linecap="round"/>';break;
  case "feather":s='<path d="M12 34 Q14 12 31 5 Q30 22 12 34 Z" fill="'+(sil?f:"#F3F1EA")+'" '+L+'/><path d="M12 34 Q20 20 29 8" stroke="'+(sil?a:"#8A5D2E")+'" stroke-width="1.3" fill="none"/>'+(sil?'':'<path d="M27 8 Q30 14 25 17" stroke="#3A3026" stroke-width="2.4" fill="none"/>');break;
  case "jewel":s='<path d="M13 8 Q20 15 27 8" stroke="'+(sil?f:"#E8B931")+'" stroke-width="1.6" fill="none"/><path d="M20 15 L27 22 L20 34 L13 22 Z" fill="'+f+'" '+L+'/><path d="M13 22 H27 M20 15 L17 22 L20 34 L23 22 Z" stroke="'+a+'" stroke-width="1" fill="none"/>';break;
  case "belt":s='<path d="M4 17 Q20 13 36 17 V24 Q20 20 4 24 Z" fill="'+f+'" '+L+'/><rect x="15" y="14.4" width="10" height="8.4" rx="2" fill="#E8B931" '+L+'/><path d="M6 20.6 h2 M10 19.8 h2 M28 19.8 h2 M32 20.6 h2" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>';break;
  case "komuz":s='<path d="M20.4 18 L30.6 4.4" stroke="#7A4E27" stroke-width="3" stroke-linecap="round"/><path d="M20 15 Q30 19 26 29 Q21 37 13 33 Q6 28 11 20 Q14 15 20 15 Z" fill="'+(sil?f:"#C8955B")+'" '+L+'/><path d="M14 31 L29 6 M15.6 32 L30.4 7 M12.6 30 L27.8 5.4" stroke="#F3F1EA" stroke-width=".6"/>'+(/よく鳴る/.test(n)&&!sil?'<path d="M32 16 q2 2 0 4 M34.6 14 q3 4 0 8" stroke="#E0A100" stroke-width="1.4" fill="none"/>':'');break;
  case "strings":s='<circle cx="20" cy="20" r="10" fill="none" stroke="'+(sil?f:"#C9D3DE")+'" stroke-width="2"/><circle cx="20" cy="20" r="7" fill="none" stroke="'+(sil?f:"#C9D3DE")+'" stroke-width="2"/><circle cx="20" cy="20" r="4" fill="none" stroke="'+(sil?f:"#C9D3DE")+'" stroke-width="2"/><path d="M30 20 Q35 26 30 32" stroke="'+(sil?f:"#C9D3DE")+'" stroke-width="2" fill="none"/>';break;
  case "bag":s='<path d="M14 12 Q20 15 26 12 L28 16 Q35 28 30 33 H10 Q5 28 12 16 Z" fill="'+(sil?f:"#C8955B")+'" '+L+'/><path d="M14 12 Q17 9 20 12 Q23 9 26 12" stroke="#D9483B" stroke-width="2" fill="none"/><path d="M13 25 l3 3 3 -3 3 3 3 -3 3 3" stroke="#D9483B" stroke-width="1.2" fill="none"/>';break;
  case "hoe":s='<path d="M10 35 L27 10" stroke="#8A5D2E" stroke-width="2.8" stroke-linecap="round"/><path d="M24 8.6 L33 13 L30.6 17.6 L22.4 11.4 Z" fill="'+(sil?f:"#9AA4AE")+'" '+L+'/>';break;
  case "rod":s='<path d="M7 35 Q20 20 31 5" stroke="#8A5D2E" stroke-width="2.4" stroke-linecap="round" fill="none"/><path d="M31 5 Q33 18 31 26" stroke="#666" stroke-width="1" fill="none"/><path d="M31 26 q0 3 -2.4 2.4" stroke="#666" stroke-width="1.4" fill="none"/><circle cx="31" cy="20" r="1.8" fill="#D9483B"/>';break;
  case "oar":s='<path d="M9 33 L24 14" stroke="#8A5D2E" stroke-width="2.8" stroke-linecap="round"/><path d="M22 16 Q22 6 30 4 Q35 5 33 11 Q29 18 22 16 Z" fill="'+(sil?f:"#C8955B")+'" '+L+'/>';break;
  case "compass":s='<circle cx="20" cy="20" r="13" fill="'+(sil?f:"#E8B931")+'" '+L+'/><circle cx="20" cy="20" r="10" fill="'+(sil?f:"#F3F1EA")+'" '+L+'/><path d="M20 11 L22.4 20 L20 29 L17.6 20 Z" fill="'+(sil?a:"#D9483B")+'"/><path d="M20 20 L22.4 20 L20 29 Z" fill="'+(sil?a:"#3A3026")+'"/>'+(/星/.test(n)&&!sil?'<path d="M29 6 l1 2 2 .3 -1.5 1.4 .4 2 -1.9 -1 -1.9 1 .4 -2 -1.5 -1.4 2 -.3z" fill="#FFE27A" '+L+' stroke-width=".8"/>':'');break;
  case "scope":s='<path d="M7 29 L27 9 L33 15 L13 35 Z" fill="'+(sil?f:"#B07A47")+'" '+L+'/><path d="M21 15 L27 21 M15 21 L21 27" stroke="'+(sil?a:"#E8B931")+'" stroke-width="2.4"/><circle cx="30" cy="12" r="2.2" fill="'+(sil?a:"#BFE0EE")+'"/>';break;
  case "gunbai":s='<path d="M20 26 V36" stroke="#3A3026" stroke-width="3" stroke-linecap="round"/><path d="M20 26 Q8 26 8 15 Q8 5 20 5 Q32 5 32 15 Q32 26 20 26 Z" fill="'+f+'" '+L+'/><circle cx="20" cy="15" r="5" fill="'+(sil?a:"#D9483B")+'"/>';break;
  case "saihai":{var Q='M22 18 Q26 6 34 8 M22 18 Q30 10 35 14 M22 18 Q31 16 33 22 M22 18 Q27 22 28 28';
    s='<path d="M10 34 L22 18" stroke="#3A3026" stroke-width="2.8" stroke-linecap="round"/><path d="'+Q+'" stroke="'+o+'" stroke-width="4.2" fill="none" stroke-linecap="round"/><path d="'+Q+'" stroke="'+(sil?f:"#F3F1EA")+'" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="22" cy="18" r="2" fill="#E8B931" '+L+'/>';break;}
  default:s='<path d="M20 6 L33 20 L20 34 L7 20 Z" fill="'+f+'" '+L+'/>';
  }
  if(sil)s='<g opacity=".55">'+s+'</g>';
  return '<svg viewBox="0 0 40 40" aria-hidden="true">'+s+'</svg>';
}
/* 格：手に入れる順に ★1〜★4 */
function p85Tier(i){return i>=16?4:i>=11?3:i>=6?2:1;}
var P85_TIER=["","ふつう","めずらしい","とても貴重","伝説"];
/* その装備がいつ手に入るか */
function p85How(P,i){return i===0?"はじめの持ち物":(i%2?"第"+((i+1)/2)+"章"+(P.ev?"の出来事を半分クリア":"の敵を半分倒す"):"第"+(i/2)+"章"+(P.ev?"をクリア":"のボスを倒す"));}
/* 次の装備まで、あと何テーマか（いまの章で数える） */
function p85Next(P,S){
  if(S.gear>=P.gear.length)return null;
  var ch=S.ch.filter(function(c){return !c.beat;})[0];if(!ch)return null;
  var half=Math.ceil(ch.need/2),left=ch.half?ch.need-ch.done:half-ch.done;
  return {i:S.gear,left:Math.max(1,left)};
}
/* 冒険の画面：次のごほうびの予告 */
function p85NextHtml(P,S){
  var n=p85Next(P,S);if(!n)return '';
  var t=p85Tier(n.i);
  return '<div class="p85-next t'+t+'"><span class="p85-ni">'+p85Item(P.gear[n.i],P,true)+'<i>？</i></span><span class="p85-nt"><small>次のごほうび（'+'★'.repeat(t)+' '+P85_TIER[t]+'）</small><b>あと '+n.left+' テーマで手に入る</b></span></div>';
}
/* 持ち物タブの装備：絵つきのカードの棚 */
function p85GearHtml(P,S){
  var nx=p85Next(P,S),h='<div class="p83-sub">装備 <small>'+S.gear+' / '+P.gear.length+'</small></div><div class="p85-shelf">';
  P.gear.forEach(function(g,i){var on=i<S.gear,t=p85Tier(i),nxt=nx&&nx.i===i;
    h+='<div class="p85-card t'+t+(on?'':' off')+(nxt?' nx':'')+'"><span class="p85-ci">'+p85Item(g,P,!on)+'</span><span class="p85-st">'+'★'.repeat(t)+'</span><b>'+(on?esc(g):(nxt?'もうすぐ':'？？？'))+'</b><small>'+(on?P85_TIER[t]:p85How(P,i))+'</small></div>';});
  return h+'</div>';
}
/* レッスンの結果：新しく手に入れた装備のカード */
function p85NewGear(P,from,to){
  var h='';for(var i=from;i<to&&i<P.gear.length;i++){var t=p85Tier(i);
    h+='<div class="p85-got t'+t+'"><span class="p85-gi">'+p85Item(P.gear[i],P,false)+'</span><span class="p85-gt"><small>新しい装備！ '+'★'.repeat(t)+' '+P85_TIER[t]+'</small><b>'+esc(P.gear[i])+'</b><em>持ち物 '+(i+1)+' / '+P.gear.length+'</em></span></div>';}
  return h;
}

/* レッスンの結果：新しい仲間のカード（全身の絵つき） */
function p85NewAlly(P,from,to){
  var h='';for(var k=from;k<to&&k<P.al.length;k++){var a=P.al[k];
    h+='<div class="p85-ally" style="--pc:'+P.color+'">'+p74AllyArt(a,"p85-aimg")+'<span class="p85-gt"><small>新しい仲間！</small><b>'+esc(a.n)+'</b><em>'+esc(a.r)+'</em><em>仲間 '+(k+1)+' / '+P.al.length+'</em></span></div>';}
  return h;
}
(function(){try{var st=document.createElement("style");st.textContent=
/* 格ごとの枠の色（★1 銅、★2 銀、★3 金、★4 虹） */
'.p85-card,.p85-got,.p85-next{--tc:#B9875A;--tb:color-mix(in srgb,#B9875A 14%,var(--card))}'+
'.t2{--tc:#8FA3B8;--tb:color-mix(in srgb,#8FA3B8 18%,var(--card))}.t3{--tc:#E0A100;--tb:color-mix(in srgb,#E0A100 16%,var(--card))}.t4{--tc:#C04FD0;--tb:color-mix(in srgb,#C04FD0 14%,var(--card))}'+
'.p85-shelf{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}'+
'.p85-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px 8px;border-radius:14px;border:2px solid var(--tc);background:var(--tb);text-align:center;min-width:0}'+
'.p85-card.t4{border-image:none;background:linear-gradient(160deg,color-mix(in srgb,#FF7A7A 16%,var(--card)),color-mix(in srgb,#7AB8FF 16%,var(--card)),color-mix(in srgb,#B97AFF 18%,var(--card)))}'+
'.p85-ci{width:58px;height:58px;border-radius:50%;background:radial-gradient(circle,#FFFFFF 0,#F3EFE6 70%);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px var(--tc)}.p85-ci svg{width:46px;height:46px}'+
'.p85-st{font-size:10.5px;color:var(--tc);font-weight:900;letter-spacing:1px}'+
'.p85-card b{font-size:12.5px;line-height:1.35;word-break:break-all}.p85-card small{font-size:10.5px;color:var(--muted);line-height:1.35}'+
'.p85-card.off{border-style:dashed;background:var(--card)}.p85-card.off .p85-ci{background:color-mix(in srgb,var(--muted) 14%,transparent);box-shadow:none}.p85-card.off b{color:var(--muted)}'+
'.p85-card.nx{border-style:solid;border-color:var(--accent)}.p85-card.nx b{color:var(--accent)}'+
'.p85-next{display:flex;align-items:center;gap:10px;margin:10px 0 0;padding:8px 12px;border-radius:14px;border:1.5px dashed var(--tc);background:var(--tb)}'+
'.p85-ni{position:relative;flex:none;width:44px;height:44px;border-radius:50%;background:color-mix(in srgb,var(--muted) 14%,transparent);display:flex;align-items:center;justify-content:center}.p85-ni svg{width:36px;height:36px}.p85-ni i{position:absolute;right:-2px;top:-4px;font-style:normal;font-weight:900;color:var(--tc);font-size:16px}'+
'.p85-nt{display:flex;flex-direction:column;min-width:0}.p85-nt small{font-size:11.5px;font-weight:800;color:var(--tc)}.p85-nt b{font-size:14.5px}'+
'.p85-got{display:flex;align-items:center;gap:12px;margin:10px 0 0;padding:10px 12px;border-radius:16px;border:2px solid var(--tc);background:var(--tb);text-align:left;animation:p85in .6s cubic-bezier(.3,1.4,.5,1) both}'+
'.p85-gi{flex:none;width:64px;height:64px;border-radius:50%;background:radial-gradient(circle,#FFFFFF 0,#F3EFE6 70%);display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 2px var(--tc),0 0 0 4px color-mix(in srgb,var(--tc) 25%,transparent)}.p85-gi svg{width:52px;height:52px}'+
'.p85-gt{display:flex;flex-direction:column;min-width:0}.p85-gt small{font-size:12px;font-weight:900;color:var(--tc)}.p85-gt b{font-size:17px}.p85-gt em{font-style:normal;font-size:12px;color:var(--muted)}'+
'@keyframes p85in{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}@media (prefers-reduced-motion:reduce){.p85-got{animation:none}}'+
/* 仲間：結果のカードと、持ち物タブの枠 */
'.p85-ally{display:flex;align-items:center;gap:12px;margin:10px 0 0;padding:8px 12px;border-radius:16px;border:2px solid var(--pc);background:color-mix(in srgb,var(--pc) 12%,var(--card));text-align:left;animation:p85in .6s cubic-bezier(.3,1.4,.5,1) both}.p85-aimg{flex:none;width:66px;height:88px;border-radius:12px;background:radial-gradient(circle at 50% 40%,#FFFFFF 0,#F3EFE6 75%)}.p85-ally .p85-gt small{color:var(--pc)}'+
'.p74-ac:not(.off){border:2px solid var(--pc,var(--accent));background:color-mix(in srgb,var(--pc,var(--accent)) 10%,var(--card))}.p74-ac:not(.off) .p74-aimg2{background:radial-gradient(circle at 50% 40%,#FFFFFF 0,#F3EFE6 75%);border-radius:12px}.p74-ac.off .p74-aimg2{filter:grayscale(1) brightness(.6);opacity:.55}'+
/* 技のカードも少し華やかに */
'.p83-sk .p74-li{border-left:4px solid var(--pc,var(--accent))}.p83-sk .p74-li:not(.off) .p74-gi{background:var(--pc,var(--accent));color:#fff}';
document.head.appendChild(st);}catch(_){}})();
