import re
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer


CATEGORY_KEYWORDS = {
    "HR": [
        "hr",
        "human resource",
        "recruit",
        "talent acquisition",
        "payroll",
        "employee relations",
    ],
    "INFORMATION-TECHNOLOGY": [
        "developer",
        "engineer",
        "software",
        "frontend",
        "backend",
        "full stack",
        "react",
        "node",
        "python",
        "java",
        "qa",
        "devops",
        "cloud",
        "data analyst",
        "machine learning",
        "it support",
    ],
    "FINANCE": [
        "finance",
        "financial",
        "accountant",
        "accounting",
        "audit",
        "tax",
        "banking",
        "investment",
    ],
    "SALES": [
        "sales",
        "retail",
        "inside sales",
        "outside sales",
        "sales executive",
        "account manager",
    ],
    "BUSINESS-DEVELOPMENT": [
        "business development",
        "growth",
        "lead generation",
        "client acquisition",
        "partnership",
        "bidding",
    ],
}


def infer_category(text):
    normalized = str(text or "").lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(keyword in normalized for keyword in keywords):
            return category
    return "GENERAL"


def tokenize(text):
    return set(re.findall(r"[a-zA-Z][a-zA-Z0-9\-+#.]+", str(text or "").lower()))


def build_structured_features(frame):
    rows = []

    for _, row in frame.iterrows():
        job_title_tokens = tokenize(row.get("job_title"))
        job_skill_tokens = tokenize(row.get("job_skills"))
        candidate_role_tokens = tokenize(row.get("candidate_role"))
        candidate_skill_tokens = tokenize(row.get("candidate_skills"))

        job_category = infer_category(
            f"{row.get('job_title', '')} {row.get('job_skills', '')}"
        )
        candidate_category = infer_category(
            f"{row.get('candidate_role', '')} {row.get('candidate_skills', '')}"
        )

        job_all_tokens = job_title_tokens | job_skill_tokens
        candidate_all_tokens = candidate_role_tokens | candidate_skill_tokens
        combined_union = len(job_all_tokens | candidate_all_tokens) or 1
        skill_union = len(job_skill_tokens | candidate_skill_tokens) or 1
        role_union = len(job_title_tokens | candidate_role_tokens) or 1

        rows.append(
            {
                "same_category": int(job_category == candidate_category),
                "skill_overlap": len(job_skill_tokens & candidate_skill_tokens) / skill_union,
                "role_overlap": len(job_title_tokens & candidate_role_tokens) / role_union,
                "overall_overlap": len(job_all_tokens & candidate_all_tokens) / combined_union,
                "job_token_count": len(job_all_tokens),
                "candidate_token_count": len(candidate_all_tokens),
            }
        )

    return pd.DataFrame(rows)


def build_pipeline():
    return Pipeline(
        [
            (
                "features",
                FunctionTransformer(build_structured_features, validate=False),
            ),
            ("clf", LogisticRegression(max_iter=1000, class_weight="balanced")),
        ]
    )
