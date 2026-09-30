from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Cookie, HTTPException, status

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.mongodb import users_collection
from app.models.user import UserInDB


async def get_current_user(
    token: str | None = Cookie(default=None, alias=settings.auth_cookie_name),
) -> UserInDB:
    user_id = decode_access_token(token) if token else None
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
        )
    try:
        doc = await users_collection.find_one({"_id": ObjectId(user_id)})
    except InvalidId:
        doc = None
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Người dùng không tồn tại"
        )
    return UserInDB.model_validate(doc)


def object_id_or_404(value: str, detail: str = "Không tìm thấy dữ liệu") -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
