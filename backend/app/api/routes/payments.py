from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import get_current_user, object_id_or_404
from app.db.mongodb import bills_collection, payments_collection
from app.models.payment import PaymentCreate, PaymentPublic
from app.models.user import UserInDB

router = APIRouter(prefix="/payments", tags=["payments"])


@router.get("", response_model=list[PaymentPublic])
async def list_payments(bill_id: str | None = None, current_user: UserInDB = Depends(get_current_user)):
    query: dict = {}
    if bill_id:
        query["bill_id"] = bill_id
    docs = await payments_collection.find(query).sort("payment_date", -1).to_list(length=5000)
    return [PaymentPublic.model_validate(d) for d in docs]


@router.post("", response_model=PaymentPublic, status_code=201)
async def create_payment(payload: PaymentCreate, current_user: UserInDB = Depends(get_current_user)):
    bill_oid = object_id_or_404(payload.bill_id, "Không tìm thấy hóa đơn")
    bill = await bills_collection.find_one({"_id": bill_oid})
    if not bill:
        raise HTTPException(status_code=404, detail="Không tìm thấy hóa đơn")

    now = datetime.now(timezone.utc)
    doc = payload.model_dump()
    doc["payment_date"] = payload.payment_date or now
    doc["created_at"] = now
    result = await payments_collection.insert_one(doc)

    # Support partial payments: only flip the bill to "paid" once the sum of
    # everything recorded against it reaches the total.
    total_paid_cursor = payments_collection.aggregate(
        [
            {"$match": {"bill_id": payload.bill_id}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}},
        ]
    )
    total_paid_docs = await total_paid_cursor.to_list(length=1)
    total_paid = total_paid_docs[0]["total"] if total_paid_docs else 0
    if total_paid >= bill["total_amount"]:
        await bills_collection.update_one({"_id": bill_oid}, {"$set": {"status": "paid"}})

    created = await payments_collection.find_one({"_id": result.inserted_id})
    return PaymentPublic.model_validate(created)
