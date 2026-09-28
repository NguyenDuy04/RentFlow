import pytest

pytestmark = pytest.mark.asyncio


async def _setup_room_with_tenant(client, headers):
    r = await client.post(
        "/api/rooms",
        headers=headers,
        json={"room_code": "P101", "name": "Phong 101", "rent_price": 2_500_000, "max_occupants": 2},
    )
    room = r.json()
    await client.post(
        "/api/tenants",
        headers=headers,
        json={
            "full_name": "Nguyen Van A",
            "phone": "0900000000",
            "national_id": "012345678900",
            "room_id": room["id"],
            "lease_start_date": "2026-01-01",
        },
    )
    await client.put(
        "/api/pricing",
        headers=headers,
        json={
            "electricity_price": 3500,
            "water_price": 20000,
            "internet_fee": 100000,
            "parking_fee": 50000,
            "cleaning_fee": 30000,
        },
    )
    return room


async def test_meter_reading_rejects_new_below_old(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    r = await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 100, "electricity_new": 90,
            "water_old": 10, "water_new": 18,
        },
    )
    assert r.status_code == 422


async def test_generate_bill_computes_correct_total(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 100, "electricity_new": 150,
            "water_old": 10, "water_new": 18,
        },
    )
    r = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r.status_code == 201, r.text
    bills = r.json()
    assert len(bills) == 1
    bill = bills[0]
    # room 2,500,000 + electricity 50*3500=175,000 + water 8*20,000=160,000
    # + internet 100,000 + parking 50,000 + cleaning 30,000
    assert bill["total_amount"] == 3_015_000
    assert bill["status"] == "unpaid"


async def test_generate_bill_skips_room_without_meter_reading(client, auth_headers):
    await _setup_room_with_tenant(client, auth_headers)
    r = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r.status_code == 400


async def test_generate_bill_is_idempotent_per_room_month(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    r1 = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r1.status_code == 201
    r2 = await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})
    assert r2.status_code == 400  # nothing new to create, already exists


async def test_bill_pdf_export(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bills = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()
    r = await client.get(f"/api/bills/{bills[0]['id']}/pdf", headers=auth_headers)
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert len(r.content) > 1000


async def test_payment_marks_bill_paid_when_full_amount_covered(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]

    r = await client.post(
        "/api/payments",
        headers=auth_headers,
        json={"bill_id": bill["id"], "amount": bill["total_amount"], "method": "cash"},
    )
    assert r.status_code == 201

    r = await client.get(f"/api/bills/{bill['id']}", headers=auth_headers)
    assert r.json()["status"] == "paid"


async def test_partial_payment_does_not_mark_bill_paid(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]

    await client.post(
        "/api/payments",
        headers=auth_headers,
        json={"bill_id": bill["id"], "amount": bill["total_amount"] / 2, "method": "cash"},
    )
    r = await client.get(f"/api/bills/{bill['id']}", headers=auth_headers)
    assert r.json()["status"] == "unpaid"


async def test_dashboard_overview_reflects_state(client, auth_headers):
    room = await _setup_room_with_tenant(client, auth_headers)
    await client.post(
        "/api/meters",
        headers=auth_headers,
        json={
            "room_id": room["id"], "month": "2026-08",
            "electricity_old": 0, "electricity_new": 10,
            "water_old": 0, "water_new": 1,
        },
    )
    bill = (await client.post("/api/bills/generate", headers=auth_headers, json={"month": "2026-08"})).json()[0]
    await client.post(
        "/api/payments",
        headers=auth_headers,
        json={"bill_id": bill["id"], "amount": bill["total_amount"], "method": "cash"},
    )

    r = await client.get("/api/dashboard/overview", headers=auth_headers)
    data = r.json()
    assert data["occupied_rooms"] == 1
    assert data["unpaid_bills_count"] == 0

    r = await client.get("/api/dashboard/revenue-chart?months=6", headers=auth_headers)
    assert len(r.json()) == 6
