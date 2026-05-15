import os
import random
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from ml_utils import build_pipeline, infer_category

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "job_candidate_fit.csv")
REAL_DATA_PATH = os.path.join(BASE_DIR, "data", "real_job_candidate_fit.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
MODEL_PATH = os.path.join(MODEL_DIR, "fit_model.joblib")

REAL_DATASET_MODE = os.getenv("USE_REAL_DATASET", "1") == "1"
RANDOM_SEED = 42


def normalize_text(value):
    return " ".join(str(value or "").replace("\n", " ").split())


def stringify_skill_field(value):
    if isinstance(value, list):
        return ", ".join(str(item) for item in value)
    return normalize_text(value)


def load_public_training_pairs():
    from datasets import load_dataset

    random.seed(RANDOM_SEED)

    resume_rows = load_dataset("C0ldSmi1e/resume-dataset", split="train")
    job_rows = load_dataset("batuhanmtl/job-skill-set", split="train")

    supported_categories = sorted(
        set(resume_rows["category"]).intersection(set(job_rows["category"]))
    )

    resumes_by_category = {category: [] for category in supported_categories}
    jobs_by_category = {category: [] for category in supported_categories}

    for row in resume_rows:
        category = row["category"]
        if category not in resumes_by_category:
            continue

        resumes_by_category[category].append(
            {
                "candidate_role": normalize_text(
                    f"resume_category: {category}"
                ),
                "candidate_skills": normalize_text(
                    f"{stringify_skill_field(row.get('skills'))} {normalize_text(row.get('text', ''))[:500]}"
                ),
                "experience": normalize_text(
                    f"{row.get('experience', '')} {row.get('education', '')}"
                ),
            }
        )

    for row in job_rows:
        category = row["category"]
        if category not in jobs_by_category:
            continue

        jobs_by_category[category].append(
            {
                "job_title": normalize_text(
                    f"job_category: {category} {row.get('job_title', '')}"
                ),
                "job_skills": normalize_text(
                    f"{row.get('category', '')} {stringify_skill_field(row.get('job_skill_set'))} "
                    f"{normalize_text(row.get('job_description', ''))[:500]}"
                ),
            }
        )

    training_pairs = []
    all_other_categories = {
        category: [item for other_category, items in jobs_by_category.items() if other_category != category for item in items]
        for category in supported_categories
    }

    for category in supported_categories:
        same_category_jobs = jobs_by_category[category]
        other_category_jobs = all_other_categories[category]
        category_resumes = resumes_by_category[category]

        if not same_category_jobs or not other_category_jobs:
            continue

        sample_size = min(len(category_resumes), 180)

        for resume in random.sample(category_resumes, sample_size):
            positive_jobs = random.sample(same_category_jobs, min(2, len(same_category_jobs)))
            negative_jobs = random.sample(other_category_jobs, min(2, len(other_category_jobs)))

            for job in positive_jobs:
                training_pairs.append(
                    {
                        "job_title": job["job_title"],
                        "job_skills": job["job_skills"],
                        "candidate_role": resume["candidate_role"],
                        "candidate_skills": resume["candidate_skills"],
                        "experience": resume["experience"],
                        "label": "1",
                    }
                )

            for job in negative_jobs:
                training_pairs.append(
                    {
                        "job_title": job["job_title"],
                        "job_skills": job["job_skills"],
                        "candidate_role": resume["candidate_role"],
                        "candidate_skills": resume["candidate_skills"],
                        "experience": resume["experience"],
                        "label": "0",
                    }
                )

    dataframe = pd.DataFrame(training_pairs).drop_duplicates()
    dataframe.to_csv(REAL_DATA_PATH, index=False)
    return dataframe


def load_training_dataframe():
    if REAL_DATASET_MODE:
        try:
            dataset = load_public_training_pairs()
            if not dataset.empty:
                return dataset
        except Exception as exc:
            print(f"Falling back to local dataset because public download failed: {exc}")

    return pd.read_csv(DATA_PATH)


def enrich_local_dataset(dataset):
    enriched = dataset.copy()

    enriched["job_title"] = enriched.apply(
        lambda row: normalize_text(
            "job_category: "
            + infer_category(
                f"{row.get('job_title', '')} {row.get('job_skills', '')}"
            )
            + " "
            + str(row.get("job_title", ""))
        ),
        axis=1,
    )
    enriched["candidate_role"] = enriched.apply(
        lambda row: normalize_text(
            "resume_category: "
            + infer_category(
                f"{row.get('candidate_role', '')} {row.get('candidate_skills', '')}"
            )
            + " "
            + str(row.get("candidate_role", ""))
        ),
        axis=1,
    )

    return enriched


def main():
    os.makedirs(MODEL_DIR, exist_ok=True)

    dataset = enrich_local_dataset(load_training_dataframe())
    feature_columns = [
        "job_title",
        "job_skills",
        "candidate_role",
        "candidate_skills",
        "experience",
    ]

    X = dataset[feature_columns].fillna("")
    y = dataset["label"].astype(str)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=RANDOM_SEED,
        stratify=y,
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    predictions = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)

    joblib.dump(pipeline, MODEL_PATH)

    print(f"Training rows: {len(dataset)}")
    print(f"Model saved to {MODEL_PATH}")
    print(f"Validation accuracy: {accuracy:.2f}")


if __name__ == "__main__":
    main()
