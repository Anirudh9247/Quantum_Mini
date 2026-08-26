from qiskit import QuantumCircuit, transpile
from qiskit.quantum_info import Statevector
import requests
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

MAX_QUBITS = 24

simulator = None
try:
    from qiskit_aer import AerSimulator
    simulator = AerSimulator()
except Exception as exc:
    logger.warning("Qiskit Aer simulator initialization failed (%s). Using Statevector fallback.", exc)
    simulator = None


def _generate_batch(size: int) -> str:
    if simulator is not None:
        qc = QuantumCircuit(size, size)
        qc.h(range(size))
        qc.measure(range(size), range(size))
        compiled = transpile(qc, simulator)
        job = simulator.run(compiled, shots=1)
        result = job.result()
        counts = result.get_counts()
        bitstring = list(counts.keys())[0]
        bitstring = bitstring.replace(" ", "")[::-1]
        return bitstring
    else:
        qc = QuantumCircuit(size)
        qc.h(range(size))
        sv = Statevector(qc)
        sampled = sv.sample_memory(1)[0]
        return str(sampled).replace(" ", "")[::-1]


def generate_qubits(sample_size: int) -> str:
    bits = ""
    max_batch = MAX_QUBITS if simulator is not None else 10

    while len(bits) < sample_size:
        batch_size = min(max_batch, sample_size - len(bits))
        batch_bits = _generate_batch(batch_size)
        bits += batch_bits

    # ✅ Trim to exact size in case last batch overshot
    return bits[:sample_size]


def generate_real_quantum_bits(n_bits: int) -> Tuple[str, bool]:
    """
    Fetches physical quantum random bits from ANU QRNG API.
    If the API is unavailable or times out, falls back to Qiskit Aer quantum simulator
    and returns (bitstring, is_simulated_fallback=True).
    """
    try:
        url = f"https://qrng.anu.edu.au/API/jsonI.php?length={n_bits}&type=uint8"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json().get("data", [])

        if not data:
            raise ValueError("Empty response data from ANU QRNG API")

        # Convert numbers → binary bits
        bits = ''.join(format(num, '08b') for num in data)

        return bits[:n_bits], False

    except Exception as e:
        print(f"[QRNG Service Warning] ANU Physical QRNG API unavailable ({e}). Falling back to Qiskit Aer simulator.")
        # Fallback to Qiskit Aer Simulator
        fallback_bits = generate_qubits(n_bits)
        return fallback_bits, True