/* ===== PHASE46: A2 不足分の補強データ（瞬間作文 7ユニット・基礎語）を実行時に追加 =====
   - 造格／生格／動詞の体／比較・好み／複文／再帰動詞・否定／日付・序数 の7ユニット（各15文）
   - TБУ(A2)で必須なのに単語リストに無かった基礎語（язы́к, страна́, кото́рый, са́мый, стать …）
   - すべて新規作成の draft。ネイティブ確認前の扱いは既存データと同じ。 */
var P46_COMPOSE=__P46_COMPOSE__;
var P46_VOCAB=__P46_VOCAB__;
(function(){
  var haveC={}; COMPOSE.forEach(function(c){haveC[c.id]=1;});
  P46_COMPOSE.forEach(function(c){ if(!haveC[c.id]) COMPOSE.push(c); });
  var haveV={}; VOCAB.forEach(function(w){haveV[w.id]=1;});
  P46_VOCAB.forEach(function(w){ if(!haveV[w.id]) VOCAB.push(w); });
  /* 文法別練習：空だった2グループを実データで埋め、未登録の文法ポイントをグループとして追加 */
  function idsWhere(f){return COMPOSE.filter(f).map(function(c){return c.id;});}
  GROUPS.forEach(function(g){
    if(g.id==="accusative_direction"&&!(g.composeIds||[]).length){
      g.composeIds=idsWhere(function(c){return /(^|\s)(в|во|на)\s/i.test(c.ru)&&(c.grammarPoint==="対格"||c.grammarPoint==="移動動詞・方向");});
    }
    if(g.id==="prepositional_location"&&!(g.composeIds||[]).length){
      g.composeIds=idsWhere(function(c){return c.grammarPoint==="場所 в/на + 前置格"||c.grammarPoint==="前置格";});
    }
    g.count=(g.composeIds||[]).length;
  });
  var P46_GROUP_DEF=[
    ["instrumental","造格 с＋造格・〜として","造格"],
    ["genitive","生格 〜の・нет・数量","生格"],
    ["aspect","動詞の体 完了体／不完了体","動詞の体"],
    ["comparison","比較・好み нравиться／лучше／самый","比較・好み"],
    ["complex","複文 что／который／чтобы／если","複文・接続詞"],
    ["reflexive_neg","再帰動詞・否定・должен・свой","再帰動詞・否定"],
    ["dates","日付・序数・時刻","日付・序数"],
    ["present","現在形の動詞","現在形"],
    ["future","未来・予定","未来・予定"]
  ];
  var haveG={}; GROUPS.forEach(function(g){haveG[g.id]=1;});
  P46_GROUP_DEF.forEach(function(d){
    if(haveG[d[0]])return;
    var ids=idsWhere(function(c){return c.grammarPoint===d[2];});
    if(ids.length)GROUPS.push({id:d[0],title:d[1],count:ids.length,composeIds:ids});
  });
})();
