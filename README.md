# 今日のテレビ番組表アプリ

ブラウザで指定日の番組表を確認できるシンプルなWebアプリです。

## 機能

- 今日の日付を初期表示（任意の日付に切り替え可能）
- テレビ番組表をテーブルで表示
- チャンネルごとの絞り込み
- 「番組を再取得」で最新再読み込み
- API取得に失敗した場合はサンプル番組を表示（何も表示されない状態を回避）

## 起動方法

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。


## スクリーンショット取得（検証用）

Playwright の Chromium が環境によってクラッシュすることがあるため、
本リポジトリでは Firefox での撮影スクリプトを用意しています。

```bash
python3 scripts/capture_screenshot.py
```

> 事前に `python3 -m http.server 8000` でローカルサーバーを起動してください。


## Python依存パッケージのインストール

`scripts/capture_screenshot.py` をローカル実行するには Playwright Python パッケージが必要です。

```bash
python3 -m pip install -r requirements.txt
```

必要に応じてブラウザ本体もインストールしてください。

```bash
python3 -m playwright install firefox
```
