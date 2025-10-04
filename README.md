# TypeUp

AI機能付きタイピング練習アプリケーション

## 概要

- OpenAI APIを活用した日本語タイピング練習アプリケーション
- AIが生成した自然な日本語文を使用してタイピング練習を行い、苦手なキーの分析と改善をサポート

## 主な機能

### 🎯 タイピング練習
- 日本語文のタイピング練習
- リアルタイムでの入力速度・正確性測定
- ローマ字表示による入力ガイド
- 視覚的なフィードバック（正解・不正解の色分け）
- 入力は英数字のみを受け付け、誤入力は修正するまで先に進めない

### 🤖 AI機能
- OpenAI APIを使用した自然な日本語文の自動生成
- ミスしたキーを分析し、苦手な文字を含む練習文を生成
- デフォルトの練習文も用意（APIキー未設定時）
- 生成された文にはふりがなとローマ字情報を同梱し、クライアント側で辞書チェックを実施

### 📊 統計・分析
- 入力時間の計測
- 入力文字数・ミス文字数の記録
- 正確率の計算
- WPM（Words Per Minute）の算出
- 苦手キーの分析と表示

### 🎨 デザイン
- ターミナル風のモダンなUI
- ダークテーマ対応
- レスポンシブデザイン
- アニメーション効果

## 技術仕様

### 使用技術
- **フロントエンド**: HTML5, CSS3, JavaScript (ES6+)
- **AI**: OpenAI GPT-4o-mini API
- **フォント**: JetBrains Mono, Fira Code

### 対応ブラウザ
- Safari (最新バージョン)
- Google Chrome (最新バージョン)

### ファイル構成
```
/
├── index.html
├── app.js
├── styles.css
└── README.md
```

## セットアップ
### 1. cloneする
```
git clone git@github.com:supergod100/TypeUp.git
```
### 2. ローカルサーバーの起動
pythonがいいと思う
```bash
python3 -m http.server 8000
```
### 3. ブラウザでアクセス
サーバー起動後、以下のURLでアクセス：
```
http://localhost:8000
```

### 4. OpenAI APIキーの設定
1. [OpenAI Platform](https://platform.openai.com/)でAPIキーを取得
2. アプリケーション内の「OpenAI API key」フィールドにキーを入力
3. 「save key」ボタンをクリック

### 統計の確認
- **input time**: 入力にかかった時間
- **input characters**: 入力した文字数
- **mistake characters**: ミスした文字数
- **accuracy**: 正確率（%）
- **WPM**: 1分間あたりの単語数
