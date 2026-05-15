import os
import re
import joblib
import pandas as pd
from flask import Flask, jsonify, request
from ml_utils import infer_category

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "fit_model.joblib")

app = Flask(__name__)

model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

SKILL_ALIASES = {
    "python": ["python"],
    "javascript": ["javascript"],
    "typescript": ["typescript"],
    "react": ["react", "reactjs"],
    "node.js": ["node", "node.js"],
    "express": ["express", "expressjs"],
    "html": ["html"],
    "css": ["css"],
    "redux": ["redux"],
    "mysql": ["mysql"],
    "postgresql": ["postgresql", "postgres"],
    "mongodb": ["mongodb", "mongo"],
    "sql": ["sql"],
    "rest api": ["rest api", "rest", "api"],
    "docker": ["docker"],
    "aws": ["aws"],
    "azure": ["azure"],
    "google cloud": ["google cloud"],
    "machine learning": ["machine learning"],
    "tensorflow": ["tensorflow"],
    "pandas": ["pandas"],
    "scikit-learn": ["scikit-learn", "sklearn"],
    "figma": ["figma"],
    "wireframing": ["wireframing"],
    "prototyping": ["prototyping"],
    "design systems": ["design systems"],
    "testing": ["testing", "test automation"],
    "selenium": ["selenium"],
    "postman": ["postman"],
    "powerbi": ["powerbi", "power bi"],
    "excel": ["excel"],
    "tableau": ["tableau"],
    "ci/cd": ["ci/cd", "cicd"],
    "linux": ["linux"],
    "kubernetes": ["kubernetes"],
    "git": ["git"],
}


def normalize_text(value):
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def alias_present(normalized_text, alias):
    pattern = r"(?<![a-z0-9])" + re.escape(alias) + r"(?![a-z0-9])"
    return re.search(pattern, normalized_text) is not None


def extract_skills(text):
    normalized = normalize_text(text)
    detected = []

    for canonical_name, aliases in SKILL_ALIASES.items():
        if any(alias_present(normalized, alias) for alias in aliases):
            detected.append(canonical_name)

    if not detected:
        tokens = re.split(r"[,/|]", normalized)
        detected = [token.strip() for token in tokens if len(token.strip()) > 2][:8]

    return sorted(set(detected))


def build_features(job, candidate):
    job_category = infer_category(f"{job.get('title', '')} {job.get('skills', '')}")
    candidate_category = infer_category(
        f"{candidate.get('target_role', '')} {candidate.get('skills', '')}"
    )

    return {
        "job_title": f"job_category: {job_category} {job.get('title', '')}",
        "job_skills": job.get("skills", ""),
        "candidate_role": (
            f"resume_category: {candidate_category} {candidate.get('target_role', '')}"
        ),
        "candidate_skills": candidate.get("skills", ""),
        "experience": candidate.get("experience", ""),
    }


def predict_probability(features):
    if model is None:
        return 0.0

    frame = pd.DataFrame([features])
    probabilities = model.predict_proba(frame)[0]
    classes = [str(label) for label in model.classes_]
    positive_index = classes.index("1") if "1" in classes else len(classes) - 1
    return float(probabilities[positive_index])


def score_candidate(job, candidate):
    features = build_features(job, candidate)
    ml_probability = predict_probability(features)

    job_skills = extract_skills(f"{job.get('title', '')} {job.get('skills', '')}")
    candidate_skills = extract_skills(
        f"{candidate.get('target_role', '')} {candidate.get('skills', '')}"
    )

    matched_skills = sorted(set(job_skills).intersection(candidate_skills))
    missing_skills = sorted(set(job_skills).difference(candidate_skills))
    skill_coverage = (len(matched_skills) / len(job_skills)) if job_skills else 0.0

    final_score = round(((0.7 * ml_probability) + (0.3 * skill_coverage)) * 100)

    if matched_skills:
        insight = (
            f"Strong overlap in {', '.join(matched_skills[:3])}. "
            f"The model also sees a role/profile pattern similar to good-fit training examples."
        )
    else:
        insight = (
            "The model found limited direct skill overlap, so this recommendation is based more on "
            "overall role and profile similarity."
        )

    return {
        "id": candidate.get("id"),
        "matchScore": final_score,
        "matchedSkills": matched_skills,
        "missingSkills": missing_skills,
        "aiInsight": insight,
        "scoreSource": "ml-model",
    }


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "NLP service running",
            "modelLoaded": model is not None,
        }
    )


@app.route("/extract-skills", methods=["POST"])
def extract_skills_route():
    try:
        data = request.get_json(silent=True) or {}
        text = data.get("text", "")
        return jsonify({"skills": extract_skills(text)})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/match-skills", methods=["POST"])
def match_skills():
    try:
        data = request.get_json(silent=True) or {}
        job_skills = set(data.get("job_skills", []))
        candidate_skills = set(data.get("candidate_skills", []))

        matches = sorted(job_skills.intersection(candidate_skills))
        match_score = (len(matches) / len(job_skills) * 100) if job_skills else 0

        return jsonify(
            {
                "match_score": round(match_score, 2),
                "matching_skills": matches,
                "missing_skills": sorted(job_skills - candidate_skills),
            }
        )
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/predict-fit", methods=["POST"])
def predict_fit():
    try:
        data = request.get_json(silent=True) or {}
        job = data.get("job", {})
        candidates = data.get("candidates", [])

        predictions = [score_candidate(job, candidate) for candidate in candidates]
        predictions.sort(key=lambda item: item["matchScore"], reverse=True)

        return jsonify({"candidates": predictions})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


if __name__ == "__main__":
    print("NLP service running on http://localhost:5001")
    app.run(debug=True, port=5001)
