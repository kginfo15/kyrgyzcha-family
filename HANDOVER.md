# 引き継ぎメモ（ロシア語・キルギス語 学習アプリ）

新しいプロジェクト／セッションでこの作業を続けるためのまとめです。
新しいセッションでは、最初に「HANDOVER.md を読んで続きをやって」と伝えてください。

## 完成品

| アプリ | ファイル | 公開URL（非公開・本人のみ） |
|---|---|---|
| ロシア語 | `russian/index.html` | https://claude.ai/artifact/GjX2nbtvmZfi8pfw3xViVE |
| キルギス語 | `kyrgyz/index.html` | https://claude.ai/artifact/XzfVofuXDE8oBdci9p1Bc1 |

- どちらも1ファイルで完結するHTMLです。ホーム画面用アイコンは `icons/` にあります。
- 公開ページは、ページ側の機能として `db`（クラウド保存）、`user`、`downloads`、`sample`（AI会話）を使っています。
- 同じURLを更新するには、別の会話から Artifact を publish するときに上記URLを `url` に指定します（先に read が必要です）。
- `index.html`（ルート）は元のキルギス語 v3 アプリで、キルギス語データの取り出し元です。消さないでください。

## ビルド方法

`russian/index.html` と `kyrgyz/index.html` は手で編集せず、`src/` から生成します。

```bash
# 1) ロシア語：元のアプリ + 追加レイヤー → russian/index.html
python3 -I src/gen/build.py src/work/orig.html russian/index.html

# 2) キルギス語：ロシア語版の器 + キルギス語データ → kyrgyz/index.html
python3 -I src/kg/build_kg.py russian/index.html index.html kyrgyz/index.html
```

必ず 1 → 2 の順に実行します（キルギス語版はロシア語版を器として使います）。

## src/ の中身

| 場所 | 内容 |
|---|---|
| `src/work/orig.html` | 最初にもらった作りかけのロシア語アプリ（ビルドの土台） |
| `src/gen/build.py` | ロシア語版のビルド。下の phase ファイルを順に差し込みます |
| `src/gen/phase46_data.js` 〜 `phase58.js` | 機能レイヤー。後ろのものほど新しく、前の関数を上書き・ラップします |
| `src/gen/*.py` | ロシア語の単語・作文データの追加と翻字 |
| `src/ru/` | ロシア語の例文（`examples.json`）と文ごとのやさしい解説（`gEasy.json`）と元テキスト |
| `src/kg/build_kg.py` | キルギス語版のビルド（データ差し替え、赤×金の配色、国旗、保存キー `kyrgyzApp_v4_`） |
| `src/kg/content.js` | キルギス語の文法ノートなどの内容 |
| `src/kg/enrich/`, `src/kg/cenrich/`, `src/kg/bd/`, `src/kg/src/` | キルギス語の単語解説・例文・文の分解データ |
| `src/tests/` | Playwright の確認スクリプト（全ボタン巡回、画面の収まり、到達テスト） |

### phase ファイルの役割

