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
