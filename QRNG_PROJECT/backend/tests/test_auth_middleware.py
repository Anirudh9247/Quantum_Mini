import os
import sys
import unittest
from unittest.mock import patch

# Ensure app package is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app


class TestAuthMiddleware(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_public_routes_without_auth(self):
        """Public routes / and /health must always be accessible without auth."""
        with patch.dict(os.environ, {"API_KEY": "super_secret_123", "ENVIRONMENT": "production"}):
            res_root = self.client.get("/")
            self.assertEqual(res_root.status_code, 200)
            self.assertEqual(res_root.json(), {"status": "running"})

            res_health = self.client.get("/health")
            self.assertEqual(res_health.status_code, 200)
            self.assertEqual(res_health.json(), {"status": "ok"})

    def test_cors_preflight_options(self):
        """OPTIONS preflight requests must pass through without API key."""
        with patch.dict(os.environ, {"API_KEY": "super_secret_123", "ENVIRONMENT": "production"}):
            res = self.client.options(
                "/run-experiment",
                headers={
                    "Origin": "http://localhost:3000",
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "x-api-key,content-type",
                },
            )
            self.assertEqual(res.status_code, 200)

    def test_protected_routes_require_auth_when_api_key_configured(self):
        """Protected routes should reject requests with missing or invalid API key."""
        with patch.dict(os.environ, {"API_KEY": "super_secret_123", "ENVIRONMENT": "production"}):
            # Missing key
            res_missing = self.client.post("/run-experiment", json={"generator": "classical", "sample_size": 10})
            self.assertEqual(res_missing.status_code, 401)
            self.assertEqual(res_missing.json()["error"], "Unauthorized")

            # Invalid key
            res_invalid = self.client.post(
                "/run-experiment",
                json={"generator": "classical", "sample_size": 10},
                headers={"X-API-Key": "wrong_key"},
            )
            self.assertEqual(res_invalid.status_code, 401)
            self.assertEqual(res_invalid.json()["error"], "Unauthorized")

    def test_protected_routes_accept_valid_x_api_key_header(self):
        """Protected routes accept valid X-API-Key header."""
        with patch.dict(os.environ, {"API_KEY": "super_secret_123", "ENVIRONMENT": "production"}):
            res = self.client.post(
                "/run-experiment",
                json={"generator": "classical", "sample_size": 10},
                headers={"X-API-Key": "super_secret_123"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["data"]["generator"], "classical")

    def test_protected_routes_accept_valid_bearer_token(self):
        """Protected routes accept valid Authorization: Bearer <token>."""
        with patch.dict(os.environ, {"API_KEY": "super_secret_123", "ENVIRONMENT": "production"}):
            res = self.client.post(
                "/comparison/compare-rng",
                json={"sample_size": 10},
                headers={"Authorization": "Bearer super_secret_123"},
            )
            self.assertEqual(res.status_code, 200)
            data = res.json()
            self.assertTrue(data["success"])

    def test_fail_closed_in_production_when_api_key_is_unset(self):
        """In production mode, missing API_KEY in server environment must fail closed on protected routes."""
        env_without_key = {k: v for k, v in os.environ.items() if k != "API_KEY"}
        env_without_key["ENVIRONMENT"] = "production"

        with patch.dict(os.environ, env_without_key, clear=True):
            # Health check still works
            res_health = self.client.get("/health")
            self.assertEqual(res_health.status_code, 200)

            # Protected routes are blocked fail-closed
            res_protected = self.client.post("/run-experiment", json={"generator": "classical", "sample_size": 10})
            self.assertEqual(res_protected.status_code, 401)
            self.assertIn("Unauthorized", res_protected.json()["error"])

    def test_fail_closed_when_require_api_key_is_set(self):
        """When REQUIRE_API_KEY=true, missing API_KEY must fail closed."""
        env_without_key = {k: v for k, v in os.environ.items() if k != "API_KEY"}
        env_without_key["ENVIRONMENT"] = "development"
        env_without_key["REQUIRE_API_KEY"] = "true"

        with patch.dict(os.environ, env_without_key, clear=True):
            res = self.client.get("/experiments")
            self.assertEqual(res.status_code, 401)


if __name__ == "__main__":
    unittest.main()