| ファイル | 内容 |
|---|---|
| phase46 | データ追加と基本UI |
| phase47 | シンプルなホーム、テーマ別単語、覚えたリスト、設定、オンボーディング |
| phase48 | イラスト、やめる確認、記録画面、音声 |
| phase49 | 評価ボタン、出題範囲、速度 |
| phase50 | クラウド保存、バックアップ |
| phase51 | ヘッダー統一、歯車 |
| phase52 | 4択クイズ、復習間隔（1・3・7・14・30・60・120日） |
| phase53 | 穴埋め、お祝い、連続記録の保護、予測 |
| phase55 | 間違いノート、AI会話、発音チェック、読み物 |
| phase56 | 重複モードの整理、レベル順チャレンジ |
| phase57 | その他の練習の戻るボタン |
| phase58 | 画面切替時に先頭へ、集中表示、到達テスト（45問） |
| phase59 | 単語の絵（`src/ru/pics*.txt` の「ID 絵文字」表）、5問ごとの中断画面の廃止 |
| phase61 | 録音済み音声の再生（キルギス語）。`audio/ky-index.json` と `audio/ky-*.mp3` があれば端末の読み上げより優先 |
| phase62 | ホーム画面の形（4種）と色（8種）の選択、クイズの「次へ」を画面下に固定 |
| phase63 | 見た目の作り直し（影・グラデーション・絵アイコンをやめ、平らな面と細い線に）、色テーマ5種、ホームの絵の表示切替 |
| phase64 | 右上のボタンから開く「見た目の変更」シート、ホームを1画面に収めてスクロールを止める処理 |
| phase65 | まとめて練習・作文カードを1画面に収める（ページはスクロールせず、長いカードだけ内側でスクロール） |
| phase66 | 単語の絵をイラスト画像で表示（`pics/atlas.webp` を読み込めないときは絵文字に戻る） |
| phase70 | デザイン切替（シンプル／ポップ／クール／イラスト）、今週の帯、道のり、バッジ、週のまとめ |
| phase71 | 一歩レッスン（「次の一歩」）：テーマを約6語ずつのレッスンに分け、新しい言葉→絵で確認→文法メモ→二段階の穴埋め（意味→形）＋解説→前のレッスンのおさらい。道のりは路線図の見た目。記録は settings.p71 |
| phase72_guide | アプリ内の文法解説書の本文 P72_GUIDE（18章・オリジナル文章と例文） |
| phase72 | 問題文の単語タップで意味（#p72pop）、答えたあとの解説を作り直し（形の変化・なぜこの形・語尾の作り方・文の言葉・どこで習う）、文法解説書の画面（#p72g）、問題のお気に入り（settings.p71.fav）とお気に入りだけの練習。p71Noun に複数形を追加 |
| phase73_forms | 単語帳の語から変化形（格・複数・活用・命令形・短語尾）を規則で作り、例文の単語タップ辞書を引けるようにする（p73Gen、不規則語根表 P73_ROOT） |
| phase73_extra | 規則で作れない例文中の形 P73_EX（「表層形\|見出し語\|意味\|形」）。単語帳の例文・作文の未登録語は 0 件（新しい例文を足したらここに追加） |
| phase73_dict | 辞書：既存の単語検索を置きかえ、ロシア語（変化形も）・ローマ字・英語・日本語・ひらがな・カタカナであいまい検索、関連語。英語訳と読みは src/gen/dict/d*.txt（「id\|英語\|ひらがな」、build.py が埋め込む）。単語を足したら d*.txt にも行を足す。単語練習のしおりを「☆お気に入り」ボタンに |
| phase73_dict（追記） | 辞書の単語詳細で発音を自動再生＋スピーカーボタン。似た意味の語の使い分け src/gen/dict/use.txt（「語 語|解説」、@a 不完了体 完了体、@g 男性形 女性形、@f 形の変化）を辞書と単語詳細に表示 |
| phase74_art | 冒険の絵（主人公の部品 P74_HAND/OFF/HEAD・p74Body・p74Person、動物の仲間 p74Animal、テーマごとのモンスター p74Monster、ボス8体 p74Boss）。すべてオリジナル SVG |
| phase74_paths | 呼び名 P74_NAME（"冒険"、ここを変えれば全体が変わる）と5つの道 P74_PATHS（9段階の姿・称号、装備17・技8・仲間5） |
| phase74_hist | 物語・歴史の道（hist:1）：マナス、セメテイ、クルマンジャン・ダトカ、トクトグル。各道に story[9]（場面の絵 fig・解説 x・例文 ex[ロシア語,日本語]）と about（全クリア後の解説）。場面だけの人物 P74_NPC、例文の固有名詞や自動で見つからない形 P74_NAMES（タップで意味）。人物を足すときは同じ形で P74_PATHS に push。事実は資料で確かめられることだけ、叙事詩は「物語では」と書く。架空の仲間・モンスターはそう明記 |
| phase74_quest | 冒険モード：settings.p74 {mode:"story"/"plain", path}。進み具合はレッスン記録から計算（テーマ＝敵、レッスン1つ＝1ダメージ、8章ごとにボス、ボス撃破数＝姿の段階）。道を変えても進み具合はそのまま。ストーリーなし＝従来の路線図 。hist の道は「物語」「例文」タブ、ボスを倒すとレッスン結果に新しい場面と解説（p74SceneHtml・p74StoryTab・p74ExTab・p74StoryHint）|
| phase60 | クイズの出し方（ミックス／外国語→日本語／日本語→外国語）、記録画面の簡素化 |

