from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.mongodb import users_collection
from app.models.auth import LoginRequest, RegisterRequest, SetupStatusResponse, TokenResponse
from app.models.user import ChangePasswordRequest, UserInDB, UserPublic, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/setup-status", response_model=SetupStatusResponse)
async def setup_status():
    """RentFlow is single-tenant: exactly one landlord account. The register
    screen only works before that account exists (first-run setup); after
    that it's closed, same spirit as the WordPress/Nextcloud-style
    "create admin account" first-run screen."""
    count = await users_collection.count_documents({}, limit=1)
    return SetupStatusResponse(needs_setup=count == 0)


@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest):
    if await users_collection.count_documents({}, limit=1) > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hệ thống đã được thiết lập. Vui lòng đăng nhập.",
        )
    if await users_collection.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")

    doc = {
        "email": payload.email,
        "full_name": payload.full_name,
        "phone": None,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = await users_collection.insert_one(doc)
    token = create_access_token(str(result.inserted_id), remember=True)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    doc = await users_collection.find_one({"email": payload.email})
    if not doc or not verify_password(payload.password, doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Email hoặc mật khẩu không đúng"
        )
    token = create_access_token(str(doc["_id"]), remember=payload.remember)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserPublic)
async def get_me(current_user: UserInDB = Depends(get_current_user)):
    doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    return UserPublic.model_validate(doc)


@router.put("/me", response_model=UserPublic)
async def update_me(payload: UserUpdate, current_user: UserInDB = Depends(get_current_user)):
    update_data = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
    if update_data:
        await users_collection.update_one({"_id": ObjectId(current_user.id)}, {"$set": update_data})
    doc = await users_collection.find_one({"_id": ObjectId(current_user.id)})
    return UserPublic.model_validate(doc)


@router.put("/change-password")
async def change_password(
    payload: ChangePasswordRequest, current_user: UserInDB = Depends(get_current_user)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")
    new_hash = hash_password(payload.new_password)
    await users_collection.update_one(
        {"_id": ObjectId(current_user.id)}, {"$set": {"hashed_password": new_hash}}
    )
    return {"message": "Đổi mật khẩu thành công"}
