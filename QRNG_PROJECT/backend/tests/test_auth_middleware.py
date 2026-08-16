import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app


class TestAuthMiddleware(unittest.TestCase):
    def setUp(self):
        os.environ.pop('ENVIRONMENT', None)
        os.environ.pop('REQUIRE_API_KEY', None)
        os.environ.pop('K_SERVICE', None)

    def test_public_health_route_is_open_without_key(self):
        with patch('app.main.API_KEY', None), patch('app.main.require_api_key', return_value=False):
            from fastapi.testclient import TestClient
            client = TestClient(app)
            response = client.get('/health')
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['status'], 'ok')

    def test_missing_api_key_fails_closed_in_production(self):
        os.environ['ENVIRONMENT'] = 'production'
        with patch('app.main.API_KEY', None), patch('app.main.require_api_key', return_value=True):
            from fastapi.testclient import TestClient
            client = TestClient(app)
            response = client.post('/run-experiment', json={'generator': 'classical', 'sample_size': 8})
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.json()['error'], 'Unauthorized')

    def test_valid_api_key_allows_access(self):
        with patch('app.main.API_KEY', 'supersecret'), patch('app.main.require_api_key', return_value=True):
            from fastapi.testclient import TestClient
            client = TestClient(app)
            response = client.post('/run-experiment', json={'generator': 'classical', 'sample_size': 8}, headers={'x-api-key': 'supersecret'})
            self.assertEqual(response.status_code, 200)

    def test_invalid_api_key_is_rejected(self):
        with patch('app.main.API_KEY', 'supersecret'), patch('app.main.require_api_key', return_value=True):
            from fastapi.testclient import TestClient
            client = TestClient(app)
            response = client.post('/run-experiment', json={'generator': 'classical', 'sample_size': 8}, headers={'x-api-key': 'wrong'})
            self.assertEqual(response.status_code, 401)
            self.assertEqual(response.json()['error'], 'Unauthorized')


if __name__ == '__main__':
    unittest.main()
