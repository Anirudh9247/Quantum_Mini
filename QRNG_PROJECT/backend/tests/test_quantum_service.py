import unittest
import sys
import os

# Ensure app package is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.quantum_service import generate_qubits, generate_real_quantum_bits
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector

class TestQuantumService(unittest.TestCase):
    def test_qiskit_aer_batch_length(self):
        """Verify Qiskit Aer generates requested number of random bits."""
        for sample_size in [1, 8, 32, 64, 100]:
            bits = generate_qubits(sample_size)
            self.assertEqual(len(bits), sample_size)
            self.assertTrue(all(b in '01' for b in bits))

    def test_quantum_statevector_formalism(self):
        """Verify fundamental Quantum Gate statevector transitions: H|0> = |+>."""
        # Initial state |0>
        qc = QuantumCircuit(1)
        sv0 = Statevector.from_instruction(qc)
        prob0 = sv0.probabilities_dict()
        self.assertAlmostEqual(prob0.get('0', 0), 1.0)
        
        # Apply Hadamard H|0> = |+> = (|0> + |1>)/sqrt(2)
        qc.h(0)
        sv_h = Statevector.from_instruction(qc)
        prob_h = sv_h.probabilities_dict()
        self.assertAlmostEqual(prob_h.get('0', 0), 0.5)
        self.assertAlmostEqual(prob_h.get('1', 0), 0.5)

        # Apply Pauli-X (NOT gate): X|0> = |1>
        qc_x = QuantumCircuit(1)
        qc_x.x(0)
        sv_x = Statevector.from_instruction(qc_x)
        prob_x = sv_x.probabilities_dict()
        self.assertAlmostEqual(prob_x.get('1', 0), 1.0)

    def test_anu_qrng_fallback_behavior(self):
        """Verify ANU QRNG returns valid binary bitstring or gracefully falls back to simulator."""
        res, is_fallback = generate_real_quantum_bits(32)
        self.assertEqual(len(res), 32)
        self.assertTrue(all(b in '01' for b in res))
        self.assertIsInstance(is_fallback, bool)

if __name__ == '__main__':
    unittest.main()
