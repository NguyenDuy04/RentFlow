from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.common import PyObjectId

PaymentMethod = Literal["cash", "bank_transfer"]


class PaymentCreate(BaseModel):
    bill_id: str
    amount: float = Field(gt=0)
    method: PaymentMethod
    payment_date: Optional[datetime] = None
    transaction_code: Optional[str] = None


class PaymentPublic(BaseModel):
    id: PyObjectId = Field(validation_alias="_id")
    bill_id: str
    amount: float
    method: PaymentMethod
    payment_date: datetime
    transaction_code: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(populate_by_name=True)
