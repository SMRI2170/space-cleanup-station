# Space Cleanup Station

宇宙ステーション周辺のデブリを回収し、基地を拡張していくThree.js製の3Dゲームです。

## Features

- PC: WASD / 矢印キーで移動
- Mobile: 画面スワイプで移動
- デブリ自動吸引と回収ボックスへの納品
- コンボ納品ボーナス
- 時間制サルベージ契約
- 吸引ブースト
- 基地設備、ドローン、FEVERモード
- PWA対応

## Run locally

ブラウザのセキュリティ制限を避けるため、ローカルHTTPサーバー経由で起動します。

```bash
python3 -m http.server 8000
```

その後、`http://localhost:8000` を開きます。

Three.jsは現在CDNから読み込んでいるため、起動時にインターネット接続が必要です。

## Project files

- `index.html`: UI、PWA設定、スマホ向けレイアウト
- `game.js`: Three.jsシーン、ゲームループ、ゲームシステム
- `manifest.webmanifest`: ホーム画面追加用マニフェスト
- `sw.js`: PWAキャッシュ設定
- `icon.svg`: アプリアイコン
- `TASKS.md`: 開発タスクと優先順位