新しい機能は `src/gen/phase59.js` のように新しいファイルを作り、`build.py` の phase を連結している行に追加するのが安全です。

## 作り方の約束

- クリックは `data-act` / `data-val` 属性と、capture 段階の `document.addEventListener("click", …, true)` で処理しています。
- 画面は `ui.bnav`（home / wordbook / stats / settings）、`ui.learnOpen`、`ui.view` で切り替え、`render()` で描き直します。
- 学習記録は端末の localStorage と、クラウド（`data/users/<uid>`）の両方に保存します。
- 確認スクリプトは `node src/tests/crawl.js <htmlの絶対パス>` のように実行します（Playwright が必要です）。

## 到達テスト（phase58）

| 分野 | 問題数 | 内容 |
|---|---|---|
| 語彙 | 20 | 全テーマから偏りなく。意味を選ぶ／日本語から選ぶ |
| 文法 | 15 | 実際の文の空欄に正しい格・活用形を選ぶ |
| 読解・聞き取り | 10 | 文を読む、または聞いて意味を選ぶ |

合格は全体75%以上かつ各分野60%以上です。

## 残っている課題

- **本物の音声**：今はブラウザの読み上げです（キルギス語はトルコ語の声で代用しています）。高品質な音声を作るには、クラウド環境の許可ドメインに `huggingface.co` を追加する必要があります。ユーザーの判断で後回しになっています。
- **文法問題**：文単体では別の形も成り立つ問題が少しあります。日本語訳で答えが1つに決まるようにしています。
- **測れない力**：到達テストでは話す・書く力は測れません。AI会話で補う方針です。

## AI連携の案（未実装・メモのみ）

音声や解説をAIから取ってくる方法の整理です。まだ実装していません。

### 解説をAIから取る（すぐ実装できる）

- 公開ページはすでに `sample`（ページからClaudeに質問する機能）を使っています。AI会話と読み物がこれで動いています。
- 同じ仕組みで、次の機能を足せます。
  - 単語カードに「AIに聞く」ボタン：その単語の使い分け・例文・似た単語との違いを、その場で生成する。
  - 間違えた問題に「なぜ違う？」ボタン：選んだ答えと正解の違いを説明する。
  - 文法ノートに「例文をもっと」ボタン。
- 注意点：回答に数秒かかる、オフラインでは使えない、AIの説明は間違うことがあるので「AIの説明」と明示する。結果は `db` に保存すれば2回目からは即表示できる。

### 音声をAIから取る（ページからは直接できない）

- `sample` は文章だけを返します。音声は作れません。
- 公開ページは外部サービス（音声合成API）へ直接つなげません。そのため「再生ボタンを押すたびにAIが読み上げる」形は、今の公開方法ではできません。
- 現実的な方法は「事前に音声ファイルを作ってアプリに持たせる」です。
  1. ビルド時に、単語と例文の音声を音声合成で作る（Hugging Face の音声モデル、または有料の音声API）。
  2. できた音声を公開ページの assets に置き、単語IDで再生する。なければ今の端末読み上げに戻す。
- 必要なもの：クラウド環境の許可ドメインに `huggingface.co`（または使うAPIのホスト）を追加。有料APIならAPIキー。
- 量の目安：ロシア語は単語1587＋例文約1000＋作文505で、合計3000件ほど。
- 独立したWebアプリに作り直す場合は、自前のサーバー経由で音声APIをその場で呼ぶこともできます。

## キルギス語の追加語・絵・録音音声

