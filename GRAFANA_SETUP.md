# Grafana Setup Guide for DevHealth

We will use the **Infinity Data Source** plugin in Grafana, which elegantly converts our local JSON API (created in Node.js) directly into graphical rows and columns!

## 1. Install & Run Grafana Locally (Windows)
1. Download Grafana for Windows: https://grafana.com/grafana/download?platform=windows
2. Extract the `zip` to a folder (e.g., `C:\grafana`).
3. Run `bin\grafana-server.exe` to start the server.
4. Visit `http://localhost:3000` (Grafana's default). Log in with `admin` / `admin`.

> *Note: Our back-end runs on port 3000 by default. If Grafana fails to start, change `PORT=3000` in your backend `.env` file to `PORT=4000` to avoid conflicts.*

## 2. Install the Infinity Plugin
1. Go to **Administration (Gear Icon)** -> **Plugins and data**.
2. Search for **"Infinity"** (developed by yesoreyeram) and click **Install**.
3. Create a new Data Source -> choose **Infinity**.
4. Set the name to "DevHealth API". 
5. Under `Base URL`, put `http://localhost:4000/api/v1` (or whatever port your Node backend runs on).
6. Click **Save & Test**.

## 3. Creating the Dashboard Panels

Go to **Dashboards** -> **New Dashboard** -> **Add Visualization**. Select **Infinity** as the data source.

### Panel 1: Commit Frequency (Time Series)
*   **Data Source Settings**:
    *   **Type**: JSON
    *   **Method**: GET
    *   **URL URL**: `/metrics?metric_name=commit_frequency&project_id=devhealth_core`
*   **Parsing Options** (Infinity plugin mapping section under "Parsing options & Result fields"):
    *   Set `Rows/Root` to `.`.
    *   Add Column: `timestamp` | Type: `DateTime` | Format: `RFC3339`
    *   Add Column: `value` | Type: `Number`
*   **Visualization settings (right sidebar)**: Choose "Time series" chart. Connect `timestamp` to X-axis and `value` to Y-axis.

### Panel 2: Build Success Rate (Gauge)
*   **Data Source Settings**:
    *   **Type**: JSON
    *   **URL**: `/metrics?metric_name=build_success_rate&project_id=devhealth_core`
*   **Parsing Options**:
    *   Root: `.`
    *   Column: `value` | Type: `Number`
*   **Visualization settings**: Choose **"Gauge"**. 
    *   Under 'Standard options' set **Unit** to `% (0-100)`. 
    *   Set **Calculation** rule (under Data tab) to "Last *" (to show the most recent success rate).

### Panel 3: Issues Opened vs Closed (Bar Chart)
*   **Data Source Settings**:
    *   **URL**: `/metrics?metric_name=issues_opened,issues_closed&project_id=devhealth_core`
*   **Parsing Options**:
    *   Root: `.`
    *   Column: `timestamp` | Type: `DateTime`
    *   Column: `value` | Type: `Number`
    *   Column: `metric_name` | Type: `String`
*   **Transformations tab**:
    *   Click **Transform data**. Choose **"Partition by values"** or **"Grouping to matrix"**. Group by `metric_name`. This splits the single `value` column into an `issues_opened` line and an `issues_closed` line.
*   **Visualization settings**: Choose **"Bar chart"** or **"Time series (Stacked)"**.
