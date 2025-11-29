from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
from pathlib import Path
import json
from datetime import datetime
import warnings

warnings.filterwarnings("ignore")

# Load data
DATA_DIR = Path("data/result")
CLEANED_DIR = Path("data/cleaned")
JSON_EXPORT_DIR = Path("data/api_exports")

# Load clustering results
clustering_results = pd.read_csv(DATA_DIR / "clustering_results.csv")
cluster_profiles = pd.read_csv(DATA_DIR / "cluster_profiles.csv")
cluster_centroids = pd.read_csv(DATA_DIR / "cluster_centroids.csv")

# Prepare enriched data with cluster labels
cluster_labels_map = {
    0: "Low Expenditure",
    1: "Balanced Expenditure",
    2: "High Expenditure",
}
enriched_data = clustering_results.copy()
enriched_data["Cluster_Label"] = enriched_data["Cluster"].map(cluster_labels_map)

# Load JSON exports
try:
    with open(JSON_EXPORT_DIR / "all_clusters.json", "r", encoding="utf-8") as f:
        all_clusters_json = json.load(f)
except FileNotFoundError:
    all_clusters_json = {"metadata": {}, "data": []}

try:
    with open(JSON_EXPORT_DIR / "cluster_details.json", "r", encoding="utf-8") as f:
        cluster_details_json = json.load(f)
except FileNotFoundError:
    cluster_details_json = {"metadata": {}, "clusters": []}

try:
    with open(JSON_EXPORT_DIR / "predictions_full.json", "r", encoding="utf-8") as f:
        predictions_json = json.load(f)
except FileNotFoundError:
    predictions_json = {"metadata": {}, "predictions": []}

try:
    with open(JSON_EXPORT_DIR / "regional_analysis.json", "r", encoding="utf-8") as f:
        regional_json = json.load(f)
except FileNotFoundError:
    regional_json = {"metadata": {}, "regions": []}

try:
    with open(JSON_EXPORT_DIR / "expenditure_trends.json", "r", encoding="utf-8") as f:
        trends_json = json.load(f)
except FileNotFoundError:
    trends_json = {"metadata": {}, "trends": []}

try:
    with open(JSON_EXPORT_DIR / "api_metadata.json", "r", encoding="utf-8") as f:
        api_metadata = json.load(f)
except FileNotFoundError:
    api_metadata = {"api_version": "1.0.0", "data_summary": {}}

# Generate summary statistics
summary_stats = {
    "overview": {
        "total_kabupaten": int(enriched_data["Kabupaten_Kota"].nunique()),
        "total_clusters": int(enriched_data["Cluster"].nunique()),
        "years_covered": sorted(enriched_data["Tahun"].unique().tolist()),
        "total_data_points": int(len(enriched_data)),
    },
    "cluster_distribution": enriched_data.groupby("Cluster")["Kabupaten_Kota"]
    .count()
    .to_dict(),
    "cluster_labels": enriched_data.groupby("Cluster")["Cluster_Label"]
    .first()
    .to_dict(),
    "regional_distribution": (
        enriched_data["Region"].value_counts().to_dict()
        if "Region" in enriched_data.columns
        else {}
    ),
    "expenditure_summary": {
        "avg_buah": float(enriched_data["Pengeluaran_Buah"].mean()),
        "avg_sayur": float(enriched_data["Pengeluaran_Sayur"].mean()),
        "max_buah": float(enriched_data["Pengeluaran_Buah"].max()),
        "max_sayur": float(enriched_data["Pengeluaran_Sayur"].max()),
        "min_buah": float(enriched_data["Pengeluaran_Buah"].min()),
        "min_sayur": float(enriched_data["Pengeluaran_Sayur"].min()),
    },
    "cluster_profiles": cluster_profiles.to_dict("records"),
    "centroids": cluster_centroids.to_dict("records"),
}

# Generate predictions for 2025 using Linear Regression
from sklearn.linear_model import LinearRegression

predictions_list = []
for kabupaten in enriched_data["Kabupaten_Kota"].unique():
    kab_data = enriched_data[enriched_data["Kabupaten_Kota"] == kabupaten].sort_values(
        "Tahun"
    )

    if len(kab_data) >= 2:
        years = kab_data["Tahun"].values.reshape(-1, 1)

        # Predict Buah
        buah_values = kab_data["Pengeluaran_Buah"].values
        model_buah = LinearRegression()
        model_buah.fit(years, buah_values)
        pred_buah_2025 = model_buah.predict([[2025]])[0]

        # Predict Sayur
        sayur_values = kab_data["Pengeluaran_Sayur"].values
        model_sayur = LinearRegression()
        model_sayur.fit(years, sayur_values)
        pred_sayur_2025 = model_sayur.predict([[2025]])[0]

        latest = kab_data.iloc[-1]

        predictions_list.append(
            {
                "Kabupaten_Kota": kabupaten,
                "Region": latest.get("Region", "Unknown"),
                "Cluster": int(latest["Cluster"]),
                "Cluster_Label": latest["Cluster_Label"],
                "Predicted_Buah_2025": float(pred_buah_2025),
                "Predicted_Sayur_2025": float(pred_sayur_2025),
                "Predicted_Total_2025": float(pred_buah_2025 + pred_sayur_2025),
                "Current_Buah_2024": float(latest["Pengeluaran_Buah"]),
                "Current_Sayur_2024": float(latest["Pengeluaran_Sayur"]),
                "Growth_Rate_Buah": (
                    float((pred_buah_2025 / latest["Pengeluaran_Buah"] - 1) * 100)
                    if latest["Pengeluaran_Buah"] > 0
                    else 0
                ),
                "Growth_Rate_Sayur": (
                    float((pred_sayur_2025 / latest["Pengeluaran_Sayur"] - 1) * 100)
                    if latest["Pengeluaran_Sayur"] > 0
                    else 0
                ),
            }
        )

