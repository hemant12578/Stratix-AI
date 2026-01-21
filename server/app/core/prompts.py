"""
Gemini prompt templates for all AI operations
"""

SYSTEM_PROMPT_ANALYZER = """
You are an expert ML data consultant helping developers find training data.
Extract structured requirements from natural language queries.
Return ONLY valid JSON, no explanations.
"""

USER_PROMPT_ANALYZER = """
User query: "{user_input}"

Extract and return this exact JSON structure:
{{
  "domain": "<healthcare|nlp|vision|finance|education|general>",
  "task_type": "<classification|regression|clustering|generation|detection>",
  "ml_framework": "<tensorflow|pytorch|sklearn|huggingface>",
  "required_features": [
    {{
      "name": "<feature_name>",
      "type": "<numeric|categorical|text|image|date|boolean>",
      "description": "<what it represents>",
      "required": <true|false>
    }}
  ],
  "target_variable": {{
    "name": "<label_name>",
    "type": "<binary|multiclass|continuous|sequence>",
    "classes": ["class1", "class2"]
  }},
  "sample_size": {{
    "minimum": <number>,
    "preferred": <number>
  }},
  "output_format": "<json|csv|parquet>",
  "data_split": {{
    "train": 0.7,
    "test": 0.2,
    "validation": 0.1
  }},
  "constraints": {{
    "language": "<english|hindi|multilingual>",
    "region": "<india|global|specific_region>",
    "time_period": "<year_range|recent>"
  }},
  "suggested_sources": ["<source1>", "<source2>"],
  "quality_requirements": {{
    "min_score": <0-100>,
    "max_missing_percent": <0-100>,
    "balance_classes": <true|false>
  }}
}}
"""

SYSTEM_PROMPT_MATCHER = """
You are a dataset recommendation expert.
Match user requirements to available datasets.
Calculate match scores based on relevance, quality, and availability.
Return ONLY valid JSON.
"""

USER_PROMPT_MATCHER = """
User requirements:
{requirements_json}

Available datasets (metadata):
{datasets_metadata}

For each dataset, calculate match_score (0-100) and return:
{{
  "matches": [
    {{
      "dataset_id": "<id>",
      "name": "<dataset_name>",
      "source": "<kaggle|huggingface|etc>",
      "match_score": <0-100>,
      "match_reasons": ["reason1", "reason2"],
      "concerns": ["concern1"],
      "available_features": ["feat1", "feat2"],
      "missing_features": ["feat3"],
      "sample_count": <number>,
      "quality_score": <0-100>,
      "license": "<license_type>",
      "url": "<download_url>"
    }}
  ],
  "recommended_combinations": [
    {{
      "dataset_ids": ["id1", "id2"],
      "rationale": "<why combine these>",
      "combined_score": <0-100>
    }}
  ]
}}

Sort matches by match_score descending.
Only include scores > 50.
"""

SYSTEM_PROMPT_CLEANER = """
You are a data preprocessing expert.
Analyze datasets and provide cleaning instructions.
Be specific and actionable.
Return ONLY valid JSON.
"""

USER_PROMPT_CLEANER = """
Dataset analysis:
- Columns: {column_names}
- Data types: {dtypes}
- Missing values: {missing_report}
- Sample rows: {sample_data}
- Statistics: {describe_stats}

User requirements: {user_requirements}

Return cleaning strategy:
{{
  "columns_to_keep": ["col1", "col2"],
  "columns_to_drop": ["irrelevant_col"],
  "column_rename": {{
    "old_name": "new_name"
  }},
  "missing_value_strategy": {{
    "col1": "drop_rows|fill_median|fill_mode|fill_forward|fill_value:X"
  }},
  "outlier_handling": {{
    "col1": "none|cap_at_3std|remove_iqr|cap_at_percentile:95"
  }},
  "data_type_conversion": {{
    "col1": "int|float|str|datetime|category"
  }},
  "text_preprocessing": {{
    "columns": ["text_col"],
    "steps": ["lowercase", "remove_urls", "remove_special", "trim"]
  }},
  "encoding": {{
    "categorical_cols": ["col1"],
    "method": "one_hot|label_encode|target_encode"
  }},
  "feature_engineering": [
    {{
      "name": "new_feature",
      "formula": "<pandas_code>",
      "rationale": "why this helps"
    }}
  ],
  "normalization": {{
    "columns": ["col1", "col2"],
    "method": "standard_scaler|min_max|robust"
  }}
}}
"""

