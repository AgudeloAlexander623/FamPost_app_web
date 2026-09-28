"""Pruebas basicas del microservicio."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_root_returns_service_info() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "photos-service"


def test_health_is_ok() -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_and_list_photos() -> None:
    payload = {
        "title": "Atardecer",
        "url": "https://example.com/atardecer.jpg",
        "description": "Prueba de la clase",
    }
    created = client.post("/api/v1/photos/", json=payload)
    assert created.status_code == 201

    listed = client.get("/api/v1/photos/")
    assert listed.status_code == 200
    assert len(listed.json()) == 1
