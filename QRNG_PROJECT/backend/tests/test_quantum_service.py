import unittest
import sys
import os
from math import sqrt, pi
from unittest.mock import patch, MagicMock

# Ensure app package is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.quantum_service import generate_qubits, generate_real_quantum_bits
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector


SQRT2_INV = 1 / sqrt(2)


class TestBitGeneration(unittest.TestCase):
    """Gate A — Verifies Qiskit Aer generates well-formed bitstrings."""

    def test_batch_length(self):
        """Aer output has exactly the requested number of bits and only 0/1 chars."""
        for n in [1, 8, 32, 64, 100]:
            bits = generate_qubits(n)
            self.assertEqual(len(bits), n, f"Expected {n} bits, got {len(bits)}")
            self.assertTrue(all(b in '01' for b in bits))


class TestSingleQubitGates(unittest.TestCase):
    """
    Gate C — Full single-qubit gate regression matrix.

    Gate | Input | Expected output
    -----|-------|----------------
    I    | |0⟩  | |0⟩
    H    | |0⟩  | |+⟩  (α=β=1/√2)
    X    | |0⟩  | |1⟩
    Y    | |0⟩  | i|1⟩  (P(1)=1)
    Z    | |+⟩  | |−⟩  (α=1/√2, β=−1/√2)
    S    | |+⟩  | (|0⟩ + i|1⟩)/√2
    T    | |+⟩  | (|0⟩ + e^{iπ/4}|1⟩)/√2
    M    | |+⟩  | collapses to |0⟩ or |1⟩ with P=1
    """

    # ── Identity ────────────────────────────────────────────────────────────────
    def test_identity(self):
        """I|0⟩ = |0⟩: probability 1 at |0⟩."""
        qc = QuantumCircuit(1)
        sv = Statevector.from_instruction(qc)
        p = sv.probabilities_dict()
        self.assertAlmostEqual(p.get('0', 0), 1.0, places=10)
        self.assertAlmostEqual(p.get('1', 0), 0.0, places=10)

    # ── Hadamard ─────────────────────────────────────────────────────────────────
    def test_hadamard(self):
        """H|0⟩ = |+⟩: P(0)=P(1)=0.5, amplitudes ≈ 1/√2."""
        qc = QuantumCircuit(1)
        qc.h(0)
        sv = Statevector(qc)
        data = sv.data
        self.assertAlmostEqual(abs(data[0]) ** 2, 0.5, places=10, msg="P(|0⟩)≠0.5 after H")
        self.assertAlmostEqual(abs(data[1]) ** 2, 0.5, places=10, msg="P(|1⟩)≠0.5 after H")

    # ── Pauli-X ──────────────────────────────────────────────────────────────────
    def test_pauli_x(self):
        """X|0⟩ = |1⟩: P(1)=1."""
        qc = QuantumCircuit(1)
        qc.x(0)
        sv = Statevector(qc)
        p = sv.probabilities_dict()
        self.assertAlmostEqual(p.get('1', 0), 1.0, places=10)
        self.assertAlmostEqual(p.get('0', 0), 0.0, places=10)

    # ── Pauli-Y ──────────────────────────────────────────────────────────────────
    def test_pauli_y(self):
        """Y|0⟩ = i|1⟩: P(1)=1, complex phase i preserved."""
        qc = QuantumCircuit(1)
        qc.y(0)
        sv = Statevector(qc)
        data = sv.data
        p = sv.probabilities_dict()
        # Computational-basis: P(1)=1
        self.assertAlmostEqual(p.get('1', 0), 1.0, places=10)
        # Verify β carries phase +i: Im(β)≈1, Re(β)≈0
        self.assertAlmostEqual(data[1].imag, 1.0, places=10, msg="Y gate phase should be +i")
        self.assertAlmostEqual(data[1].real, 0.0, places=10)

    # ── Pauli-Z ──────────────────────────────────────────────────────────────────
    def test_pauli_z(self):
        """Z|+⟩ = |−⟩: α=1/√2, β=−1/√2 (phase flip on |1⟩ component)."""
        qc = QuantumCircuit(1)
        qc.h(0)   # |+⟩
        qc.z(0)   # Z|+⟩ = |−⟩
        sv = Statevector(qc)
        data = sv.data
        # Probabilities unchanged (Z only flips phase)
        p = sv.probabilities_dict()
        self.assertAlmostEqual(p.get('0', 0), 0.5, places=10)
        self.assertAlmostEqual(p.get('1', 0), 0.5, places=10)
        # But the |1⟩ amplitude must be negative real (phase = π)
        self.assertAlmostEqual(data[0].real,  SQRT2_INV, places=10, msg="α should be +1/√2")
        self.assertAlmostEqual(data[1].real, -SQRT2_INV, places=10, msg="β should be −1/√2")
        self.assertAlmostEqual(data[1].imag,  0.0,       places=10)

    # ── S gate ───────────────────────────────────────────────────────────────────
    def test_phase_s(self):
        """S|+⟩ = (|0⟩ + i|1⟩)/√2: β has phase +i."""
        qc = QuantumCircuit(1)
        qc.h(0)   # |+⟩
        qc.s(0)   # S applies phase e^{iπ/2} = i to |1⟩
        sv = Statevector(qc)
        data = sv.data
        p = sv.probabilities_dict()
        # Probabilities still 50/50
        self.assertAlmostEqual(p.get('0', 0), 0.5, places=10)
        self.assertAlmostEqual(p.get('1', 0), 0.5, places=10)
        # α is real +1/√2
        self.assertAlmostEqual(data[0].real, SQRT2_INV, places=10)
        self.assertAlmostEqual(data[0].imag, 0.0,       places=10)
        # β has phase +i: Re≈0, Im≈+1/√2
        self.assertAlmostEqual(data[1].real, 0.0,       places=10, msg="S gate: β.real should be ~0")
        self.assertAlmostEqual(data[1].imag, SQRT2_INV, places=10, msg="S gate: β.imag should be +1/√2")

    # ── T gate ───────────────────────────────────────────────────────────────────
    def test_phase_t(self):
        """T|+⟩ = (|0⟩ + e^{iπ/4}|1⟩)/√2: β has phase e^{iπ/4}."""
        from math import cos, sin
        qc = QuantumCircuit(1)
        qc.h(0)   # |+⟩
        qc.t(0)   # T applies phase e^{iπ/4}
        sv = Statevector(qc)
        data = sv.data
        p = sv.probabilities_dict()
        # Probabilities still 50/50
        self.assertAlmostEqual(p.get('0', 0), 0.5, places=10)
        self.assertAlmostEqual(p.get('1', 0), 0.5, places=10)
        # β amplitude = e^{iπ/4}/√2 = cos(π/4)/√2 + i·sin(π/4)/√2
        expected_re = cos(pi / 4) * SQRT2_INV
        expected_im = sin(pi / 4) * SQRT2_INV
        self.assertAlmostEqual(data[1].real, expected_re, places=10, msg="T gate: β.real mismatch")
        self.assertAlmostEqual(data[1].imag, expected_im, places=10, msg="T gate: β.imag mismatch")

    # ── Measurement collapse ──────────────────────────────────────────────────────
    def test_measurement_collapse(self):
        """M|+⟩ collapses to either |0⟩ or |1⟩ with Born-rule probability sum = 1."""
        from qiskit import transpile
        from qiskit_aer import AerSimulator
        qc = QuantumCircuit(1, 1)
        qc.h(0)
        qc.measure(0, 0)
        sim = AerSimulator()
        job = sim.run(transpile(qc, sim), shots=1000)
        counts = job.result().get_counts()
        total = sum(counts.values())
        # Only '0' and '1' are valid outcomes
        self.assertTrue(set(counts.keys()).issubset({'0', '1'}), "Unexpected measurement outcomes")
        # Born-rule: large-N approximate P≈0.5 each (within 10%)
        p0 = counts.get('0', 0) / total
        p1 = counts.get('1', 0) / total
        self.assertAlmostEqual(p0 + p1, 1.0, places=10)
        self.assertGreater(p0, 0.35, msg="H|0⟩ collapse: P(0) far from 50%")
        self.assertGreater(p1, 0.35, msg="H|0⟩ collapse: P(1) far from 50%")


