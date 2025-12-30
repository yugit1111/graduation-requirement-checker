# graduation-requirement-checker

大学の卒業要件を判定するプログラムです。
履修データを入力すると、卒業可能かどうかを判定します。

## 使い方
1. リポジトリをクローン
2. 必要なライブラリをインストール
3. プログラムを実行

# コンパイル
1. tsc
2. tsc dist/tests/checkInvalidJson.ts(一つだけコンパイルさせたいとき)
3. tsc --watch(自動コンパイル)
4. tsc --watch --project tsconfig.browser.json(ブラウザ用)

# テキスト出力（CLI）
1. node dist/test.js data.json --text
2. npx ts-node src/test.ts data.json --text(tsc不要)

# JSON 出力
1. node dist/test.js data.json --json
2. npx ts-node src/test.ts data.json --json(tsc不要)

# package.json に書いてある “test” スクリプトを実行するコマンド
npm test

## VScode
1. 編集する
2. git add .
3. git commit -m "変更内容"
4. git push

## git commit
graduation-requirement-checkerディレクトリ上で行うこと

# Node用ビルド
npm run build:node

# ブラウザ用ビルド
npm run build:browser

# 両方まとめてビルド
npm run build

# Node用テスト実行
npm test

## ビルド手順(↑まとめたので，必要ない)
1. tsc --project tsconfig.json --watch（ブラウザ用）
2. tsc --project tsconfig.node.json --watch(Node用)

Graduation Requirement Checker

大学の卒業要件（単位数・区分）を
JSON 入力 → 自動判定 → 結果出力 するための TypeScript 製ツールです。

📌 概要

このプロジェクトは以下を目的としています：

卒業要件（分野別必要単位数）の定義

履修科目データの読み込み

要件を満たしているかの自動判定

不正な JSON 入力の検出

CLI・テスト両方からの実行

📁 ディレクトリ構成
grad-checker/
├─ src/
│  ├─ logic/
│  │  ├─ Requirement.ts
│  │  ├─ Course.ts
│  │  └─ GraduationChecker.ts
│  ├─ JsonValidator.ts
│  └─ test.ts                # CLI エントリ
│
├─ tests/
│  ├─ valid/                 # 正常系 JSON
│  ├─ invalid/               # 異常系 JSON
│  ├─ IntegratedInvalidJsonTestRunner.ts
│  └─ graduationUnified.test.ts
│
├─ package.json
└─ README.md

🧠 処理の流れ

JSON 読み込み

形式チェック（JsonValidator）

卒業要件計算（GraduationChecker）

結果出力（CLI / テスト）

📄 JSON 形式（例）
{
  "requirements": [
    { "category": "共通教育", "requiredCredits": 30 }
  ],
  "courses": [
    { "name": "情報基礎", "category": "共通教育", "credits": 2 }
  ]
}

📤 出力形式
成功時
{
  "status": "ok",
  "data": [
    {
      "category": "共通教育",
      "earned": 2,
      "required": 30,
      "passed": false
    }
  ]
}

エラー時
{
  "status": "error",
  "reason": "requirements の要素が不正"
}

🧪 テストの実行
npm test


実行内容：

正常 JSON の判定

異常 JSON の検出

CLI 実行結果の検証

✨ 特徴

例外ではなく 構造化されたエラー を返す設計

テストで仕様を保証

CLI / ライブラリ両対応

拡張しやすい責務分離設計

🚀 今後の拡張案

単位カテゴリの階層化

JSON Schema 対応

Web UI / REST API 化

成績CSVインポート対応
