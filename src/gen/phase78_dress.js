/* ===== Phase78：服装の見直し =====
   ・結婚した女性（エレチェクを巻く人）は、巻きスカート（ベルデムチ）もつける。指定がない絵にも自動でつける。
   ・セメテイの少年時代（羊飼い）は、バンダナではなくキルギスの男性の白いカルパク。 */
if(typeof p74Person==="function"){
  var _p78Person=p74Person;
  p74Person=function(o){if(o&&o.head==="elechek"&&o.beld===undefined){var c=o.body&&o.body.c||"#5E6E7E",d="#2B2233";try{d=p74Shade(c,-.45);}catch(_){}o=JSON.parse(JSON.stringify(o));o.beld=d;}return _p78Person.call(this,o);};
}
(function(){P74_PATHS.forEach(function(P){if(P.id==="semetey"&&P.st&&P.st[0]){P.st[0].head="kalpak";delete P.st[0].headc;}});})();
