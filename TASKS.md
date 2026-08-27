# 開発タスク

## 進め方: 小さな縦切りループ

1. GitHub Issuesから1件だけ選ぶ
2. Issueの受け入れ条件を確認する
3. プレイヤーが体験できる最小変更を実装する
4. `node --check game.js` とスマホ実機で確認する
5. 5分遊び、結果と気づきをIssueに記録する
6. 問題がなければ小さいコミットを作り、Issueを閉じる

1回のタスクで、設計だけではなくゲーム内で実際に体験できる状態まで完成させます。

## 現在の小さな完成目標

親Issue: [#4 ゲーム性をさらに拡張する](https://github.com/SMRI2170/space-cleanup-station/issues/4)

- [x] [#7 ゲーム性の受け入れ条件を決める](https://github.com/SMRI2170/space-cleanup-station/issues/7)
- [ ] [#9 サルベージ契約を3択から選べるようにする](https://github.com/SMRI2170/space-cleanup-station/issues/9) ※実機確認待ち
- [ ] [#13 契約の成功・失敗・再挑戦を明確にする](https://github.com/SMRI2170/space-cleanup-station/issues/13) ※実装済み・実機確認待ち
- [ ] [#8 隕石危険イベントを1種類追加する](https://github.com/SMRI2170/space-cleanup-station/issues/8)
- [ ] [#10 被弾ペナルティと回復地点を追加する](https://github.com/SMRI2170/space-cleanup-station/issues/10)
- [ ] [#11 基地施設の選択とトレードオフを1つ追加する](https://github.com/SMRI2170/space-cleanup-station/issues/11)
- [ ] [#12 5分プレイテストとバランス調整を行う](https://github.com/SMRI2170/space-cleanup-station/issues/12)

この7件はGitHubの `Gameplay Vertical Slice` マイルストーンで管理します。

## 優先度 P0: 公開に必要

- [ ] Three.jsをCDN依存からローカルバンドルへ移行する
- [ ] Three.jsを現行版へ更新し、iPhone/Android実機で動作確認する
- [ ] 低性能スマホ向けに影、解像度、パーティクルを最適化する
- [ ] ゲーム進行を保存する仕組みを追加する
- [ ] GitHub PagesまたはCDNへ公開する

## 優先度 P1: アカウントと運用

- [ ] SupabaseまたはFirebaseでゲストプレイを追加する
- [ ] メール、Google、Appleログインを追加する
- [ ] クレジットとアップグレードをサーバー側で検証する
- [ ] セーブデータのバックアップ、削除、復旧を実装する
- [ ] プライバシーポリシーと問い合わせ先を用意する
- [ ] エラー監視と利用状況の計測を追加する

## 優先度 P1: ゲーム性の次段階

- [ ] 複数エリアとエリアごとのデブリ特性を追加する
- [ ] デイリー契約と連続ログイン報酬を追加する
- [ ] 宇宙ステーションのランク、実績、アンロック要素を追加する
- [ ] 施設を組み合わせたビルド差を追加する
- [ ] チュートリアル、ポーズ、設定画面を追加する

## 優先度 P2: ネイティブアプリ

- [ ] Capacitor 8プロジェクトを作成する
- [ ] ネイティブのスプラッシュ画面とアイコンを設定する
- [ ] 振動、通知、画面向き固定を追加する
- [ ] iOS TestFlightで実機テストする
- [ ] Google Play内部テストを行う
- [ ] App Store / Google Playへ申請する

## 完了済み

- [x] Three.jsによる3Dゲーム本体
- [x] スワイプ操作とWASD操作
- [x] 基地拡張、ドローン、自動化
- [x] レアデブリ、貨物船、FEVER
- [x] コンボ報酬、時間制契約、吸引ブースト
- [x] PWAマニフェスト、サービスワーカー、アプリアイコン
