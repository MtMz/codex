# us-debt-clock-local

`https://www.usdebtclock.org` のUIコンセプト（高密度メトリクス表示、LED風カウンター、リアルタイム更新）を参考にしたローカル版です。

## 起動

```bash
cd /Users/matsumotomizuki/Documents/New\ project/us-debt-clock-local
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

## 仕様

- 100ms ごとに全指標を再計算
- メイン3指標: 国債、GDP、Debt/GDP
- 下段20指標: 人口、1人あたり負担、財政収支、社会保障、主要比率など
- 画面サイズに応じて 5列/3列/2列にレスポンシブ対応

## 値の調整

初期値と増加速度は `app.js` の `liveSeed` を編集すると調整できます。