SYSTEM_PROMPT_METADATA = """
Generate comprehensive metadata for this ML dataset.
Return ONLY valid JSON.
"""

USER_PROMPT_METADATA = """
Dataset info:
- Shape: {rows} rows, {cols} columns
- Columns: {column_list}
- Sample data: {sample_rows}
- Statistics: {describe_output}

Return JSON:
{{
  "dataset_info": {{
    "title": "Descriptive title",
    "description": "2-3 sentences about the data",
    "domain": "healthcare|nlp|vision|etc",
    "use_cases": ["sentiment analysis", "classification"],
    "version": "1.0",
    "created_date": "{date}"
  }},
  "features": [
    {{
      "name": "age",
      "type": "numeric",
      "description": "Age of the person in years",
      "range": [18, 90],
      "missing_count": 0,
      "unique_count": 65
    }}
  ],
  "target_variable": {{
    "name": "label",
    "type": "categorical",
    "classes": ["positive", "negative"],
    "distribution": {{"positive": 0.52, "negative": 0.48}}
  }},
  "data_quality": {{
    "completeness_score": 95,
    "consistency_score": 88,
    "accuracy_score": 90,
    "overall_quality": 91
  }},
  "splits": {{
    "train": {{"samples": 8000, "percentage": 70}},
    "test": {{"samples": 2000, "percentage": 20}},
    "validation": {{"samples": 1000, "percentage": 10}}
  }},
  "sources": [
    {{
      "name": "Kaggle Twitter Sentiment",
      "url": "https://...",
      "license": "CC0",
      "attribution_required": false
    }}
  ],
  "preprocessing_applied": [
    "Removed 450 duplicates",
    "Filled 230 missing values",
    "Standardized text to lowercase"
  ]
}}
"""

SYSTEM_PROMPT_CODE_GENERATOR = """
Generate Python training code for ML datasets.
Make it production-ready, well-commented, and include error handling.
Return ONLY the Python code as a string, no JSON wrapper.
"""

USER_PROMPT_CODE_GENERATOR = """
Dataset metadata:
{metadata}

User wants: {ml_framework} for {task_type}

Generate complete, working Python code with:
1. Data loading
2. Preprocessing pipeline
3. Model definition
4. Training loop
5. Evaluation

Return as Python code string:
"""

# Strategy / Market Research prompts
SYSTEM_PROMPT_MARKET_RESEARCH = """
You are a senior market research strategist for Indian startups.
Analyze business ideas or market queries specifically for the India context.
Return ONLY valid JSON, no explanations.
"""

USER_PROMPT_MARKET_RESEARCH = """
User idea or market query:
"{user_input}"

Analyze this opportunity for the Indian market and return JSON with this exact structure:
{
  "consumer_gap": {
    "summary": "2-3 sentence summary of the unmet need in India",
    "key_pain_points": [
      "Pain point 1 in simple language",
      "Pain point 2"
    ],
    "current_alternatives": [
      "What people are doing today instead"
    ],
    "target_segments": [
      "Students in tier-2 cities",
      "SMEs in manufacturing",
      "Working professionals in metros"
    ]
  },
  "revenue_model": {
    "summary": "Overview of how this can make money in India",
    "primary_streams": [
      "Monthly SaaS subscription for SMEs",
      "One-time setup fees for enterprises"
    ],
    "secondary_streams": [
      "Affiliate partnerships",
      "Premium features / add-ons"
    ],
    "pricing_suggestions": [
      "Freemium for individuals, ₹499/month for pros",
      "₹2,999/month per team for SMEs"
    ]
  },
  "swot_analysis": {
    "strengths": [
      "Strength 1 tailored to Indian context",
      "Strength 2"
    ],
    "weaknesses": [
      "Weakness 1 or execution risk",
      "Weakness 2"
    ],
    "opportunities": [
      "Opportunity 1 (macro trend, regulation, digital adoption)",
      "Opportunity 2"
    ],
    "threats": [
      "Threat 1 (competition, regulation, user behavior)",
      "Threat 2"
    ]
  }
}

Keep the language concise, founder-friendly, and focused on India.
"""
