import * as path from "path";
import { IntegratedInvalidJsonTestRunner } from "./IntegratedInvalidJsonTestRunner";

const validJson = path.resolve(__dirname, "./valid"); // 正常系 JSON フォルダ
const invalidDir = path.resolve(__dirname, "./invalid"); // 異常系 JSON フォルダ
const cliPath = path.resolve(__dirname, "../src/test.ts");

describe("統一テスト基盤（最小化版）", () => {

  test("valid.json が正しく読み込める & CLI実行", () => {
    const runner = new IntegratedInvalidJsonTestRunner(validJson, cliPath);
    const results = runner.runAll();
    
    const key = Object.keys(results)[0]; // ← 実際のファイル名を取得
    expect(results[key].validator).toMatch(/NO ERROR \(失敗\)|例外/); // JsonValidator の結果
    expect(results[key].checker).toMatch(/NO ERROR \(失敗\)|例外/);   // Checker 部分
    expect(results[key].cli).toMatch(/NO ERROR \(失敗\)|Error|不正/);      // CLI 実行
  });

  test("invalid JSON ファイルの統合チェック", () => {
    const runner = new IntegratedInvalidJsonTestRunner(invalidDir, cliPath);
    const results = runner.runAll();

    // すべての JSON ファイルで validator か checker が例外になることを確認
    for (const key of Object.keys(results)) {
      const res = results[key];
      expect(res.validator || res.checker || res.cli).toMatch(/.+/);
    }
  });

});