predictions_2025 = pd.DataFrame(predictions_list)

# Create visualization data
viz_data = {
    "cluster_sizes": enriched_data.groupby(["Cluster", "Cluster_Label"])
    .size()
    .reset_index(name="count")
    .to_dict("records"),
    "expenditure_by_cluster": enriched_data.groupby("Cluster")
    .agg({"Pengeluaran_Buah": "mean", "Pengeluaran_Sayur": "mean"})
    .reset_index()
    .to_dict("records"),
}

if len(predictions_2025) > 0:
    viz_data["predictions_summary"] = (
        predictions_2025.groupby("Cluster")
        .agg(
            {
                "Predicted_Buah_2025": "mean",
                "Predicted_Sayur_2025": "mean",
                "Growth_Rate_Buah": "mean",
                "Growth_Rate_Sayur": "mean",
            }
        )
        .reset_index()
        .to_dict("records")
    )
else:
    viz_data["predictions_summary"] = []

# Initialize Flask app
app = Flask(__name__)
CORS(app)


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "1.0.0",
        }
    )


@app.route("/api/clusters", methods=["GET"])
def get_all_clusters():
    try:
        df = enriched_data.copy()

        if "year" in request.args:
            year = int(request.args.get("year"))
            df = df[df["Tahun"] == year]

        if "cluster" in request.args:
            cluster = int(request.args.get("cluster"))
            df = df[df["Cluster"] == cluster]

        if "region" in request.args:
            region = request.args.get("region")
            if "Region" in df.columns:
                df = df[df["Region"] == region]

        result = df.to_dict("records")

        return jsonify({"success": True, "count": len(result), "data": result})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/clusters/<int:cluster_id>", methods=["GET"])
def get_cluster_by_id(cluster_id):
    try:
        cluster_data = enriched_data[enriched_data["Cluster"] == cluster_id]
        profile = cluster_profiles[cluster_profiles["Cluster"] == cluster_id].to_dict(
            "records"
        )
        centroid = cluster_centroids[
            cluster_centroids["Cluster"] == cluster_id
        ].to_dict("records")

        return jsonify(
            {
                "success": True,
                "cluster_id": cluster_id,
                "profile": profile[0] if profile else {},
                "centroid": centroid[0] if centroid else {},
                "data": cluster_data.to_dict("records"),
                "count": len(cluster_data),
            }
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/statistics", methods=["GET"])
def get_statistics():
    try:
        return jsonify({"success": True, "data": summary_stats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/predictions", methods=["GET"])
def get_predictions():
    try:
        df = predictions_2025.copy()

        if "cluster" in request.args and len(df) > 0:
            cluster = int(request.args.get("cluster"))
            df = df[df["Cluster"] == cluster]

        if "kabupaten" in request.args and len(df) > 0:
            kabupaten = request.args.get("kabupaten").lower()
            df = df[df["Kabupaten_Kota"].str.lower().str.contains(kabupaten)]

        return jsonify(
            {"success": True, "count": len(df), "data": df.to_dict("records")}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/regions", methods=["GET"])
def get_regions():
    try:
        if "Region" not in enriched_data.columns:
            return (
                jsonify({"success": False, "error": "Region data not available"}),
                404,
            )

        # Use Pengeluaran_Buah and Pengeluaran_Sayur instead of Total_Buah and Total_Sayur
        regions = (
            enriched_data.groupby("Region")
            .agg(
                {
                    "Kabupaten_Kota": "count",
                    "Pengeluaran_Buah": "mean",
                    "Pengeluaran_Sayur": "mean",
                }
            )
            .reset_index()
        )

        regions.columns = ["Region", "Count", "Avg_Buah", "Avg_Sayur"]

        return jsonify({"success": True, "data": regions.to_dict("records")})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/regions/list", methods=["GET"])
def get_regions_list():
    """Get unique list of regions/provinces"""
    try:
        if "Region" not in enriched_data.columns:
            return (
                jsonify({"success": False, "error": "Region data not available"}),
                404,
            )

        # Get unique regions sorted alphabetically
        regions_list = sorted(enriched_data["Region"].dropna().unique().tolist())

        return jsonify(
            {"success": True, "count": len(regions_list), "data": regions_list}
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/search", methods=["GET"])
def search_kabupaten():
    try:
        query = request.args.get("q", "").lower()

        if not query:
            return (
                jsonify({"success": False, "error": "Query parameter q is required"}),
                400,
            )

        results = enriched_data[
            enriched_data["Kabupaten_Kota"].str.lower().str.contains(query)
        ]

        return jsonify(
            {
                "success": True,
                "query": query,
                "count": len(results),
                "data": results.to_dict("records"),
            }
        )
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/visualization", methods=["GET"])
def get_visualization_data():
    try:
        return jsonify({"success": True, "data": viz_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    print("=" * 60)
    print("STARTING FLASK API SERVER")
    print("=" * 60)
    print("Server Configuration:")
    print("  Host: 0.0.0.0")
    print("  Port: 5000")
    print("  Debug: True")
    print("  CORS: Enabled")
    print("API Base URL: http://localhost:5000/api")
    print("Press CTRL+C to stop the server")
    print("=" * 60)

    app.run(host="0.0.0.0", port=5000, debug=True)
