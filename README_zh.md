# 強化學習網格世界

[繁體中文](README_zh.md) | [English](README.md)

本程式庫包含了我在 **國立中興大學(NCHU)** 碩士班 **深度強化學習 (Deep Reinforcement Learning)** 課程的第一次作業（HW1）實作。此專案實現並視覺化了網格世界環境中的基礎強化學習演算法，使用者可以互動比較不同方法的表現，包括策略評估、策略改進和價值迭代。

![網格世界界面截圖](https://i.imgur.com/CSFh8xu.png)

## 功能特色

- 創建可訂大小的網格世界（5-9）
- 放置起始位置（綠色）、結束位置（紅色）和障礙物（灰色）
- 執行並視覺化三種強化學習演算法：
  - 隨機策略評估
  - 策略改進
  - 價值迭代
- 具有即時回饋的互動式界面
- 策略（箭頭）和狀態值的視覺化表示

## 安裝說明

### 方法一：標準安裝

1. 安裝所需依賴：

```bash
pip install -r requirements.txt
```

2. 執行 Flask 應用程式：

```bash
python app.py
```

3. 打開瀏覽器並訪問 http://localhost:5000

### 方法二：Docker 安裝

1. 確保已安裝 Docker 和 Docker Compose

2. 構建並運行容器：

```bash
docker-compose up
```

3. 打開瀏覽器並訪問 http://localhost:5000

## 使用方法

1. 選擇網格大小（5-9）並點擊「創建網格」
2. 點擊一個單元格設置起始位置（綠色）
3. 點擊另一個單元格設置結束位置（紅色）
4. 點擊其他單元格添加障礙物（灰色）
5. 選擇要執行的演算法：
   - 「隨機策略」生成並評估隨機策略
   - 「改進策略」優化當前策略
   - 「價值迭代」直接計算最佳策略

## 強化學習演算法

### 隨機策略評估

此演算法評估隨機生成策略的效果：

- 生成隨機初始策略（每個單元格的上、下、左或右動作）
- 計算此策略下每個狀態的預期回報（價值）
- 顯示動作方向（箭頭）及其對應的價值數字

### 策略改進

此演算法優化現有策略：

- 使用當前策略評估結果作為基礎
- 對於每個單元格，確定能最大化預期回報的動作
- 根據這些最佳動作更新策略
- 顯示改進的策略，包括更新的箭頭和價值

### 價值迭代

此演算法直接計算最佳策略：

- 不需要初始策略
- 使用貝爾曼最優方程計算每個狀態的最佳價值
- 從收斂的價值中提取最佳策略
- 顯示最佳策略和狀態價值

## 演算法比較

| 特性 | 隨機策略 | 策略改進 | 價值迭代 |
|---------|------------------|-------------------|-----------------|
| **目的** | 評估現有策略 | 基於評估改進策略 | 直接找到最佳策略 |
| **輸入** | 隨機策略 | 已評估的策略 | 不需要初始策略 |
| **輸出** | 狀態價值 | 改進的策略和價值 | 最佳策略和價值 |
| **過程** | 單次評估通過 | 可能需要多次改進迭代 | 收斂至最佳解 |

## 實現細節

- 後端：Flask 網頁框架
- 演算法使用 Python 和 NumPy 實現
- 獎勵結構：
  - 目標狀態：+1.0
  - 步驟成本：-0.04
- 折扣因子（gamma）：0.9

## 參考資料

- Sutton, R. S., & Barto, A. G. (2018). 強化學習：導論. MIT press.