class TestANUFallback(unittest.TestCase):
    """Unit tests for ANU QRNG fallback logic — fully mocked, no external network needed."""

    def test_anu_success(self):
        """When ANU responds correctly, bits returned are physical (is_fallback=False)."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"data": [77, 230, 117, 240]}
        mock_response.raise_for_status = MagicMock()
        with patch('app.services.quantum_service.requests.get', return_value=mock_response):
            bits, is_fallback = generate_real_quantum_bits(32)
        self.assertEqual(len(bits), 32)
        self.assertTrue(all(b in '01' for b in bits))
        self.assertFalse(is_fallback, "ANU success should return is_fallback=False")

    def test_anu_timeout_triggers_fallback(self):
        """When ANU times out, the Qiskit Aer fallback is activated."""
        import requests as req
        with patch('app.services.quantum_service.requests.get', side_effect=req.exceptions.Timeout):
            bits, is_fallback = generate_real_quantum_bits(32)
        self.assertEqual(len(bits), 32)
        self.assertTrue(all(b in '01' for b in bits))
        self.assertTrue(is_fallback, "Timeout should set is_fallback=True")

    def test_anu_http_error_triggers_fallback(self):
        """When ANU returns an HTTP error, fallback is activated."""
        import requests as req
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = req.exceptions.HTTPError("503")
        with patch('app.services.quantum_service.requests.get', return_value=mock_response):
            bits, is_fallback = generate_real_quantum_bits(32)
        self.assertEqual(len(bits), 32)
        self.assertTrue(is_fallback)

    def test_anu_malformed_response_triggers_fallback(self):
        """When ANU returns unexpected JSON (missing 'data'), fallback is activated."""
        mock_response = MagicMock()
        mock_response.json.return_value = {"error": "service unavailable"}
        mock_response.raise_for_status = MagicMock()
        with patch('app.services.quantum_service.requests.get', return_value=mock_response):
            bits, is_fallback = generate_real_quantum_bits(32)
        self.assertEqual(len(bits), 32)
        self.assertTrue(is_fallback)

    def test_anu_connection_error_triggers_fallback(self):
        """When ANU is unreachable (ConnectionError), fallback is activated."""
        import requests as req
        with patch('app.services.quantum_service.requests.get', side_effect=req.exceptions.ConnectionError):
            bits, is_fallback = generate_real_quantum_bits(32)
        self.assertEqual(len(bits), 32)
        self.assertTrue(is_fallback)


if __name__ == '__main__':
    unittest.main(verbosity=2)