- **追加語**：`src/kg/add/*.txt` に「A2到達に足りない語」を足しています（約300語）。書式は `## レベル カテゴリ` の見出しと、`単語|意味|品詞|例文|例文の訳|解説` の行です。読みがなは `src/kg/kana.py` が自動で作ります。
- **絵**：`src/kg/pics/auto.json`（ロシア語の絵の表と意味が一致した語）と `src/kg/pics/k*.txt`（手で付けた「ID 絵文字」、こちらが優先）。ロシア語は `src/ru/pics*.txt`。
- **録音音声**：`kyrgyz/audio/` に置いています。`ky-index.json` が「文 → [ファイル名, 開始位置, 長さ]」の表で、`ky-w0.mp3` などは短い音声をつなげたファイルです。
- **音声モデル**：`kyrgyz-ai/TTS_small`（MMS-TTS をキルギス語話者1人の録音で調整したモデル）。元の `facebook/mms-tts-kir` は「ж」の音が約3分の1で欠けるので使いません（音声認識で計測：ж の認識 30/48 → 47/48）。
- **品質チェック**：`facebook/mms-1b-all`（kir アダプタ）で音声認識にかけます。単語は最大4候補を作り、一番正しく認識されたものを採用します。文は1回で生成します。
- **作り直し方**（約3600件で、単語が約1.5時間、文が約45分）：
  1. 環境の許可ホスト：`huggingface.co`、`us.aws.cdn.hf.co`（環境「Russian_A2」には追加済み）。
  2. `pip install torch transformers scipy`。`https://huggingface.co/<モデル名>/resolve/main/<ファイル>` から、音声モデル（config.json, vocab.json, tokenizer_config.json, special_tokens_map.json, added_tokens.json, model.safetensors）と認識モデル（config.json, preprocessor_config.json, tokenizer_config.json, vocab.json, special_tokens_map.json, adapter.kir.safetensors, model.safetensors 約3.9GB）をそれぞれのフォルダに保存。
  3. アプリから単語・例文・作文の一覧を `{"w":[],"e":[],"c":[]}` のJSONに書き出す。
  4. `python src/kg/tts/gen_audio.py <音声モデル> <認識モデル> <一覧.json> <出力先> w` と、同じく最後を `ec` にしたものを実行。
  5. できた `ky-index-w.json` と `ky-index-ec.json` を1つの `ky-index.json` にまとめ、MP3と一緒に `kyrgyz/audio/` に置く。
- **公開**：Artifact を publish するとき、`files` で `audio/ky-index.json` と `audio/ky-*.mp3` を一緒に送ります。
- **ライセンス**：音声モデルは CC BY-NC 4.0（非商用）です。アプリを販売する場合は、商用利用できる音声に差し替える必要があります。

## 単語の絵（イラスト画像）

- **素材**：Microsoft Fluent Emoji の 3D イラスト（MIT License, © Microsoft Corporation）。npm の `@lobehub/fluent-emoji-3d` に WebP で入っています。
- **仕組み**：単語ごとの絵は今までどおり「ID 絵文字」の表（`src/ru/pics*.txt`、`src/kg/pics/`）で指定します。`src/pics/build_atlas.py` が、使われている絵を1枚の画像シート（`russian/pics/atlas.webp`、`kyrgyz/pics/atlas.webp`）にまとめ、位置の表（`src/pics/atlas-ru.json`、`atlas-ky.json`）を作ります。アプリのビルドがこの表を取り込みます。
- **絵を足した・変えたとき**：
  1. `npm i @lobehub/fluent-emoji-3d`、`pip install pillow regex`
  2. `python src/pics/build_atlas.py node_modules/@lobehub/fluent-emoji-3d/assets russian/pics/atlas.webp src/pics/atlas-ru.json src/ru/pics*.txt`
  3. `python src/pics/build_atlas.py <同じassets> kyrgyz/pics/atlas.webp src/pics/atlas-ky.json src/kg/pics/auto.json src/kg/pics/k*.txt`
  4. アプリをビルドし直す。
- **公開**：publish のとき `files` で `pics/atlas.webp` を一緒に送ります。
