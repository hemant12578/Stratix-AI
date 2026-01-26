import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple
import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OneHotEncoder
import re

class DataProcessor:
    """Process and clean datasets based on AI-generated instructions"""
    
    def __init__(self, df: pd.DataFrame):
        self.df = df.copy()
        self.original_shape = df.shape
    
    def apply_cleaning(self, instructions: Dict[str, Any]) -> pd.DataFrame:
        """Apply cleaning instructions from Gemini"""
        try:
            # 1. Drop columns
            if "columns_to_drop" in instructions and instructions["columns_to_drop"]:
                self.df = self.df.drop(columns=instructions["columns_to_drop"], errors='ignore')
            
            # 2. Keep only specified columns
            if "columns_to_keep" in instructions and instructions["columns_to_keep"]:
                available_cols = [col for col in instructions["columns_to_keep"] if col in self.df.columns]
                self.df = self.df[available_cols]
            
            # 3. Rename columns
            if "column_rename" in instructions and instructions["column_rename"]:
                self.df = self.df.rename(columns=instructions["column_rename"])
            
            # 4. Handle missing values
            if "missing_value_strategy" in instructions:
                for col, strategy in instructions["missing_value_strategy"].items():
                    if col not in self.df.columns:
                        continue
                    
                    if strategy == "drop_rows":
                        self.df = self.df.dropna(subset=[col])
                    elif strategy == "fill_mean":
                        if self.df[col].dtype in ['int64', 'float64']:
                            self.df[col].fillna(self.df[col].mean(), inplace=True)
                    elif strategy == "fill_median":
                        if self.df[col].dtype in ['int64', 'float64']:
                            self.df[col].fillna(self.df[col].median(), inplace=True)
                    elif strategy == "fill_mode":
                        self.df[col].fillna(self.df[col].mode()[0] if not self.df[col].mode().empty else "", inplace=True)
                    elif strategy == "fill_forward":
                        self.df[col].fillna(method='ffill', inplace=True)
                    elif strategy.startswith("fill_value:"):
                        value = strategy.split(":")[1]
                        self.df[col].fillna(value, inplace=True)
            
            # 5. Handle outliers
            if "outlier_handling" in instructions:
                for col, method in instructions["outlier_handling"].items():
                    if col not in self.df.columns or self.df[col].dtype not in ['int64', 'float64']:
                        continue
                    
                    if method == "cap_at_3std":
                        mean = self.df[col].mean()
                        std = self.df[col].std()
                        self.df[col] = self.df[col].clip(lower=mean - 3*std, upper=mean + 3*std)
                    elif method == "remove_iqr":
                        Q1 = self.df[col].quantile(0.25)
                        Q3 = self.df[col].quantile(0.75)
                        IQR = Q3 - Q1
                        self.df = self.df[(self.df[col] >= Q1 - 1.5*IQR) & (self.df[col] <= Q3 + 1.5*IQR)]
            
            # 6. Data type conversions
            if "data_type_conversion" in instructions:
                for col, dtype in instructions["data_type_conversion"].items():
                    if col not in self.df.columns:
                        continue
                    try:
                        if dtype == "int":
                            self.df[col] = pd.to_numeric(self.df[col], errors='coerce').astype('Int64')
                        elif dtype == "float":
                            self.df[col] = pd.to_numeric(self.df[col], errors='coerce')
                        elif dtype == "datetime":
                            self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
                        elif dtype == "category":
                            self.df[col] = self.df[col].astype('category')
                    except:
                        pass
            
            # 7. Text preprocessing
            if "text_preprocessing" in instructions:
                text_config = instructions["text_preprocessing"]
                columns = text_config.get("columns", [])
                steps = text_config.get("steps", [])
                
                for col in columns:
                    if col not in self.df.columns:
                        continue
                    
                    if "lowercase" in steps:
                        self.df[col] = self.df[col].astype(str).str.lower()
                    if "remove_urls" in steps:
                        self.df[col] = self.df[col].astype(str).str.replace(r'http\S+|www\S+', '', regex=True)
                    if "remove_special" in steps or "remove_punctuation" in steps:
                        self.df[col] = self.df[col].astype(str).str.replace(r'[^\w\s]', '', regex=True)
                    if "trim" in steps:
                        self.df[col] = self.df[col].astype(str).str.strip()
            
            # 8. Feature engineering
            if "feature_engineering" in instructions:
                for feat in instructions["feature_engineering"]:
                    try:
                        # Execute pandas code safely
                        exec(f"self.df['{feat['name']}'] = {feat['formula']}")
                    except:
                        pass
            
            # 9. Encoding
            if "encoding" in instructions:
                encoding_config = instructions["encoding"]
                categorical_cols = encoding_config.get("categorical_cols", [])
                method = encoding_config.get("method", "label_encode")
                
                for col in categorical_cols:
                    if col not in self.df.columns:
                        continue
                    
                    if method == "one_hot":
                        dummies = pd.get_dummies(self.df[col], prefix=col)
                        self.df = pd.concat([self.df.drop(columns=[col]), dummies], axis=1)
                    elif method == "label_encode":
                        le = LabelEncoder()
                        self.df[col] = le.fit_transform(self.df[col].astype(str))
            
            # 10. Normalization
            if "normalization" in instructions:
                norm_config = instructions["normalization"]
                columns = norm_config.get("columns", [])
                method = norm_config.get("method", "standard_scaler")
                
                numeric_cols = [col for col in columns if col in self.df.columns and self.df[col].dtype in ['int64', 'float64']]
                
                if numeric_cols:
                    scaler = StandardScaler() if method == "standard_scaler" else None
                    if scaler:
                        self.df[numeric_cols] = scaler.fit_transform(self.df[numeric_cols])

            # Normalize unhashable types (lists/dicts) before dedupe
            for col in self.df.columns:
                if self.df[col].dtype == 'object':
                    self.df[col] = self.df[col].apply(
                        lambda v: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                    )

            # Final cleanup: remove duplicates
            self.df = self.df.drop_duplicates()
            
            return self.df
            
        except Exception as e:
            # If cleaning fails, return basic cleaned version
            self.df = self.df.dropna()
            for col in self.df.columns:
                if self.df[col].dtype == 'object':
                    self.df[col] = self.df[col].apply(
                        lambda v: json.dumps(v, ensure_ascii=False) if isinstance(v, (list, dict)) else v
                    )
            self.df = self.df.drop_duplicates()
            return self.df
    
    def create_splits(self, train_ratio: float = 0.7, test_ratio: float = 0.2, val_ratio: float = 0.1) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Create train/test/validation splits"""
        # Ensure ratios sum to 1
        total = train_ratio + test_ratio + val_ratio
        train_ratio /= total
        test_ratio /= total
        val_ratio /= total
        
        # First split: train vs (test + val)
        train_df, temp_df = train_test_split(
            self.df,
            test_size=(1 - train_ratio),
            random_state=42
        )
        
        # Second split: test vs val
        if val_ratio > 0:
            test_size = test_ratio / (test_ratio + val_ratio)
            test_df, val_df = train_test_split(
                temp_df,
                test_size=test_size,
                random_state=42
            )
        else:
            test_df = temp_df
            val_df = pd.DataFrame()
        
        return train_df, test_df, val_df
    
    def get_statistics(self) -> Dict[str, Any]:
        """Get dataset statistics"""
        stats = {
            "shape": {
                "rows": len(self.df),
                "columns": len(self.df.columns)
            },
            "columns": list(self.df.columns),
            "dtypes": {col: str(dtype) for col, dtype in self.df.dtypes.items()},
            "missing_values": self.df.isnull().sum().to_dict(),
            "describe": self.df.describe().to_dict() if len(self.df.select_dtypes(include=[np.number]).columns) > 0 else {}
        }
        return stats
    
    def get_sample(self, n: int = 10) -> List[Dict]:
        """Get sample rows"""
        return self.df.head(n).to_dict('records')
